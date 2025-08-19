'use server';
/**
 * @fileOverview A real-time ML alert configuration AI agent.
 *
 * - configureRealTimeMLAlerts - A function that handles the configuration of real-time ML alerts.
 * - ConfigureRealTimeMLAlertsInput - The input type for the configureRealTimeMLAlerts function.
 * - ConfigureRealTimeMLAlertsOutput - The return type for the configureRealTimeMLAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConfigureRealTimeMLAlertsInputSchema = z.object({
  mlSignal: z.string().describe('The ML signal to monitor.'),
  threshold: z.number().describe('The threshold for the alert.'),
  alertFrequency: z.string().describe('The frequency of the alert (e.g., daily, hourly).'),
  featureHandlingNotes: z.string().optional().describe('ML-specific notes on feature handling.'),
  explainabilityNotes: z.string().optional().describe('ML-specific notes on explainability.'),
  confidenceNotes: z.string().optional().describe('ML-specific notes on confidence.'),
});
export type ConfigureRealTimeMLAlertsInput = z.infer<typeof ConfigureRealTimeMLAlertsInputSchema>;

const ConfigureRealTimeMLAlertsOutputSchema = z.object({
  alertConfiguration: z.string().describe('The configuration details of the real-time alert.'),
  mlNotesSummary: z.string().describe('A summary of the ML-specific notes.'),
});
export type ConfigureRealTimeMLAlertsOutput = z.infer<typeof ConfigureRealTimeMLAlertsOutputSchema>;

export async function configureRealTimeMLAlerts(input: ConfigureRealTimeMLAlertsInput): Promise<ConfigureRealTimeMLAlertsOutput> {
  return configureRealTimeMLAlertsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'configureRealTimeMLAlertsPrompt',
  input: {schema: ConfigureRealTimeMLAlertsInputSchema},
  output: {schema: ConfigureRealTimeMLAlertsOutputSchema},
  prompt: `You are an expert in configuring real-time alerts based on ML signals.

You will configure a real-time alert based on the following information:

ML Signal: {{{mlSignal}}}
Threshold: {{{threshold}}}
Alert Frequency: {{{alertFrequency}}}

Also take the following ML-specific notes into consideration:

Feature Handling Notes: {{{featureHandlingNotes}}}
Explainability Notes: {{{explainabilityNotes}}}
Confidence Notes: {{{confidenceNotes}}}

Create a detailed alert configuration and summarize the ML-specific notes.
`,
});

const configureRealTimeMLAlertsFlow = ai.defineFlow(
  {
    name: 'configureRealTimeMLAlertsFlow',
    inputSchema: ConfigureRealTimeMLAlertsInputSchema,
    outputSchema: ConfigureRealTimeMLAlertsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
