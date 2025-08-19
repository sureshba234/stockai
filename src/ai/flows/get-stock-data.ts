
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


async function generateAIPrediction(ticker: string, name: string, price: string, change: string, changePercent: string, news: any[]): Promise<string> {
    const predictionPrompt = `
        You are a financial analyst. Based on the following data for ${name} (${ticker}), provide a short, one-paragraph prediction for the stock\'s future performance. 
        Do not use markdown or formatting. Be concise.
        Current Price: $${price}
        Today\'s Change: ${change} (${changePercent})
        Recent News:
        ${news.slice(0, 2).map((n: any) => `- ${n.title}`).join('\n')}
    `;
    
    try {
        const {text} = await ai.generate({
            prompt: predictionPrompt,
            model: 'googleai/gemini-2.0-flash'
        });
        const predictionText = text || "AI-powered predictions are currently unavailable.";
        // Add disclaimer here
        return `${predictionText} This is not financial advice. All predictions are for informational purposes only.`;
    } catch (e) {
        console.error("AI prediction generation failed", e);
        return "AI-powered predictions are currently unavailable at this time.";
    }
}


const getStockDataTool = ai.defineTool(
    {
        name: 'getStockDataTool',
        description: 'Retrieves detailed data for a given stock ticker, trying a chain of APIs and falling back to mock data.',
        inputSchema: StockDataInputSchema,
        outputSchema: z.union([StockDataOutputSchema, z.null()]),
    },
    async ({ ticker }) => {
        const providers = [
            { name: "Polygon.io", fetcher: fetchFromPolygon },
            { name: "Financial Modeling Prep", fetcher: fetchFromFMP },
            { name: "Finnhub", fetcher: fetchFromFinnhub },
            { name: "Twelve Data", fetcher: fetchFromTwelveData },
            { name: "Alpha Vantage", fetcher: fetchFromAlphaVantage },
            { name: "Marketstack", fetcher: fetchFromMarketstack },
        ];

        for (const provider of providers) {
            try {
                console.log(`Attempting to fetch data for ${ticker} from ${provider.name}...`);
                const data = await provider.fetcher(ticker);
                console.log(`Successfully fetched data for ${ticker} from ${provider.name}.`);
                return { ...data, dataSource: 'live' as const };
            } catch (error: any) {
                console.warn(`${provider.name} fetch failed for ${ticker}: ${error.message}. Trying next provider...`);
            }
        }

        console.error(`All API providers failed for ${ticker}. Falling back to mock data.`);
        return generateMockStockData(ticker);
    }
);


// #region API Fetchers

