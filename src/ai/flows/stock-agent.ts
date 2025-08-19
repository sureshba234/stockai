'use server';

/**
 * @fileOverview A conversational agent for answering financial questions.
 *
 * - stockAgent - A function that handles a conversational turn.
 * - StockAgentInput - The input type for the stockAgent function.
 * - StockAgentOutput - The return type for the stockAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getStockData } from './get-stock-data';
import { getNewsAndSentiment } from './get-news-sentiment';

export const StockAgentInputSchema = z.object({
  query: z.string().describe('The user\'s question or prompt.'),
});
export type StockAgentInput = z.infer<typeof StockAgentInputSchema>;

export const StockAgentOutputSchema = z.object({
  answer: z.string().describe('The AI agent\'s response.'),
});
export type StockAgentOutput = z.infer<typeof StockAgentOutputSchema>;


export async function stockAgent(input: StockAgentInput): Promise<StockAgentOutput> {
  return stockAgentFlow(input);
}


const agentPrompt = ai.definePrompt({
  name: 'stockAgentPrompt',
  input: {schema: StockAgentInputSchema},
  output: {schema: StockAgentOutputSchema},
  tools: [getStockData, getNewsAndSentiment],
  prompt: `You are a friendly and helpful financial AI assistant. Your name is Insight.
  Your goal is to provide insightful, accurate, and easy-to-understand answers to questions about stocks, markets, and investment ideas.
  You MUST use the tools provided (getStockData, getNewsAndSentiment) to gather real-time information to support your answers.
  Do not provide financial advice. Always include a disclaimer that your answers are for informational purposes only.
  Keep your answers concise and well-formatted. Use markdown for readability where appropriate.

  User query: {{{query}}}
  `,
});


const stockAgentFlow = ai.defineFlow(
  {
    name: 'stockAgentFlow',
    inputSchema: StockAgentInputSchema,
    outputSchema: StockAgentOutputSchema,
  },
  async input => {
    // Prefer OpenAI if available, otherwise fall back to Google AI.
    const model = process.env.OPENAI_API_KEY ? 'openai/gpt-4o' : 'googleai/gemini-2.0-flash';
    
    const {output} = await agentPrompt({
        ...input
    }, { model }); // Pass model in the second argument (options)

    return output!;
  }
);
