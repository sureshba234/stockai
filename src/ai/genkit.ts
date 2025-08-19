'use server';
import {genkit, type GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openAI} from 'genkitx-openai';

const plugins: GenkitPlugin[] = [googleAI()];

// This is the correct, safe way to conditionally add a plugin.
// We build the array of plugins before passing it to genkit().
if (process.env.OPENAI_API_KEY) {
  plugins.push(openAI());
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.0-flash',
});