async function fetchFromPolygon(ticker: string): Promise<Omit<StockDataOutput, 'dataSource'>> {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey || !apiKey.trim()) throw new Error("Polygon.io API key not configured.");

    const get = async (path: string, params: Record<string, string> = {}) => {
        const url = new URL(`https://api.polygon.io${path}`);
        url.search = new URLSearchParams({ ...params, apiKey }).toString();
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Polygon API request for ${path} failed with status ${res.status}`);
        const data = await res.json();
        if (data.status !== 'OK') throw new Error(`Polygon API error for ${path}: ${data.error || data.message}`);
        return data;
    }

    const to = getTodayDate();
    const from = getDateMonthsAgo(3);

    const [details, prevDay, news, aggregates] = await Promise.all([
        get(`/v3/reference/tickers/${ticker}`),
        get(`/v2/aggs/ticker/${ticker}/prev`),
        get(`/v2/reference/news`, { ticker }),
        get(`/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}`, { sort: 'asc', limit: '90' })
    ]);

    const profile = details.results;
    const quote = prevDay.results?.[0];
    if (!profile || !quote) throw new Error("Could not retrieve profile or quote from Polygon.");
    
    const price = quote.c.toFixed(2);
    const change = (quote.c - quote.o).toFixed(2);
    const changePercent = (((quote.c - quote.o) / quote.o) * 100).toFixed(2);
    const isUp = parseFloat(change) >= 0;

    const chartData = (aggregates.results || []).map((agg: any) => ({
        date: new Date(agg.t).toISOString().split('T')[0],
        price: parseFloat(agg.c.toFixed(2)),
        volume: agg.v,
    }));

    const newsData = (news.results || []).slice(0, 5).map((item: any) => ({
        title: item.title,
        source: item.publisher?.name || 'N/A',
        url: item.article_url,
        publishedAt: new Date(item.published_utc).toISOString().split('T')[0],
    }));

    const predictions = await generateAIPrediction(ticker, profile.name, price, change, `${changePercent}%`, newsData);

    return {
        name: profile.name,
        ticker: profile.ticker,
        price,
        change,
        changePercent: `${changePercent}%`,
        isUp,
        chartData,
        fundamentalsData: [
            { label: "Market Cap", value: formatNumber(profile.market_cap) },
            { label: "Shares", value: formatNumber(profile.share_class_shares_outstanding) },
            { label: "Industry", value: profile.sic_description || 'N/A' },
            { label: "Website", value: profile.homepage_url || 'N/A' },
        ],
        news: newsData,
        predictions,
    };
}


async function fetchFromFMP(ticker: string): Promise<Omit<StockDataOutput, 'dataSource'>> {
    const apiKey = process.env.FINANCIAL_MODELING_PREP_API_KEY;
    if (!apiKey || !apiKey.trim()) throw new Error("Financial Modeling Prep API key not configured.");

    const get = async (path: string, params: Record<string, string> = {}) => {
        const url = new URL(`https://financialmodelingprep.com/api${path}`);
        url.search = new URLSearchParams({ ...params, apikey: apiKey }).toString();
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`FMP API request for ${path} failed with status ${res.status}`);
        const data = await res.json();
        if (data["Error Message"]) throw new Error(`FMP API error: ${data["Error Message"]}`);
        return data;
    }

    const to = getTodayDate();
    const from = getDateMonthsAgo(3);

    const [profile, quote, news, history] = await Promise.all([
        get(`/v3/profile/${ticker}`),
        get(`/v3/quote/${ticker}`),
        get(`/v1/stock_news`, { tickers: ticker, limit: 5 }),
        get(`/v3/historical-price-full/${ticker}`, { from, to }),
    ]);

    const profileData = profile[0];
    const quoteData = quote[0];
    if (!profileData || !quoteData) throw new Error("Could not retrieve profile or quote from FMP.");

    const price = quoteData.price.toFixed(2);
    const change = quoteData.change.toFixed(2);
    const changePercent = quoteData.changesPercentage.toFixed(2);
    const isUp = quoteData.change >= 0;

    const chartData = (history.historical || []).map((day: any) => ({
        date: day.date,
        price: parseFloat(day.close.toFixed(2)),
        volume: day.volume,
    })).reverse();

    const newsData = news.map((item: any) => ({
        title: item.title,
        source: item.site,
        url: item.url,
        publishedAt: item.publishedDate.split(' ')[0],
    }));

    const predictions = await generateAIPrediction(ticker, profileData.companyName, price, change, `${changePercent}%`, newsData);

    return {
        name: profileData.companyName,
        ticker: profileData.symbol,
        price,
        change,
        changePercent: `${changePercent}%`,
        isUp,
        chartData,
        fundamentalsData: [
            { label: "Market Cap", value: formatNumber(profileData.mktCap) },
            { label: "Volume", value: formatNumber(profileData.volume) },
            { label: "Industry", value: profileData.industry || 'N/A' },
            { label: "Website", value: profileData.website || 'N/A' },
        ],
        news: newsData,
        predictions,
    };
}


async function fetchFromFinnhub(ticker: string): Promise<Omit<StockDataOutput, 'dataSource'>> {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey || !apiKey.trim()) throw new Error("Finnhub API key not configured.");
    
    const BASE_URL = 'https://finnhub.io/api/v1';
    const get = async (path: string, params: Record<string, string> = {}) => {
        const url = new URL(`${BASE_URL}${path}`);
        url.search = new URLSearchParams({...params, token: apiKey}).toString();
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Finnhub API request for ${path} failed with status ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(`Finnhub API error for ${path}: ${data.error}`);
        return data;
    }
    
    const [profile, quote, news] = await Promise.all([
        get('/stock/profile2', { symbol: ticker }),
        get('/quote', { symbol: ticker }),
        get('/company-news', { symbol: ticker, from: getDateMonthsAgo(1), to: getTodayDate() })
    ]);

    if (!profile.ticker) throw new Error(`Could not retrieve company profile for ${ticker}.`);

    const candle = await get('/stock/candle', {
      symbol: ticker,
      resolution: 'D',
      from: Math.floor(new Date(getDateMonthsAgo(3)).getTime() / 1000).toString(),
      to: Math.floor(new Date().getTime() / 1000).toString(),
    });

    if (!candle.c) throw new Error(`Could not retrieve chart data for ${ticker}.`);

    const chartData = candle.t.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        price: parseFloat(candle.c[index].toFixed(2)),
        volume: candle.v[index],
    }));

    const price = quote.c?.toFixed(2);
    const change = quote.d?.toFixed(2);
    const changePercent = quote.dp?.toFixed(2);
    const isUp = quote.d ? quote.d >= 0 : false;
    const newsData = news.slice(0, 5).map((item: any) => ({
        title: item.headline, source: item.source, url: item.url,
        publishedAt: new Date(item.datetime * 1000).toISOString().split('T')[0],
    }));
    
    const predictions = await generateAIPrediction(ticker, profile.name, price, change, `${changePercent}%`, newsData);

    return {
        name: profile.name || ticker,
        ticker: profile.ticker,
        price, change, changePercent: `${changePercent}%`, isUp, chartData,
        fundamentalsData: [
            { label: "Market Cap", value: formatNumber(profile.marketCapitalization) },
            { label: "Shares", value: formatNumber(profile.shareOutstanding) },
            { label: "Industry", value: profile.finnhubIndustry || 'N/A' },
            { label: "Website", value: profile.weburl || 'N/A' },
        ],
        news: newsData,
        predictions
    };
}


