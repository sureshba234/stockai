'use server';
/**
 * @fileOverview Fetches detailed stock data from an external API, with a fallback to mock data.
 *
 * - getStockData - A function that fetches stock data.
 */

import {ai} from '@/ai/genkit';
import { z } from 'genkit';
import { StockDataInputSchema, StockDataOutputSchema, type StockDataInput, type StockDataOutput } from '@/ai/schemas/stock-data';
import { generateMockStockData } from '@/lib/mock-stock-data';


export async function getStockData(input: StockDataInput): Promise<StockDataOutput | null> {
  return getStockDataFlow(input);
}

// In a real application, this would call an external financial data API.
const getStockDataTool = ai.defineTool(
    {
        name: 'getStockDataTool',
        description: 'Retrieves detailed data for a given stock ticker, trying Finnhub first, then Alpha Vantage, and falling back to mock data.',
        inputSchema: StockDataInputSchema,
        outputSchema: z.union([StockDataOutputSchema, z.null()]),
    },
    async ({ ticker }) => {
        // Attempt to fetch from Finnhub first
        try {
            console.log(`Attempting to fetch data for ${ticker} from Finnhub...`);
            const finnhubData = await fetchFromFinnhub(ticker);
            console.log(`Successfully fetched data for ${ticker} from Finnhub.`);
            return finnhubData;
        } catch (finnhubError: any) {
            console.warn(`Finnhub fetch failed for ${ticker}: ${finnhubError.message}. Trying Alpha Vantage...`);
            // If Finnhub fails, try Alpha Vantage
            try {
                console.log(`Attempting to fetch data for ${ticker} from Alpha Vantage...`);
                const alphaVantageData = await fetchFromAlphaVantage(ticker);
                 console.log(`Successfully fetched data for ${ticker} from Alpha Vantage.`);
                return alphaVantageData;
            } catch (alphaVantageError: any) {
                console.error(`Alpha Vantage fetch also failed for ${ticker}: ${alphaVantageError.message}. Falling back to mock data.`);
                // If both fail, use mock data
                return generateMockStockData(ticker);
            }
        }
    }
);

async function fetchFromFinnhub(ticker: string): Promise<StockDataOutput> {
    const apiKey = process.env.FINNHUB_API_KEY;
     if (!apiKey || apiKey === 'YOUR_API_KEY' || !apiKey.trim()) {
        throw new Error("Finnhub API key not configured.");
    }
    const BASE_URL = 'https://finnhub.io/api/v1';

    const get = async (path: string, params: Record<string, string> = {}) => {
        const url = new URL(`${BASE_URL}${path}`);
        url.search = new URLSearchParams({...params, token: apiKey}).toString();
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Finnhub API request for ${path} failed with status ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
             throw new Error(`Finnhub API error for ${path}: ${data.error}`);
        }
        return data;
    }
    
    // Perform all API calls in parallel
    const [profile, quote, news] = await Promise.all([
        get('/stock/profile2', { symbol: ticker }),
        get('/quote', { symbol: ticker }),
        get('/company-news', { symbol: ticker, from: getOneMonthAgoDate(), to: getTodayDate() })
    ]);

    if (!profile.ticker) {
        throw new Error(`Could not retrieve company profile for ${ticker}. The ticker may be invalid.`);
    }

    const today = new Date();
    const oneYearAgo = new Date(new Date().setFullYear(today.getFullYear() - 1));
    const candle = await get('/stock/candle', {
      symbol: ticker,
      resolution: 'D',
      from: Math.floor(oneYearAgo.getTime() / 1000).toString(),
      to: Math.floor(today.getTime() / 1000).toString(),
    });

    if (!candle.c) {
       throw new Error(`Could not retrieve chart data for ${ticker}.`);
    }

    const chartData = candle.t.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        price: parseFloat(candle.c[index].toFixed(2)),
    })).slice(-90);

    const price = quote.c?.toFixed(2);
    const change = quote.d?.toFixed(2);
    const changePercent = quote.dp?.toFixed(2);
    const isUp = quote.d ? quote.d >= 0 : false;
    
    // Generate AI prediction
    const predictionPrompt = `
        You are a financial analyst. Based on the following data for ${profile.name} (${ticker}), provide a short, one-paragraph prediction for the stock\'s future performance. 
        Do not use markdown or formatting. Be concise.
        Current Price: $${price}
        Today\'s Change: ${change} (${changePercent}%)
        Recent News:
        ${news.slice(0, 2).map((n: any) => `- ${n.headline}`).join('\n')}
    `;
    
    const {text} = await ai.generate({
        prompt: predictionPrompt,
        model: 'googleai/gemini-2.0-flash'
    });
    const predictions = text || "AI-powered predictions are currently unavailable.";

    return {
        name: profile.name || ticker,
        ticker: profile.ticker,
        price,
        change,
        changePercent: `${changePercent}%`,
        isUp,
        chartData,
        fundamentalsData: [
            { label: "Market Cap", value: formatNumber(profile.marketCapitalization) },
            { label: "Shares", value: formatNumber(profile.shareOutstanding) },
            { label: "Industry", value: profile.finnhubIndustry || 'N/A' },
            { label: "Website", value: profile.weburl || 'N/A' },
        ],
        news: news.slice(0, 5).map((item: any) => ({
            title: item.headline,
            source: item.source,
            url: item.url,
            publishedAt: new Date(item.datetime * 1000).toISOString().split('T')[0],
        })),
        predictions
    };
}


