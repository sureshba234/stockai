
"use client";

import { useEffect, useState, Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend, Line, Bar } from 'recharts';
import { Newspaper, FileText, Bot, AlertCircle, Bell, Star, GitCompareArrows, Download, ZoomIn, ZoomOut, X as XIcon, Info, Check } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";


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

const timeRanges = [
    { label: "1M", days: 30 },
    { label: "6M", days: 180 },
    { label: "1Yr", days: 365 },
    { label: "3Yr", days: 365 * 3 },
    { label: "5Yr", days: 365 * 5 },
    { label: "10Yr", days: 365 * 10},
    { label: "Max", days: Infinity },
];

function calculateMovingAverage(data: {price: number}[], period: number) {
    if (!data || data.length < period) return [];
    
    const result = Array(data.length).fill(null);
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.price, 0);
        result[i] = sum / period;
    }
    return result;
}

function StockPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [stockData, setStockData] = useState<StockDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isComparing, setIsComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [isCompareDialogOpen, setCompareDialogOpen] = useState(false);

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  
  const [selectedTimeRange, setSelectedTimeRange] = useState("1Yr");
  const [chartOverlays, setChartOverlays] = useState({
      price: true,
      ma50: false,
      ma200: false,
      volume: true
  })

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
    router.push(`/dashboard/alerts?ticker=${stockData.ticker}`);
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
  
  const handleCompareSelect = async (ticker: string) => {
    setCompareDialogOpen(false);
    if (!stockData || stockData.ticker === ticker) return;
    toast({ title: "Comparison feature not implemented", description: "This feature is coming soon!" });
  }


  const chartData = useMemo(() => {
    if (!stockData?.chartData) return [];
    
    const rangeInfo = timeRanges.find(r => r.label === selectedTimeRange);
    const daysToShow = rangeInfo ? rangeInfo.days : Infinity;

    const allChartData = stockData.chartData;
    const dataSlice = daysToShow >= allChartData.length ? allChartData : allChartData.slice(allChartData.length - daysToShow);
    
    const ma50 = calculateMovingAverage(dataSlice, 50);
    const ma200 = calculateMovingAverage(dataSlice, 200);

    return dataSlice.map((point, index) => ({
      ...point,
      price: point.price,
      ma50: ma50[index],
      ma200: ma200[index],
    }));
  }, [stockData?.chartData, selectedTimeRange]);


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
        router.push('/dashboard/stocks?q=AAPL');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await getStockData({ ticker: queryTicker });
        setStockData(data);
        if (!data) {
          setError(`Failed to fetch data for ${queryTicker}. The ticker may be invalid, or API providers may be unavailable.`);
        }
      } catch (e: any) {
        console.error("Failed to fetch stock data", e);
        setError(e.message || `An unexpected error occurred while fetching data for ${queryTicker}.`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [searchParams, router]);

  const handleTabClick = (index: number) => {
    api?.scrollTo(index);
    setCurrent(index);
  };
  
  const handleOverlayChange = (overlay: keyof typeof chartOverlays) => {
    setChartOverlays(prev => ({...prev, [overlay]: !prev[overlay]}));
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
    if (!value) return "0";
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
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
        <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={toggleWatchlist}>
                <Star className={cn("mr-2", isWatched && "fill-yellow-400 text-yellow-500")} />
                {isWatched ? 'In Watchlist' : 'Watchlist'}
            </Button>
            <Button variant="outline" onClick={handleSetAlert}>
                <Bell className="mr-2" />
                Alert
            </Button>
             <Dialog open={isCompareDialogOpen} onOpenChange={setCompareDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" disabled={true}>
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
        
        {stockData.dataSource === 'mock' && (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Viewing Mock Data</AlertTitle>
                <AlertDescription>
                    Live data providers could not be reached. You are currently viewing simulated data. Please check your API keys in Settings.
                </AlertDescription>
            </Alert>
        )}
      </div>

      <Card>
        <CardHeader>
             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {timeRanges.map(range => (
                        <Button 
                            key={range.label} 
                            variant={selectedTimeRange === range.label ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTimeRange(range.label)}
                        >
                            {range.label}
                        </Button>
                    ))}
                </div>
                 <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm">Price</Button>
                    <Button variant="outline" size="sm">PE Ratio</Button>
                    <Button variant="outline" size="sm">More</Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96">
            <ResponsiveContainer>
              <ComposedChart data={chartData}>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', {month: 'short', year: '2-digit'})} tickMargin={5} />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} tickFormatter={formatVolume} label={{ value: 'Volume', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))'}}}/>
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} tickFormatter={(value) => `$${value.toFixed(0)}`} label={{ value: 'Price $', angle: 90, position: 'insideRight', style: {textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))'}}}/>

                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                  formatter={(value: any, name: string) => {
                     if (name === 'price') return [`$${(value as number).toFixed(2)}`, 'Price'];
                     if (name === 'ma50') return value ? [`$${(value as number).toFixed(2)}`, '50 DMA'] : null;
                     if (name === 'ma200') return value ? [`$${(value as number).toFixed(2)}`, '200 DMA'] : null;
                     if (name === 'volume') return [formatVolume(value as number), 'Volume'];
                     return [value, name];
                  }}
                   labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                />
                
                {chartOverlays.price && <Line yAxisId="right" type="monotone" dataKey='price' name="Price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />}
                {chartOverlays.ma50 && <Line yAxisId="right" type="monotone" dataKey="ma50" name="50 DMA" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />}
                {chartOverlays.ma200 && <Line yAxisId="right" type="monotone" dataKey="ma200" name="200 DMA" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />}
                {chartOverlays.volume && <Bar yAxisId="left" dataKey="volume" name="Volume" fill="hsl(var(--border))" barSize={20} />}
              
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
              <div className="flex items-center space-x-2">
                <Checkbox id="price" checked={chartOverlays.price} onCheckedChange={() => handleOverlayChange('price')} />
                <Label htmlFor="price" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Price on BSE</Label>
              </div>
               <div className="flex items-center space-x-2">
                <Checkbox id="ma50" checked={chartOverlays.ma50} onCheckedChange={() => handleOverlayChange('ma50')}/>
                <Label htmlFor="ma50" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">50 DMA</Label>
              </div>
               <div className="flex items-center space-x-2">
                <Checkbox id="ma200" checked={chartOverlays.ma200} onCheckedChange={() => handleOverlayChange('ma200')}/>
                <Label htmlFor="ma200" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">200 DMA</Label>
              </div>
               <div className="flex items-center space-x-2">
                <Checkbox id="volume" checked={chartOverlays.volume} onCheckedChange={() => handleOverlayChange('volume')}/>
                <Label htmlFor="volume" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Volume</Label>
              </div>
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

