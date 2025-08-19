
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
