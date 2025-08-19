/**
 * @fileOverview Zod schemas for stock data.
 *
 * This file defines the Zod schemas for the input and output of the getStockData flow.
 * It is separated from the flow itself to avoid issues with Next.js Server Actions,
 * which only allow exporting async functions from files marked with 'use server'.
 */
import {z} from 'genkit';

export const StockDataInputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol (e.g., AAPL, GOOGL).'),
});
export type StockDataInput = z.infer<typeof StockDataInputSchema>;

const StockChartDataSchema = z.object({
  date: z.string(),
  price: z.number(),
  volume: z.number().optional(),
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
    predictions: z.string().optional().describe("AI-generated prediction for the stock."),
    dataSource: z.enum(['live', 'mock']).describe("Indicates if the data is from a live API or mocked."),
});
export type StockDataOutput = z.infer<typeof StockDataOutputSchema>;
