import {genkit, type GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAI} from 'genkitx-openai';

const plugins: GenkitPlugin[] = [googleAI()];

if (process.env.OPENAI_API_KEY) {
  plugins.push(openAI({
    apiKey: process.env.OPENAI_API_KEY
  }));
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.0-flash',
});
