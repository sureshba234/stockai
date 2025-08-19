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
        description: 'Retrieves detailed data for a given stock ticker from Alpha Vantage.',
        inputSchema: StockDataInputSchema,
        outputSchema: z.union([StockDataOutputSchema, z.null()]),
    },
    async ({ ticker }) => {
        const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
        if (!apiKey || apiKey === 'YOUR_API_KEY' || !apiKey.trim()) {
            console.warn(`Alpha Vantage API key not configured. Falling back to mock data for ${ticker}.`);
            return generateMockStockData(ticker);
        }

        const BASE_URL = 'https://www.alphavantage.co/query';

        try {
            // Fetch company overview for fundamentals and name
            const overviewResponse = await fetch(`${BASE_URL}?function=OVERVIEW&symbol=${ticker}&apikey=${apiKey}`);
            if (!overviewResponse.ok) throw new Error(`Alpha Vantage OVERVIEW API request failed with status ${overviewResponse.status}`);
            const overviewData = await overviewResponse.json();
             if (overviewData.Note || !overviewData.Symbol) {
                 throw new Error(`Could not retrieve company overview for ${ticker}. The ticker may be invalid or the API limit might have been reached.`);
            }

            // Fetch global quote for price, change
            const quoteResponse = await fetch(`${BASE_URL}?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`);
             if (!quoteResponse.ok) throw new Error(`Alpha Vantage GLOBAL_QUOTE API request failed with status ${quoteResponse.status}`);
            const quoteData = (await quoteResponse.json())['Global Quote'];
             if (!quoteData || Object.keys(quoteData).length === 0) {
                throw new Error(`Could not retrieve quote data for ${ticker}. The ticker may be invalid or the API limit might have been reached.`);
            }
            
            // Fetch daily time series for the chart
            const chartResponse = await fetch(`${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${apiKey}`);
             if (!chartResponse.ok) throw new Error(`Alpha Vantage TIME_SERIES_DAILY API request failed with status ${chartResponse.status}`);
            const chartDataRaw = (await chartResponse.json())['Time Series (Daily)'];
            if (!chartDataRaw) {
              throw new Error(`Could not retrieve chart data for ${ticker}. The ticker may be invalid or the API limit might have been reached.`);
            }

            // Fetch news
            const newsResponse = await fetch(`${BASE_URL}?function=NEWS_SENTIMENT&tickers=${ticker}&limit=5&apikey=${apiKey}`);
            if (!newsResponse.ok) throw new Error(`Alpha Vantage NEWS_SENTIMENT API request failed with status ${newsResponse.status}`);
            const newsData = (await newsResponse.json()).feed || [];

            // Process and format the data to match our schema
            const chartData = chartDataRaw 
                ? Object.entries(chartDataRaw).slice(0, 90).map(([date, data]) => ({
                    date,
                    price: parseFloat((data as any)['4. close']),
                })).reverse()
                : [];
            
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

        } catch (error) {
            console.error(`API call failed for ${ticker}, falling back to mock data:`, error);
            return generateMockStockData(ticker);
        }
    }
);

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
    return num.toString();
}

function formatNewsDate(alphaVantageDate: string): string {
    // Format: YYYYMMDDTHHMMSS
    if (!alphaVantageDate || alphaVantageDate.length < 8) return "N/A";
    const year = alphaVantageDate.substring(0, 4);
    const month = alphaVantageDate.substring(4, 6);
    const day = alphaVantageDate.substring(6, 8);
    return `${year}-${month}-${day}`;
}
