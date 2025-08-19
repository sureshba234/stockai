'use server';

/**
 * @fileOverview Generates ML-specific notes (feature handling, explainability, confidence) for MLOps & Model Serving.
 *
 * - generateMLNotes - A function that generates ML notes.
 * - MLNotesInput - The input type for the generateMLNotes function.
 * - MLNotesOutput - The return type for the generateMLNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MLNotesInputSchema = z.object({
  modelName: z.string().describe('The name of the ML model.'),
  featureList: z.string().describe('A comma-separated list of features used by the model.'),
  performanceMetrics: z.string().describe('Key performance metrics of the model.'),
});

export type MLNotesInput = z.infer<typeof MLNotesInputSchema>;

const MLNotesOutputSchema = z.object({
  featureHandlingNotes: z.string().describe('Notes on how the model handles different features.'),
  explainabilityNotes: z.string().describe('Notes on the explainability of the model.'),
  confidenceNotes: z.string().describe('Notes on the confidence level of the model predictions.'),
});

export type MLNotesOutput = z.infer<typeof MLNotesOutputSchema>;

export async function generateMLNotes(input: MLNotesInput): Promise<MLNotesOutput> {
  return generateMLNotesFlow(input);
}

const fetchFeatureImportance = ai.defineTool(
  {
    name: 'fetchFeatureImportance',
    description: 'Retrieves the feature importance scores for a given ML model.',
    inputSchema: z.object({
      modelName: z.string().describe('The name of the ML model.'),
      features: z.array(z.string()).describe('The list of features to get importance for.')
    }),
    outputSchema: z.record(z.string(), z.number()).describe('A map of feature names to their importance scores (0 to 1).'),
  },
  async (input) => {
    // Placeholder implementation for feature importance.
    // In a real scenario, this would fetch actual SHAP or permutation importance scores from a model registry.
    console.log(`Fetching feature importance for model: ${input.modelName}`);
    const importanceScores: Record<string, number> = {};
    input.features.forEach(feature => {
      // Assign a random importance score for demonstration purposes.
      importanceScores[feature.trim()] = parseFloat(Math.random().toFixed(4));
    });
    return importanceScores;
  }
);

const prompt = ai.definePrompt({
  name: 'generateMLNotesPrompt',
  input: {schema: MLNotesInputSchema},
  output: {schema: MLNotesOutputSchema},
  tools: [fetchFeatureImportance],
  prompt: `You are an expert in MLOps and model serving. Given the following information about an ML model, generate notes on feature handling, explainability, and confidence.

Model Name: {{{modelName}}}
Feature List: {{{featureList}}}
Performance Metrics: {{{performanceMetrics}}}

When generating the feature handling and explainability notes, you MUST use the fetchFeatureImportance tool to get the feature importance scores for the specified model and incorporate that information into the notes. Discuss the most impactful features based on the scores.
`,
});

const generateMLNotesFlow = ai.defineFlow(
  {
    name: 'generateMLNotesFlow',
    inputSchema: MLNotesInputSchema,
    outputSchema: MLNotesOutputSchema,
  },
  async (input) => {
    const { output, history } = await prompt({
        ...input,
        // Also pass the list of features to the tool.
        features: input.featureList.split(',').map(f => f.trim()),
    });
    return output!;
  }
);