async function fetchFromAlphaVantage(ticker: string): Promise<StockDataOutput> {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY' || !apiKey.trim()) {
        throw new Error(`Alpha Vantage API key not configured.`);
    }

    const BASE_URL = 'https://www.alphavantage.co/query';

    const get = async (params: Record<string, string> = {}) => {
        const url = new URL(BASE_URL);
        url.search = new URLSearchParams({...params, apikey: apiKey}).toString();
        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`Alpha Vantage API request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (data.Note || data['Error Message']) {
            throw new Error(`Alpha Vantage API limit reached or invalid ticker: ${data.Note || data['Error Message']}`);
        }
        return data;
    }
    
    // Perform all API calls in parallel
    const [overviewData, quoteData, chartDataRaw, newsData] = await Promise.all([
        get({ function: 'OVERVIEW', symbol: ticker }),
        get({ function: 'GLOBAL_QUOTE', symbol: ticker }).then(d => d['Global Quote']),
        get({ function: 'TIME_SERIES_DAILY', symbol: ticker }).then(d => d['Time Series (Daily)']),
        get({ function: 'NEWS_SENTIMENT', tickers: ticker }).then(d => d.feed || [])
    ]);

    if (!overviewData.Symbol || !quoteData || Object.keys(quoteData).length === 0 || !chartDataRaw) {
        throw new Error('Incomplete data received from Alpha Vantage.');
    }

    const chartData = Object.entries(chartDataRaw).slice(0, 90).map(([date, data]) => ({
        date,
        price: parseFloat((data as any)['4. close']),
    })).reverse();
    
    const fundamentalsData = [
        { label: "Market Cap", value: formatNumber(parseFloat(overviewData.MarketCapitalization)) },
        { label: "P/E Ratio", value: overviewData.PERatio || 'N/A' },
        { label: "EPS", value: overviewData.EPS || 'N/A' },
        { label: "Revenue (TTM)", value: formatNumber(parseFloat(overviewData.RevenueTTM)) },
    ];

    const news = newsData.map((item: any) => ({
        title: item.title,
        source: item.source,
        url: item.url,
        publishedAt: formatNewsDate(item.time_published),
    }));
    
    const rawChangePercent = quoteData['10. change_percent'];
    const price = parseFloat(quoteData['05. price']).toFixed(2);
    const change = parseFloat(quoteData['09. change']).toFixed(2);
    const changePercent = rawChangePercent ? parseFloat(rawChangePercent.replace('%','')).toFixed(2) : '0.00';
    const isUp = parseFloat(change) >= 0;

    // Generate AI prediction
    const predictionPrompt = `
        You are a financial analyst. Based on the following data for ${overviewData.Name} (${ticker}), provide a short, one-paragraph prediction for the stock\'s future performance. 
        Do not use markdown or formatting.
        Current Price: $${price}
        Today\'s Change: ${change} (${changePercent}%)
        Recent News:
        ${news.slice(0, 2).map(n => `- ${n.title}`).join('\n')}
    `;
    
    const {text} = await ai.generate({
        prompt: predictionPrompt,
        model: 'googleai/gemini-2.0-flash'
    });
    const predictions = text || "AI-powered predictions are currently unavailable.";

    return {
        name: overviewData.Name,
        ticker: overviewData.Symbol,
        price: price,
        change: change,
        changePercent: `${changePercent}%`,
        isUp: isUp,
        chartData,
        fundamentalsData,
        news,
        predictions
    };
}


const getStockDataFlow = ai.defineFlow(
  {
    name: 'getStockDataFlow',
    inputSchema: StockDataInputSchema,
    outputSchema: z.union([StockDataOutputSchema, z.null()]),
  },
  async (input) => {
    return await getStockDataTool(input);
  }
);


// Helper functions for formatting
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function getOneMonthAgoDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
}


function formatNumber(num: number): string {
    if (num === null || num === undefined || isNaN(num)) return "N/A";
    if (num >= 1_000_000_000_000) {
        return (num / 1_000_000_000_000).toFixed(2) + 'T';
    }
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(2) + 'B';
    }
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(2) + 'M';
    }
    return num.toLocaleString();
}

function formatNewsDate(alphaVantageDate: string): string {
    // Format: YYYYMMDDTHHMMSS
    if (!alphaVantageDate || alphaVantageDate.length < 8) return "N/A";
    const year = alphaVantageDate.substring(0, 4);
    const month = alphaVantageDate.substring(4, 6);
    const day = alphaVantageDate.substring(6, 8);
    return `${year}-${month}-${day}`;
}
