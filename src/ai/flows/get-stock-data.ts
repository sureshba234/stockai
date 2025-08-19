'use server';
/**
 * @fileOverview Fetches detailed stock data from an external API.
 *
 * - getStockData - A function that fetches stock data.
 * - StockDataInput - The input type for the getStockData function.
 * - StockDataOutput - The return type for the getStockData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const StockDataInputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol (e.g., AAPL, GOOGL).'),
});
export type StockDataInput = z.infer<typeof StockDataInputSchema>;

const StockChartDataSchema = z.object({
  date: z.string(),
  price: z.number(),
});

const StockFundamentalsSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const StockNewsSchema = z.object({
  title: z.string(),
  source: z.string(),
  url: z.string().url(),
  publishedAt: z.string(),
});

export const StockDataOutputSchema = z.object({
    name: z.string(),
    ticker: z.string(),
    price: z.string(),
    change: z.string(),
    changePercent: z.string(),
    isUp: z.boolean(),
    chartData: z.array(StockChartDataSchema),
    fundamentalsData: z.array(StockFundamentalsSchema),
    news: z.array(StockNewsSchema).optional(),
    predictions: z.string().optional().describe("AI-generated prediction for the stock.")
});
export type StockDataOutput = z.infer<typeof StockDataOutputSchema>;

export async function getStockData(input: StockDataInput): Promise<StockDataOutput> {
  return getStockDataFlow(input);
}

// Placeholder implementation for fetching stock data.
// In a real application, this would call an external financial data API.
const getStockDataTool = ai.defineTool(
    {
        name: 'getStockDataTool',
        description: 'Retrieves detailed data for a given stock ticker.',
        inputSchema: StockDataInputSchema,
        outputSchema: StockDataOutputSchema,
    },
    async ({ ticker }) => {
        console.log(`Fetching mock data for ticker: ${ticker}`);

        // Mock data structure - this would be replaced by a real API call
        const allStockData: { [key: string]: StockDataOutput } = {
            "AAPL": {
                name: "Apple Inc.",
                ticker: "AAPL",
                price: "214.29",
                change: "+4.59",
                changePercent: "+2.19%",
                isUp: true,
                chartData: [
                  { date: '2024-07-01', price: 200 },
                  { date: '2024-07-02', price: 205 },
                  { date: '2024-07-03', price: 203 },
                  { date: '2024-07-04', price: 208 },
                  { date: '2024-07-05', price: 210 },
                  { date: '2024-07-08', price: 214 },
                  { date: '2024-07-09', price: 212 },
                  { date: '2024-07-10', price: 214.29 },
                ],
                fundamentalsData: [
                  { label: "Market Cap", value: "3.28T" },
                  { label: "P/E Ratio (TTM)", value: "33.19" },
                  { label: "EPS (TTM)", value: "6.46" },
                  { label: "Revenue (TTM)", value: "381.62B" },
                ],
                news: [
                    { title: "Apple's Vision Pro Sales Are Slowing Down", source: "Bloomberg", url: "#", publishedAt: "2024-07-10" }
                ],
                predictions: "The model predicts a slight upward trend for the next quarter, driven by strong iPhone sales."
              },
              "MSFT": {
                name: "Microsoft Corporation",
                ticker: "MSFT",
                price: "450.00",
                change: "-1.50",
                changePercent: "-0.33%",
                isUp: false,
                chartData: [
                    { date: '2024-07-01', price: 440 },
                    { date: '2024-07-02', price: 445 },
                    { date: '2024-07-03', price: 442 },
                    { date: '2024-07-04', price: 448 },
                    { date: '2024-07-05', price: 452 },
                    { date: '2024-07-08', price: 455 },
                    { date: '2024-07-09', price: 451 },
                    { date: '2024-07-10', price: 450.00 },
                ],
                fundamentalsData: [
                  { label: "Market Cap", value: "3.34T" },
                  { label: "P/E Ratio (TTM)", value: "38.7" },
                  { label: "EPS (TTM)", value: "11.62" },
                  { label: "Revenue (TTM)", value: "236.58B" },
                ]
              },
        };

        const stock = allStockData[ticker.toUpperCase()] || allStockData["AAPL"];
        return stock;
    }
);


const getStockDataFlow = ai.defineFlow(
  {
    name: 'getStockDataFlow',
    inputSchema: StockDataInputSchema,
    outputSchema: StockDataOutputSchema,
  },
  async (input) => {
    return await getStockDataTool(input);
  }
);
