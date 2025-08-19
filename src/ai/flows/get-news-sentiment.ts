
'use server';
/**
 * @fileOverview Fetches news articles for a given topic, generates summaries, and analyzes sentiment.
 *
 * - getNewsAndSentiment - A function that fetches and analyzes news.
 * - GetNewsAndSentimentInput - The input type for the function.
 * - GetNewsAndSentimentOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NewsArticleSchema = z.object({
  title: z.string().describe('The title of the news article.'),
  source: z.string().describe('The source or publisher of the news article.'),
  url: z.string().url().describe('The URL to the full news article.'),
  summary: z.string().describe('A concise, AI-generated summary of the article.'),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral']).describe('The AI-determined sentiment of the article.'),
});

const GetNewsAndSentimentInputSchema = z.object({
  topic: z.string().describe('The topic to search for news articles about.'),
});
export type GetNewsAndSentimentInput = z.infer<typeof GetNewsAndSentimentInputSchema>;

const GetNewsAndSentimentOutputSchema = z.object({
  articles: z.array(NewsArticleSchema),
});
export type GetNewsAndSentimentOutput = z.infer<typeof GetNewsAndSentimentOutputSchema>;

export async function getNewsAndSentiment(input: GetNewsAndSentimentInput): Promise<GetNewsAndSentimentOutput> {
  return getNewsAndSentimentFlow(input);
}

// In a real application, this tool would use a news API like NewsAPI, Polygon, or others.
// For this example, we are returning mock data to simulate the API call.
const fetchNewsForTopic = ai.defineTool(
  {
    name: 'fetchNewsForTopic',
    description: 'Fetches news articles for a given topic from various sources.',
    inputSchema: z.object({
      topic: z.string(),
    }),
    outputSchema: z.array(
      z.object({
        title: z.string(),
        source: z.string(),
        url: z.string().url(),
        content: z.string().describe('The full or partial content of the article.'),
      })
    ),
  },
  async ({ topic }) => {
    console.log(`Fetching news for topic: ${topic}`);
    // Mock data simulation
    return [
      {
        title: `AI Industry Sees Unprecedented Growth in ${new Date().getFullYear()}`,
        source: 'Tech Chronicle',
        url: 'https://example.com/news/ai-growth',
        content: `The AI industry has experienced a massive surge, with investments doubling in the last quarter. Companies specializing in large language models and generative AI are leading the charge, with stock prices soaring. Experts predict this trend will continue as adoption spreads across all sectors. The impact on the job market remains a key point of discussion among policymakers. Topic mentioned: ${topic}.`,
      },
      {
        title: 'Regulatory Headwinds for Tech Giants',
        source: 'Global Financial News',
        url: 'https://example.com/news/tech-regulation',
        content: `Major technology firms are facing increased scrutiny from regulators worldwide. Concerns over data privacy, market competition, and the spread of misinformation are leading to new, stricter laws. This could potentially slow down innovation and impact profitability for companies in the ${topic} space.`,
      },
      {
        title: 'Quantum Computing: The Next Frontier or Overhyped?',
        source: 'Science Today',
        url: 'https://example.com/news/quantum-computing',
        content: `While still in its nascent stages, quantum computing promises to revolutionize fields from medicine to finance. However, significant technical challenges remain. Some experts argue that practical, large-scale applications are still decades away, while others believe breakthroughs are just around the corner. Investment in the sector is high, but so is the risk. The discussion relates to the broader ${topic} field.`,
      },
      {
          title: `Market Reacts Neutrally to Latest Fed Announcement on ${topic}`,
          source: 'Economic Times',
          url: 'https://example.com/news/fed-announcement',
          content: `The Federal Reserve's latest announcement on interest rates has led to a mixed and largely neutral reaction in the markets. While the statement was in line with expectations, investors are still cautiously observing inflation data. The stability is seen as a good sign, but uncertainty about the long-term economic outlook for the ${topic} sector persists.`,
      }
    ];
  }
);

const prompt = ai.definePrompt({
  name: 'summarizeAndAnalyzeNewsPrompt',
  model: 'googleai/gemini-2.0-flash',
  input: {
    schema: z.object({
      title: z.string(),
      content: z.string(),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise, one-paragraph summary of the article.'),
      sentiment: z.enum(['Positive', 'Negative', 'Neutral']).describe('The overall sentiment of the article.'),
    }),
  },
  prompt: `Analyze the following news article:

Title: {{{title}}}
Content: {{{content}}}

Based on the content, provide a concise, one-paragraph summary and determine if the overall sentiment is Positive, Negative, or Neutral.`,
});

const getNewsAndSentimentFlow = ai.defineFlow(
  {
    name: 'getNewsAndSentimentFlow',
    inputSchema: GetNewsAndSentimentInputSchema,
    outputSchema: GetNewsAndSentimentOutputSchema,
  },
  async ({ topic }) => {
    const rawArticles = await fetchNewsForTopic({ topic });
    const analysisPromises = rawArticles.map(article => 
      prompt({
        title: article.title,
        content: article.content,
      })
    );
    
    const analysisResults = await Promise.all(analysisPromises);
    
    const analyzedArticles = rawArticles.map((article, index) => {
      const { output } = analysisResults[index];
      return {
        ...article,
        content: '', // Clear content to save bandwidth
        summary: output?.summary || 'Could not generate summary.',
        sentiment: output?.sentiment || 'Neutral',
      };
    });

    return { articles: analyzedArticles };
  }
);