async function fetchFromTwelveData(ticker: string): Promise<Omit<StockDataOutput, 'dataSource'>> {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey || !apiKey.trim()) throw new Error("Twelve Data API key not configured.");
    
    const get = async (path: string, params: Record<string, string> = {}) => {
        const url = new URL(`https://api.twelvedata.com${path}`);
        url.search = new URLSearchParams({ symbol: ticker, ...params, apikey: apiKey }).toString();
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Twelve Data API request for ${path} failed with status ${res.status}`);
        const data = await res.json();
        if (data.code > 200) throw new Error(`Twelve Data API error: ${data.message}`);
        return data;
    }
    
    const [profile, quote, news, timeSeries] = await Promise.all([
        get('/profile'),
        get('/quote'),
        get('/news', { limit: '5'}),
        get('/time_series', { interval: '1day', outputsize: '90' }),
    ]);

    if (!profile.name || !quote.change) throw new Error("Could not retrieve profile or quote from Twelve Data.");
    
    const price = parseFloat(quote.close).toFixed(2);
    const change = parseFloat(quote.change).toFixed(2);
    const changePercent = parseFloat(quote.percent_change).toFixed(2);
    const isUp = parseFloat(change) >= 0;

    const chartData = (timeSeries.values || []).map((item: any) => ({
        date: item.datetime,
        price: parseFloat(item.close),
        volume: parseInt(item.volume, 10),
    })).reverse();
    
    const newsData = (news.articles || []).map((item: any) => ({
        title: item.title,
        source: item.source,
        url: item.url,
        publishedAt: new Date(item.datetime * 1000).toISOString().split('T')[0],
    }));

    const predictions = await generateAIPrediction(ticker, profile.name, price, change, `${changePercent}%`, newsData);

    return {
        name: profile.name,
        ticker: profile.symbol,
        price, change, changePercent: `${changePercent}%`, isUp, chartData,
        fundamentalsData: [
            { label: "Exchange", value: profile.exchange },
            { label: "Currency", value: profile.currency },
            { label: "Industry", value: profile.industry },
            { label: "Website", value: profile.website },
        ],
        news: newsData,
        predictions,
    };
}


async function fetchFromAlphaVantage(ticker: string): Promise<Omit<StockDataOutput, 'dataSource'>> {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey || !apiKey.trim()) throw new Error(`Alpha Vantage API key not configured.`);

    const get = async (params: Record<string, string> = {}) => {
        const url = new URL('https://www.alphavantage.co/query');
        url.search = new URLSearchParams({...params, apikey: apiKey}).toString();
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Alpha Vantage API request failed with status ${response.status}`);
        const data = await response.json();
        if (data.Note || data['Error Message']) throw new Error(`Alpha Vantage API limit reached or error: ${data.Note || data['Error Message']}`);
        return data;
    }
    
    const [overviewData, quoteData, chartDataRaw, newsData] = await Promise.all([
        get({ function: 'OVERVIEW', symbol: ticker }),
        get({ function: 'GLOBAL_QUOTE', symbol: ticker }).then(d => d['Global Quote']),
        get({ function: 'TIME_SERIES_DAILY', symbol: ticker }).then(d => d['Time Series (Daily)']),
        get({ function: 'NEWS_SENTIMENT', tickers: ticker, limit: 5 }).then(d => d.feed || [])
    ]);

    if (!overviewData.Symbol || !quoteData || Object.keys(quoteData).length === 0 || !chartDataRaw) {
        throw new Error('Incomplete data received from Alpha Vantage.');
    }

    const chartData = Object.entries(chartDataRaw).slice(0, 90).map(([date, data]) => ({
        date,
        price: parseFloat((data as any)['4. close']),
        volume: parseInt((data as any)['5. volume'], 10)
    })).reverse();
    
    const news = newsData.map((item: any) => ({
        title: item.title, source: item.source, url: item.url,
        publishedAt: formatNewsDate(item.time_published),
    }));
    
    const rawChangePercent = quoteData['10. change_percent'];
    const price = parseFloat(quoteData['05. price']).toFixed(2);
    const change = parseFloat(quoteData['09. change']).toFixed(2);
    const changePercent = rawChangePercent ? parseFloat(rawChangePercent.replace('%','')).toFixed(2) : '0.00';
    const isUp = parseFloat(change) >= 0;

    const predictions = await generateAIPrediction(ticker, overviewData.Name, price, change, `${changePercent}%`, news);

    return {
        name: overviewData.Name,
        ticker: overviewData.Symbol,
        price, change, changePercent: `${changePercent}%`, isUp, chartData,
        fundamentalsData: [
            { label: "Market Cap", value: formatNumber(parseFloat(overviewData.MarketCapitalization)) },
            { label: "P/E Ratio", value: overviewData.PERatio || 'N/A' },
            { label: "EPS", value: overviewData.EPS || 'N/A' },
            { label: "Revenue (TTM)", value: formatNumber(parseFloat(overviewData.RevenueTTM)) },
        ],
        news,
        predictions
    };
}

