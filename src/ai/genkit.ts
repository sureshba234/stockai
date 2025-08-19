'use server';
import {genkit, type GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {openai} from 'genkitx-openai';

const plugins: GenkitPlugin[] = [googleAI()];

// This is the correct, safe way to conditionally add a plugin.
// We build the array of plugins before passing it to genkit().
if (process.env.OPENAI_API_KEY) {
  plugins.push(
    openai({
      apiKey: process.env.OPENAI_API_KEY,
    })
  );
}

export const ai = genkit({
  plugins,
});
