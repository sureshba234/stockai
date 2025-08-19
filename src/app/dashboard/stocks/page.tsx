"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { Newspaper, FileText, Bot, AlertCircle, Bell, Star, GitCompareArrows, Download } from 'lucide-react';
import { getStockData } from "@/ai/flows/get-stock-data";
import type { StockDataOutput } from "@/ai/schemas/stock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";


function StockPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <div className="flex items-baseline gap-2 mt-1">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-7 w-32" />
              </div>
            </div>
             <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
        </div>
        <Card>
            <CardContent className="pt-6">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-8 w-1/2 mt-1" />
                        </CardHeader>
                    </Card>
                  ))}
               </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function StocksPage() {
  const searchParams = useSearchParams();
  const [stockData, setStockData] = useState<StockDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on("select", handleSelect)

    return () => {
      api.off("select", handleSelect)
    }
  }, [api])


  const TABS = [
    { name: "Fundamentals", icon: FileText },
    { name: "News", icon: Newspaper },
    { name: "Predictions", icon: Bot },
  ]


  useEffect(() => {
    async function fetchData() {
      const queryTicker = searchParams.get('q')?.toUpperCase();
      if (!queryTicker) {
        setError("No stock ticker provided. Please search for a stock.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await getStockData({ ticker: queryTicker });
        setStockData(data);
      } catch (e: any) {
        console.error("Failed to fetch stock data", e);
        setError(e.message || `Failed to fetch data for ${queryTicker}. Please try another symbol.`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [searchParams]);

  const handleActionClick = (action: string) => {
    toast({
      title: `${action} (Simulated)`,
      description: `The ${action.toLowerCase()} action was triggered for ${stockData?.ticker}.`,
    });
  };

  const handleTabClick = (index: number) => {
    api?.scrollTo(index);
    setCurrent(index);
  };


  if (isLoading) {
    return <StockPageSkeleton />;
  }

  if (error) {
    return (
        <Card className="mt-4">
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertCircle /> Error</CardTitle>
          </CardHeader>
          <CardContent>
              <p>{error}</p>
          </CardContent>
      </Card>
    )
  }

  if (!stockData) {
      return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{stockData.name} ({stockData.ticker})</h1>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-semibold">${stockData.price}</p>
                <p className={`text-lg font-semibold ${stockData.isUp ? "text-emerald-500" : "text-red-500"}`}>
                  {stockData.isUp ? '+' : ''}{stockData.change} ({stockData.changePercent})
                </p>
              </div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleActionClick('Add to Watchlist')}>
                <Star className="mr-2" />
                Watchlist
            </Button>
            <Button variant="outline" onClick={() => handleActionClick('Add Alert')}>
                <Bell className="mr-2" />
                Alert
            </Button>
            <Button variant="outline" onClick={() => handleActionClick('Compare')}>
                <GitCompareArrows className="mr-2" />
                Compare
            </Button>
            <Button variant="outline" onClick={() => handleActionClick('Export Data')}>
                <Download className="mr-2" />
                Export
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price Chart (90-day)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96">
            <ResponsiveContainer>
              <LineChart data={stockData.chartData}>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} tickMargin={5} />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin', 'dataMax']} tick={{fontSize: 12}} tickFormatter={(value) => `$${value.toFixed(2)}`} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                />
                <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <div className="flex space-x-2 mb-4 overflow-x-auto">
            {TABS.map((tab, index) => {
              const Icon = tab.icon;
              return (
                  <Button
                      key={tab.name}
                      variant="outline"
                      className={cn(
                          "flex-shrink-0",
                          current === index ? 'bg-primary text-primary-foreground' : ''
                      )}
                      onClick={() => handleTabClick(index)}
                  >
                      <Icon className="mr-2 h-4 w-4" />
                      {tab.name}
                  </Button>
              )
            })}
        </div>
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            <CarouselItem>
                <Card>
                    <CardContent className="pt-6">
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {stockData.fundamentalsData.map((item) => (
                                <Card key={item.label}>
                                    <CardHeader className="pb-2">
                                        <CardDescription>{item.label}</CardDescription>
                                        <CardTitle className="text-2xl">{item.value}</CardTitle>
                                    </CardHeader>
                                </Card>
                            ))}
                       </div>
                    </CardContent>
                </Card>
            </CarouselItem>
            <CarouselItem>
                <Card>
                    <CardHeader>
                      <CardTitle>Latest News</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        {stockData.news && stockData.news.length > 0 ? (
                          <div className="space-y-4">
                            {stockData.news.map((item, index) => (
                              <div key={index} className="flex items-start gap-4">
                                 <Newspaper className="w-6 h-6 text-muted-foreground mt-1" />
                                <div>
                                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{item.title}</a>
                                  <p className="text-xs text-muted-foreground">{item.source} - {item.publishedAt}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                              <Newspaper className="w-16 h-16 text-muted-foreground mb-4" />
                              <h3 className="text-xl font-semibold">No News Available</h3>
                              <p className="text-muted-foreground">There is no recent news for this stock.</p>
                          </div>
                        )}
                    </CardContent>
                </Card>
            </CarouselItem>
            <CarouselItem>
                <Card>
                    <CardHeader>
                      <CardTitle>AI-Powered Predictions</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                        {stockData.predictions ? (
                          <div className="flex items-start gap-4">
                             <Bot className="w-6 h-6 text-muted-foreground mt-1 flex-shrink-0" />
                            <p className="text-muted-foreground leading-relaxed">{stockData.predictions}</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                              <Bot className="w-16 h-16 text-muted-foreground mb-4" />
                              <h3 className="text-xl font-semibold">No Predictions Available</h3>
                              <p className="text-muted-foreground">AI-powered predictions are not yet available for this stock.</p>
                          </div>
                        )}
                    </CardContent>
                </Card>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>

    </div>
  );
}

    