async function fetchFromMarketstack(ticker: string): Promise<Omit<StockDataOutput, 'dataSource'>> {
    const apiKey = process.env.MARKETSTACK_API_KEY;
    if (!apiKey || !apiKey.trim()) throw new Error("Marketstack API key not configured.");
    
    const get = async (path: string, params: Record<string, string> = {}) => {
        const url = new URL(`https://api.marketstack.com/v1${path}`);
        url.search = new URLSearchParams({ ...params, access_key: apiKey }).toString();
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Marketstack API request failed: ${res.status}`);
        const json = await res.json();
        if (json.error) throw new Error(`Marketstack API error: ${json.error.message}`);
        return json;
    };
    
    const [eodData, tickerData, newsData] = await Promise.all([
        get('/eod', { symbols: ticker, limit: '90' }),
        get('/tickers', { symbols: ticker }),
        get('/news', { tickers: ticker, limit: '5' })
    ]);
    
    const dailyData = eodData.data;
    const profile = tickerData.data[0];
    if (!dailyData || dailyData.length < 2 || !profile) throw new Error("Incomplete data from Marketstack");
    
    const latest = dailyData[0];
    const previous = dailyData[1];
    
    const price = latest.close.toFixed(2);
    const change = (latest.close - previous.close).toFixed(2);
    const changePercent = ((change / previous.close) * 100).toFixed(2);
    const isUp = parseFloat(change) >= 0;
    
    const chartData = dailyData.map((d: any) => ({
        date: d.date.split('T')[0],
        price: parseFloat(d.close.toFixed(2)),
        volume: d.volume,
    })).reverse();
    
    const news = (newsData.data || []).map((item: any) => ({
        title: item.title,
        source: item.source,
        url: item.url,
        publishedAt: item.published_at.split('T')[0],
    }));

    const predictions = await generateAIPrediction(ticker, profile.name, price, change, `${changePercent}%`, news);
    
    return {
        name: profile.name,
        ticker: profile.symbol,
        price, change, changePercent: `${changePercent}%`, isUp, chartData,
        fundamentalsData: [
            { label: "Exchange", value: profile.stock_exchange?.acronym || 'N/A' },
            { label: "Market Cap", value: "N/A" },
            { label: "P/E Ratio", value: "N/A" },
            { label: "EPS", value: "N/A" },
        ],
        news,
        predictions
    };
}


// #endregion

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


// #region Helper functions
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function getDateMonthsAgo(months: number) {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date.toISOString().split('T')[0];
}


function formatNumber(num: number): string {
    if (num === null || num === undefined || isNaN(num)) return "N/A";
    if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + 'T';
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    return num.toLocaleString();
}

function formatNewsDate(alphaVantageDate: string): string {
    if (!alphaVantageDate || alphaVantageDate.length < 8) return "N/A";
    const year = alphaVantageDate.substring(0, 4);
    const month = alphaVantageDate.substring(4, 6);
    const day = alphaVantageDate.substring(6, 8);
    return `${year}-${month}-${day}`;
}
// #endregion
