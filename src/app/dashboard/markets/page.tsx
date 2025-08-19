"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { generateMockMarketMovers } from "@/lib/mock-stock-data";
import Link from "next/link";
import { useEffect, useState } from "react";

type Mover = {
    ticker: string;
    name: string;
    price: string;
    change: string;
    changePercent: string;
    isUp: boolean;
};


export default function MarketsPage() {
  const [topGainers, setTopGainers] = useState<Mover[]>([]);
  const [topLosers, setTopLosers] = useState<Mover[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTopGainers(generateMockMarketMovers(5, 'gainers'));
    setTopLosers(generateMockMarketMovers(5, 'losers'));
    setIsLoading(false);
  }, []);

  const renderTable = (title: string, description: string, data: Mover[], isGainer: boolean) => (
      <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Ticker</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((stock) => (
                    <TableRow key={stock.ticker}>
                        <TableCell>
                        <Link href={`/dashboard/stocks?q=${stock.ticker}`} className="hover:underline">
                            <div className="font-medium">{stock.ticker}</div>
                            <div className="text-xs text-muted-foreground">{stock.name}</div>
                        </Link>
                        </TableCell>
                        <TableCell className="text-right">${stock.price}</TableCell>
                        <TableCell className="text-right">
                        <Badge variant="outline" className={isGainer ? "text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-950" : "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-700 dark:bg-red-950"}>
                            {isGainer ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
                            {stock.changePercent}
                        </Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
  )

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Markets</h1>
        <p className="text-muted-foreground">Get a high-level overview of the market and spot key trends.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {renderTable("Top Gainers", "Stocks with the highest price increase today.", topGainers, true)}
        {renderTable("Top Losers", "Stocks with the highest price decrease today.", topLosers, false)}
      </div>
    </div>
  );
}