
"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { stockData } from '@/lib/stocks';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const screeners = [
  {
    title: "The Bull Cartel",
    description: "Companies with a good quarterly growth. Specially made to keep a track of latest quarterly results.",
    filter: "Technology",
  },
  {
    title: "Low on 10 year average earnings",
    description: "Graham liked to value stocks based on average earnings of multiple years. This screen uses 10 year average earnings.",
    filter: "Financial Services",
  },
  {
    title: "Magic Formula",
    description: "Based on famous Magic Formula by Joel Greenblatt.",
    filter: "Conglomerate",
  },
  {
    title: "Growth Stocks",
    description: "Find stocks with high growth at reasonable price. G Factor is a score out of 10.",
    filter: "Technology",
  },
  {
    title: "Highest Dividend Yield Shares",
    description: "Stocks that have been consistently paying out dividend sorted on highest yield.",
    filter: "Energy",
  },
  {
    title: "Companies creating new high",
    description: "Companies with current price around 52 week high.",
    filter: "Consumer Cyclical",
  },
  {
    title: "Capacity expansion",
    description: "Companies undergoing major capacity expansion.",
    filter: "Industrials",
  },
  {
    title: "Piotroski Scan",
    description: "Companies with Piotroski score of 9, reflecting strong financial position.",
    filter: "Financial Services",
  },
  {
    title: "Golden Crossover",
    description: "When 50 DMA moves above 200 DMA from below.",
    filter: "Technology",
  },
  {
    title: "Loss to Profit Companies",
    description: "Companies which had a turnaround and had quarterly results from loss to profit.",
    filter: "Healthcare",
  },
  {
    title: "Coffee Can Portfolio",
    description: "Based on the book by Saurabh Mukherjee.",
    filter: "Consumer Defensive",
  },
  {
    title: "Debt reduction",
    description: "Companies which have been consistently reducing their debt.",
    filter: "Financial Services",
  },
  {
    title: "Growth without dilution",
    description: "Companies with less than 10% dilution over 10 years.",
    filter: "Technology",
  },
  {
    title: "Peter Lynch stock screener",
    description: "The Screen identifies companies that are “fast growers” looking for consistently profitable, relatively unknown, low-debt, reasonably priced stocks with high, but not excessive, growth.",
    filter: "Technology",
  },
  {
    title: "Penny stocks market cap less than 10lac",
    description: "Find penny stocks with a market capitalization under 10 lakh.",
    filter: "Industrials",
  },
  {
    title: "Highest YOY Quarterly profit growth",
    description: "Stocks with the highest Quarter on Quarter Growth in Profits.",
    filter: "Technology",
  },
  {
    title: "All Stocks",
    description: "A complete list of all available stocks.",
    filter: "All",
  },
  {
    title: "Best of latest quarter",
    description: "Companies with the best latest quarterly numbers.",
    filter: "Financial Services",
  },
  {
    title: "CANSLIM",
    description: "A method of screening for stocks based on seven characteristics developed by William O'Neil.",
    filter: "Technology",
  },
  {
    title: "High Quality Businesses",
    description: "Good ROCE, Profit growth faster than Sales growth on an average, Sales growth more than 10%, debt to equity less than 0.25.",
    filter: "Consumer Defensive",
  },
  {
    title: "Book value over 5 times price",
    description: "Find stocks where the book value is significantly higher than the current market price.",
    filter: "Financial Services",
  },
  {
    title: "Debt free companies",
    description: "Companies that are debt free and have a market cap greater than 500 cr.",
    filter: "Financial Services",
  },
  {
    title: "Undervalued stocks",
    description: "Stocks with market cap above 200 crore and p/e less then 5 and CROI is > 15%.",
    filter: "Financial Services",
  },
  {
    title: "Top 10 Best Stocks below Rs 10",
    description: "Find the top 10 best stocks trading below Rs 10.",
    filter: "Industrials",
  },
  {
    title: "Bearish Crossovers",
    description: "50 day moving average cut the 200 day MA from Above.",
    filter: "Technology",
  },
];


export default function ScreenerPage() {
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState('All');

  const sectors = useMemo(() => {
    const allSectors = new Set(stockData.map(stock => stock.sector).filter(Boolean));
    return ['All', ...Array.from(allSectors).sort()];
  }, []);

  const filteredStocks = useMemo(() => {
    if (sectorFilter === 'All') {
      return stockData;
    }
    return stockData.filter(stock => stock.sector === sectorFilter);
  }, [sectorFilter]);

  const handleScreenClick = (screen: typeof screeners[0]) => {
    setActiveScreen(screen.title);
    // As a placeholder, we'll use the screen's related filter.
    // In a real app, this would apply the screen's complex logic.
    const hasSector = sectors.includes(screen.filter);
    setSectorFilter(hasSector ? screen.filter : "All");
  };

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Screener</h1>
        <p className="text-muted-foreground">Filter and discover stocks using pre-defined screens or custom filters.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Popular Screens</CardTitle>
            <CardDescription>Select a pre-defined screen to quickly find companies based on proven strategies.</CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-4 pb-4">
                    {screeners.map((screen) => (
                        <Card 
                            key={screen.title}
                            className={cn(
                                "w-[280px] cursor-pointer transition-all border-2",
                                activeScreen === screen.title ? "border-primary shadow-lg" : "hover:shadow-md"
                            )}
                            onClick={() => handleScreenClick(screen)}
                        >
                            <CardHeader>
                                <CardTitle className="text-lg">{screen.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-normal">{screen.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Screening Results</CardTitle>
           <CardDescription>
                {activeScreen 
                    ? `Showing results for "${activeScreen}"` 
                    : `Found ${filteredStocks.length} stocks matching your criteria.`
                }
            </CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="sector-filter">Or Filter by Sector</Label>
                    <Select 
                        value={sectorFilter} 
                        onValueChange={(value) => {
                            setSectorFilter(value);
                            setActiveScreen(null); // Clear active screen when custom filtering
                        }}
                    >
                        <SelectTrigger id="sector-filter">
                            <SelectValue placeholder="Select a sector" />
                        </SelectTrigger>
                        <SelectContent>
                            {sectors.map(sector => (
                            <SelectItem key={sector} value={sector}>{sector || 'N/A'}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Sector</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.length > 0 ? (
                    filteredStocks.map(stock => (
                    <TableRow key={stock.ticker}>
                      <TableCell>
                         <Link href={`/dashboard/stocks?q=${stock.ticker}`} className="hover:underline">
                            <Badge variant="outline">{stock.ticker}</Badge>
                         </Link>
                      </TableCell>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell>{stock.sector || "N/A"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                            No stocks found matching your criteria.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
