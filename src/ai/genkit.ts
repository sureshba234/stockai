import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAI} from 'genkitx-openai';

export const ai = genkit({
  plugins: [
    googleAI(),
    process.env.OPENAI_API_KEY ? openAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : undefined
  ].filter(p => p),
  model: 'googleai/gemini-2.0-flash',
});
