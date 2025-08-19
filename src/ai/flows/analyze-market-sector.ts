'use server';
/**
 * @fileOverview Performs a deep analysis of a given market sector.
 *
 * - analyzeMarketSector - A function that analyzes a market sector.
 * - AnalyzeMarketSectorInput - The input type for the analyzeMarketSector function.
 * - AnalyzeMarketSectorOutput - The return type for the analyzeMarketSector function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMarketSectorInputSchema = z.object({
  sector: z.string().describe('The market sector to analyze (e.g., "Cloud Computing", "Renewable Energy").'),
});
export type AnalyzeMarketSectorInput = z.infer<typeof AnalyzeMarketSectorInputSchema>;

const AnalyzeMarketSectorOutputSchema = z.object({
  keyPlayers: z.string().describe("A paragraph identifying the major companies and key players in this sector."),
  recentTrends: z.string().describe("An analysis of the most significant recent developments and trends affecting the sector."),
  futureOutlook: z.string().describe("An AI-generated forecast of the sector's potential future performance and key factors to watch."),
  investmentSummary: z.string().describe("A concluding summary of the opportunities and risks associated with investing in this sector."),
});
export type AnalyzeMarketSectorOutput = z.infer<typeof AnalyzeMarketSectorOutputSchema>;


export async function analyzeMarketSector(input: AnalyzeMarketSectorInput): Promise<AnalyzeMarketSectorOutput> {
  return analyzeMarketSectorFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeMarketSectorPrompt',
  input: {schema: AnalyzeMarketSectorInputSchema},
  output: {schema: AnalyzeMarketSectorOutputSchema},
  prompt: `You are an expert financial market analyst. Your task is to conduct a deep and insightful analysis of the following market sector: {{{sector}}}.

Provide a comprehensive but concise report covering the following areas. Each area should be a detailed paragraph.

1.  **Key Players:** Identify the major companies and key players that dominate this sector. Mention their roles and market share if possible.
2.  **Recent Trends:** Analyze the most significant recent developments and trends affecting the sector. This could include technological advancements, regulatory changes, consumer behavior shifts, or major market events.
3.  **Future Outlook:** Provide a forecast of the sector's potential future performance. Discuss potential growth drivers, challenges, and disruptive forces on the horizon.
4.  **Investment Summary:** Give a concluding summary highlighting the main opportunities and risks associated with investing in this sector.
`,
});

const analyzeMarketSectorFlow = ai.defineFlow(
  {
    name: 'analyzeMarketSectorFlow',
    inputSchema: AnalyzeMarketSectorInputSchema,
    outputSchema: AnalyzeMarketSectorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
