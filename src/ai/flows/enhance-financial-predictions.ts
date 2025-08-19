'use server';

/**
 * @fileOverview Enhances financial predictions with interactive visualizations and ML-specific notes.
 *
 * - enhanceFinancialPredictions - A function that enhances financial predictions.
 * - EnhanceFinancialPredictionsInput - The input type for the enhanceFinancialPredictions function.
 * - EnhanceFinancialPredictionsOutput - The return type for the enhanceFinancialPredictions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceFinancialPredictionsInputSchema = z.object({
  predictionData: z.string().describe('Financial prediction data to be enhanced.'),
  modelDescription: z.string().describe('Description of the ML model used for predictions.'),
});
export type EnhanceFinancialPredictionsInput = z.infer<typeof EnhanceFinancialPredictionsInputSchema>;

const EnhanceFinancialPredictionsOutputSchema = z.object({
  enhancedVisualization: z.string().describe('A title for the interactive visualization of the financial prediction. e.g. "Quarterly Revenue and Profit Forecast"'),
  mlNotes: z.string().describe('ML-specific notes on feature handling, explainability, and confidence.'),
});
export type EnhanceFinancialPredictionsOutput = z.infer<typeof EnhanceFinancialPredictionsOutputSchema>;

export async function enhanceFinancialPredictions(input: EnhanceFinancialPredictionsInput): Promise<EnhanceFinancialPredictionsOutput> {
  return enhanceFinancialPredictionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceFinancialPredictionsPrompt',
  input: {schema: EnhanceFinancialPredictionsInputSchema},
  output: {schema: EnhanceFinancialPredictionsOutputSchema},
  prompt: `You are an expert financial analyst specializing in explaining machine learning model predictions.

  You will receive financial prediction data and a description of the ML model used to generate the predictions.
  Your task is to:

  1.  Generate a title for an interactive visualization of the financial prediction data. This visualization should be suitable for a web application.
  2.  Create ML-specific notes that cover feature handling, explainability, and confidence of the prediction.

  Use the following information:
  Prediction Data: {{{predictionData}}}
  Model Description: {{{modelDescription}}}
  \n  Output the visualization title and ML notes in a format suitable for display in a user interface.
  `,
});

const enhanceFinancialPredictionsFlow = ai.defineFlow(
  {
    name: 'enhanceFinancialPredictionsFlow',
    inputSchema: EnhanceFinancialPredictionsInputSchema,
    outputSchema: EnhanceFinancialPredictionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
