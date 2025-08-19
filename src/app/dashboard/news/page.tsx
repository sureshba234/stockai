"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getNewsAndSentiment, type GetNewsAndSentimentOutput } from "@/ai/flows/get-news-sentiment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Newspaper, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  topic: z.string().min(2, "Topic must be at least 2 characters."),
});

type FormData = z.infer<typeof formSchema>;

const SentimentIcon = ({ sentiment }: { sentiment: "Positive" | "Negative" | "Neutral" }) => {
  switch (sentiment) {
    case "Positive":
      return <TrendingUp className="h-4 w-4 mr-1" />;
    case "Negative":
      return <TrendingDown className="h-4 w-4 mr-1" />;
    case "Neutral":
      return <Minus className="h-4 w-4 mr-1" />;
  }
};

const sentimentVariant = {
    Positive: 'success',
    Negative: 'destructive',
    Neutral: 'default',
} as const;

const sentimentBadgeClass = {
    Positive: "text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-950",
    Negative: "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-700 dark:bg-red-950",
    Neutral: "text-muted-foreground border-border bg-muted"
}

export default function NewsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GetNewsAndSentimentOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "AI industry trends",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const apiResult = await getNewsAndSentiment(data);
      setResult(apiResult);
    } catch (error) {
      console.error("Error fetching news and sentiment:", error);
      toast({
        title: "Error",
        description: "Failed to fetch news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>News & Sentiment Analysis</CardTitle>
          <CardDescription>Enter a topic to get the latest news, complete with AI-powered summaries and sentiment analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'Semiconductor industry' or 'AAPL'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && !result && (
         <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-96">
            <Newspaper className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Your News Analysis Awaits</h3>
            <p className="text-muted-foreground">Enter a topic above to get started.</p>
        </div>
      )}

      {result && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {result.articles.map((article, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                </a>
                <CardDescription>{article.source}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{article.summary}</p>
              </CardContent>
              <CardFooter>
                 <Badge variant="outline" className={cn(sentimentBadgeClass[article.sentiment])}>
                    <SentimentIcon sentiment={article.sentiment} />
                    {article.sentiment}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
