'use server';
/**
 * @fileOverview Discovers cross-asset relations using graph neural networks.
 *
 * - discoverCrossAssetRelations - A function that discovers cross-asset relations.
 * - DiscoverCrossAssetRelationsInput - The input type for the discoverCrossAssetRelations function.
 * - DiscoverCrossAssetRelationsOutput - The return type for the discoverCrossAssetRelations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiscoverCrossAssetRelationsInputSchema = z.object({
  assetList: z
    .string()
    .describe('A comma-separated list of assets to analyze (e.g., AAPL, MSFT, GOOGL).'),
  analysisType: z
    .string()
    .describe(
      'The type of analysis to perform (e.g., correlation, co-movement, influence).'
    ),
});
export type DiscoverCrossAssetRelationsInput = z.infer<
  typeof DiscoverCrossAssetRelationsInputSchema
>;

const DiscoverCrossAssetRelationsOutputSchema = z.object({
  relations: z
    .string()
    .describe(
      'A description of the cross-asset relations discovered, including specific assets and their relationships.'
    ),
  confidenceScore: z
    .number()
    .describe('A confidence score (0-1) indicating the reliability of the discovered relations.'),
  explanation: z
    .string()
    .describe(
      'An explanation of the discovered relations, including factors driving the relationships.'
    ),
});
export type DiscoverCrossAssetRelationsOutput = z.infer<
  typeof DiscoverCrossAssetRelationsOutputSchema
>;

export async function discoverCrossAssetRelations(
  input: DiscoverCrossAssetRelationsInput
): Promise<DiscoverCrossAssetRelationsOutput> {
  return discoverCrossAssetRelationsFlow(input);
}

const discoverCrossAssetRelationsPrompt = ai.definePrompt({
  name: 'discoverCrossAssetRelationsPrompt',
  input: {schema: DiscoverCrossAssetRelationsInputSchema},
  output: {schema: DiscoverCrossAssetRelationsOutputSchema},
  prompt: `You are an expert financial analyst specializing in discovering hidden relationships between financial assets using graph neural networks.

You will analyze the provided list of assets and identify non-obvious, valuable insights based on the specified analysis type.

Assets: {{{assetList}}}
Analysis Type: {{{analysisType}}}

Based on your analysis, provide the following:

- A description of the cross-asset relations discovered, including specific assets and their relationships.
- A confidence score (0-1) indicating the reliability of the discovered relations.
- An explanation of the discovered relations, including factors driving the relationships.`,
});

const discoverCrossAssetRelationsFlow = ai.defineFlow(
  {
    name: 'discoverCrossAssetRelationsFlow',
    inputSchema: DiscoverCrossAssetRelationsInputSchema,
    outputSchema: DiscoverCrossAssetRelationsOutputSchema,
  },
  async input => {
    const {output} = await discoverCrossAssetRelationsPrompt(input);
    return output!;
  }
);
