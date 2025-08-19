"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Line, Bar } from 'recharts';
import { Newspaper, FileText, Bot, AlertCircle, Bell, Star, GitCompareArrows, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { getStockData } from "@/ai/flows/get-stock-data";
import type { StockDataOutput } from "@/ai/schemas/stock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { stockData as stockList } from "@/lib/stocks";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";


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

function StockPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [stockData, setStockData] = useState<StockDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [visibleDataCount, setVisibleDataCount] = useState(90);
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    if (!stockData) return;
    const watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    setIsWatched(watchlist.includes(stockData.ticker));
  }, [stockData]);

  const toggleWatchlist = () => {
    if (!stockData) return;
    let watchlist = JSON.parse(localStorage.getItem("watchlist") || "[]");
    if (isWatched) {
      watchlist = watchlist.filter((t: string) => t !== stockData.ticker);
      toast({ title: "Removed from Watchlist", description: `${stockData.ticker} has been removed from your watchlist.` });
    } else {
      watchlist.push(stockData.ticker);
      toast({ title: "Added to Watchlist", description: `${stockData.ticker} has been added to your watchlist.` });
    }
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    setIsWatched(!isWatched);
  };

  const handleSetAlert = () => {
    if (!stockData) return;
    router.push(`/dashboard/alerts?mlSignal=${stockData.ticker} Price Cross`);
  };

  const handleExportData = () => {
    if (!stockData) return;
    const header = "date,price,volume\n";
    const csv = stockData.chartData.map(d => `${d.date},${d.price},${d.volume || 0}`).join("\n");
    const blob = new Blob([header + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${stockData.ticker}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Data Exported", description: `Chart data for ${stockData.ticker} has been downloaded.` });
  };
  
  const handleCompareSelect = (ticker: string) => {
    toast({
      title: "Compare (Simulated)",
      description: `Comparing ${stockData?.ticker} with ${ticker}. This feature is in development.`
    })
  }

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
        if (!data) {
          setError(`Failed to fetch data for ${queryTicker}. The ticker may be invalid, or the API rate limit has been reached.`);
        }
      } catch (e: any) {
        console.error("Failed to fetch stock data", e);
        setError(e.message || `An unexpected error occurred while fetching data for ${queryTicker}.`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [searchParams]);

  const handleTabClick = (index: number) => {
    api?.scrollTo(index);
    setCurrent(index);
  };
  
  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      setVisibleDataCount(prev => Math.max(30, prev - 30));
    } else {
      setVisibleDataCount(prev => Math.min(90, prev + 30));
    }
  }


  if (isLoading) {
    return <StockPageSkeleton />;
  }

  if (error || !stockData) {
    return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "An unknown error occurred while fetching stock data."}
             <p className="text-xs mt-2">Please try searching for a different stock or check your API keys.</p>
          </AlertDescription>
        </Alert>
    )
  }

  const formatVolume = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
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
            <Button variant="outline" onClick={toggleWatchlist}>
                <Star className={cn("mr-2", isWatched && "fill-yellow-400 text-yellow-500")} />
                {isWatched ? 'In Watchlist' : 'Watchlist'}
            </Button>
            <Button variant="outline" onClick={handleSetAlert}>
                <Bell className="mr-2" />
                Alert
            </Button>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <GitCompareArrows className="mr-2" />
                        Compare
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Compare with another stock</DialogTitle>
                        <DialogDescription>Select a stock to compare with {stockData.ticker}.</DialogDescription>
                    </DialogHeader>
                    <Command>
                        <CommandInput placeholder="Search stocks to compare..." />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup heading="Suggestions">
                                {stockList.filter(s => s.ticker !== stockData.ticker).map((stock) => (
                                <CommandItem
                                    key={stock.ticker}
                                    onSelect={() => handleCompareSelect(stock.ticker)}
                                    className="cursor-pointer"
                                >
                                    {stock.name} ({stock.ticker})
                                </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2" />
                Export
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex-1">
                <CardTitle>Price Chart ({visibleDataCount}-day)</CardTitle>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleZoom('in')} disabled={visibleDataCount <= 30}>
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleZoom('out')} disabled={visibleDataCount >= 90}>
                    <ZoomOut className="h-4 w-4" />
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96">
            <ResponsiveContainer>
              <ComposedChart data={stockData.chartData.slice(-visibleDataCount)}>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} tickMargin={5} />
                <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" domain={['dataMin', 'dataMax']} tick={{fontSize: 12}} tickFormatter={(value) => `$${value.toFixed(2)}`} />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} tickFormatter={formatVolume} />

                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                  formatter={(value: any, name: string) => {
                     if (name === 'price') return [`$${(value as number).toFixed(2)}`, 'Price'];
                     if (name === 'volume') return [formatVolume(value as number), 'Volume'];
                     return [value, name];
                  }}
                />
                <Line yAxisId="left" type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Bar yAxisId="right" dataKey="volume" fill="hsl(var(--border))" barSize={20} />
              </ComposedChart>
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

export default function StocksPage() {
    return (
        <Suspense fallback={<StockPageSkeleton />}>
            <StockPageContent />
        </Suspense>
    );
}
