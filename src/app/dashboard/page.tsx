"use client"

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowRight, BotMessageSquare, BarChart, BellRing, Link as LinkIcon, Star, ArrowUpRight, ArrowDownRight, MoreHorizontal, Loader2, Send } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { StockDataOutput } from '@/ai/schemas/stock-data';
import { useState, useEffect } from 'react';
import { getStockData } from '@/ai/flows/get-stock-data';
import { Sheet, BarChart2 } from 'lucide-react';
import { stockAgent } from '@/ai/flows/stock-agent';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';


const features = [
  {
    title: "ML Note Generation",
    description: "Generate ML-specific notes for feature handling, explainability, and confidence for your models.",
    href: "/dashboard/ml-notes",
    icon: BotMessageSquare,
    cta: "Generate Notes"
  },
  {
    title: "Market Analysis",
    description: "Deep-dive into market sectors with AI-powered analysis of trends, players, and forecasts.",
    href: "/dashboard/analytics",
    icon: Sheet,
    cta: "Analyze Sectors"
  },
  {
    title: "Prediction Visualization",
    description: "Enhance financial predictions with interactive visualizations and detailed ML notes.",
    href: "/dashboard/predictions",
    icon: BarChart2,
    cta: "Enhance Predictions"
  },
];


function WatchlistCard() {
  const [watchlistData, setWatchlistData] = useState<StockDataOutput[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWatchlist() {
      setIsLoading(true);
      const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]") as string[];
      if (watchlist.length > 0) {
        try {
          const data = await Promise.all(
            watchlist.slice(0, 4).map(ticker => getStockData({ ticker }))
          );
          setWatchlistData(data.filter(Boolean) as StockDataOutput[]);
        } catch (error) {
          console.error("Failed to fetch watchlist data", error);
        }
      }
      setIsLoading(false);
    }
    fetchWatchlist();
  }, []);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Watchlist</CardTitle>
          <CardDescription>Your hand-picked stocks to watch.</CardDescription>
        </div>
        <Link href="/dashboard/watchlist">
            <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : watchlistData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchlistData.map((stock) => (
                <TableRow key={stock.ticker}>
                  <TableCell>
                    <Link href={`/dashboard/stocks?q=${stock.ticker}`} className="hover:underline">
                      <div className="font-medium">{stock.ticker}</div>
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">${stock.price}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={stock.isUp ? "text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-950" : "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-700 dark:bg-red-950"}>
                      {stock.isUp ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
                      {stock.changePercent}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center text-muted-foreground p-8">
            <Star className="mx-auto w-12 h-12 mb-4" />
            <p>Your watchlist is empty.</p>
            <p className="text-xs mt-2">Add stocks to your watchlist from the Stocks page.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type Message = {
  role: 'user' | 'agent';
  content: string;
};

function AIAgentCard() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMessage: Message = { role: 'user', content: query };
        setMessages(prev => [...prev, userMessage]);
        setQuery('');
        setIsLoading(true);

        try {
            const result = await stockAgent({ query });
            const agentMessage: Message = { role: 'agent', content: result.answer };
            setMessages(prev => [...prev, agentMessage]);
        } catch (error) {
            console.error("AI Agent Error:", error);
            toast({
                title: "Error",
                description: "The AI agent failed to respond. Please check your API key in settings or try again.",
                variant: "destructive"
            });
            setMessages(prev => prev.slice(0, -1)); // Remove the user message on error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="col-span-1 lg:col-span-2 flex flex-col">
            <CardHeader>
                <CardTitle>Ask AI Agent</CardTitle>
                <CardDescription>Your personal financial assistant. Ask about stocks, markets, or investment ideas.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4">
                 <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? 'justify-end' : '')}>
                                {msg.role === 'agent' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/icon-192x192.png" alt="AI Agent" data-ai-hint="logo" />
                                        <AvatarFallback>AI</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn(
                                    "rounded-lg px-3 py-2 text-sm",
                                    msg.role === 'agent' ? 'bg-muted' : 'bg-primary text-primary-foreground'
                                )}>
                                    <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                                </div>
                                {msg.role === 'user' && (
                                     <Avatar className="h-8 w-8">
                                        <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="user avatar" />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-3">
                                 <Avatar className="h-8 w-8">
                                        <AvatarImage src="/icon-192x192.png" alt="AI Agent" />
                                        <AvatarFallback>AI</AvatarFallback>
                                    </Avatar>
                                <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                 </ScrollArea>
            </CardContent>
             <CardFooter>
                 <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., 'What are the top 5G stocks?'"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading}>
                        <Send />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Insight Canvas</h1>
        <p className="text-muted-foreground">Your intelligent financial analysis and MLOps platform.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AIAgentCard />
        <WatchlistCard />
        {features.slice(0, 1).map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.title} href={feature.href} className="flex">
              <Card className="flex flex-col w-full hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription className="mt-1">{feature.description}</CardDescription>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10">
                       <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="mt-auto">
                    <div className="flex items-center text-primary font-medium">
                      <span>{feature.cta}</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
