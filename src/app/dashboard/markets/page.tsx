"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const topGainers = [
  { ticker: "NVDA", name: "NVIDIA Corp", price: "130.78", change: "+3.54%", changeAmount: "+4.47" },
  { ticker: "TSLA", name: "Tesla, Inc.", price: "187.35", change: "+2.89%", changeAmount: "+5.27" },
  { ticker: "AAPL", name: "Apple Inc.", price: "214.29", change: "+2.19%", changeAmount: "+4.59" },
  { ticker: "AMZN", name: "Amazon.com, Inc.", price: "189.08", change: "+1.60%", changeAmount: "+2.98" },
  { ticker: "GOOGL", name: "Alphabet Inc.", price: "180.79", change: "+1.42%", changeAmount: "+2.53" },
];

const topLosers = [
  { ticker: "LLY", name: "Eli Lilly and Co", price: "883.88", change: "-0.78%", changeAmount: "-6.97" },
  { ticker: "JPM", name: "JPMorgan Chase", price: "196.30", change: "-0.65%", changeAmount: "-1.29" },
  { ticker: "V", name: "Visa Inc.", price: "275.29", change: "-0.51%", changeAmount: "-1.41" },
  { ticker: "MA", name: "Mastercard Inc", price: "455.57", change: "-0.45%", changeAmount: "-2.06" },
  { ticker: "UNH", name: "UnitedHealth", price: "489.50", change: "-0.31%", changeAmount: "-1.52" },
];


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
                      <div className="font-medium">{stock.ticker}</div>
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </TableCell>
                    <TableCell className="text-right">${stock.price}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-950">
                        <ArrowUpRight className="mr-1 h-4 w-4" />
                        {stock.change}
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
                      <div className="font-medium">{stock.ticker}</div>
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </TableCell>
                    <TableCell className="text-right">${stock.price}</TableCell>
                    <TableCell className="text-right">
                       <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-700 dark:bg-red-950">
                        <ArrowDownRight className="mr-1 h-4 w-4" />
                        {stock.change}
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
