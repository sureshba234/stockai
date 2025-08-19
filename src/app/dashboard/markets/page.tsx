"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { generateMockMarketMovers } from "@/lib/mock-stock-data";
import Link from "next/link";

const topGainers = generateMockMarketMovers(5, 'gainers');
const topLosers = generateMockMarketMovers(5, 'losers');

export default function MarketsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Markets</h1>
        <p className="text-muted-foreground">Get a high-level overview of the market and spot key trends.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Gainers</CardTitle>
            <CardDescription>Stocks with the highest price increase today.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topGainers.map((stock) => (
                  <TableRow key={stock.ticker}>
                    <TableCell>
                      <Link href={`/dashboard/stocks?q=${stock.ticker}`} className="hover:underline">
                        <div className="font-medium">{stock.ticker}</div>
                        <div className="text-xs text-muted-foreground">{stock.name}</div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">${stock.price}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-950">
                        <ArrowUpRight className="mr-1 h-4 w-4" />
                        {stock.changePercent}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Losers</CardTitle>
            <CardDescription>Stocks with the highest price decrease today.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topLosers.map((stock) => (
                  <TableRow key={stock.ticker}>
                    <TableCell>
                       <Link href={`/dashboard/stocks?q=${stock.ticker}`} className="hover:underline">
                        <div className="font-medium">{stock.ticker}</div>
                        <div className="text-xs text-muted-foreground">{stock.name}</div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">${stock.price}</TableCell>
                    <TableCell className="text-right">
                       <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-700 dark:bg-red-950">
                        <ArrowDownRight className="mr-1 h-4 w-4" />
                        {stock.changePercent}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
