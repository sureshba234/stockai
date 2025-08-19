"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { getStockData } from "@/ai/flows/get-stock-data";
import type { StockDataOutput } from "@/ai/schemas/stock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Star, ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [stockData, setStockData] = useState<StockDataOutput[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const savedWatchlist = JSON.parse(localStorage.getItem("watchlist") || "[]") as string[];
    setWatchlist(savedWatchlist);
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (watchlist.length === 0) {
        setStockData([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await Promise.all(
          watchlist.map(ticker => getStockData({ ticker }))
        );
        setStockData(data.filter(Boolean) as StockDataOutput[]);
      } catch (error) {
        console.error("Failed to fetch watchlist data", error);
        toast({
          title: "Error",
          description: "Could not fetch watchlist data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [watchlist, toast]);

  const handleRemoveFromWatchlist = (ticker: string) => {
    const newWatchlist = watchlist.filter(t => t !== ticker);
    localStorage.setItem("watchlist", JSON.stringify(newWatchlist));
    setWatchlist(newWatchlist);
    toast({
      title: "Removed from Watchlist",
      description: `${ticker} has been removed from your watchlist.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Watchlist</CardTitle>
        <CardDescription>A collection of stocks you are tracking. Add or remove stocks from the main Stocks page.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : stockData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockData.map((stock) => (
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
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFromWatchlist(stock.ticker)}
                      aria-label={`Remove ${stock.ticker} from watchlist`}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
            <Star className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Your Watchlist is Empty</h3>
            <p className="text-muted-foreground">Search for a stock and click the star icon to add it to your watchlist.</p>
            <Link href="/dashboard/stocks?q=AAPL" className="mt-4">
                <Button>
                    Go to Stocks
                </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
