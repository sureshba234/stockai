"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { Newspaper, BarChart } from 'lucide-react';
import { stockData } from "@/lib/stocks";

// Mock data structure - in a real app this would come from an API
const allStockData: { [key: string]: any } = {
  "AAPL": {
    name: "Apple Inc.",
    ticker: "AAPL",
    price: "214.29",
    change: "+4.59",
    changePercent: "+2.19%",
    isUp: true,
    chartData: [
      { date: '2024-07-01', price: 200 },
      { date: '2024-07-02', price: 205 },
      { date: '2024-07-03', price: 203 },
      { date: '2024-07-04', price: 208 },
      { date: '2024-07-05', price: 210 },
      { date: '2024-07-08', price: 214 },
      { date: '2024-07-09', price: 212 },
      { date: '2024-07-10', price: 214.29 },
    ],
    fundamentalsData: [
      { label: "Market Cap", value: "3.28T" },
      { label: "P/E Ratio (TTM)", value: "33.19" },
      { label: "EPS (TTM)", value: "6.46" },
      { label: "Revenue (TTM)", value: "381.62B" },
      { label: "Net Income (TTM)", value: "100.39B" },
      { label: "Shares Outstanding", value: "15.33B" },
      { label: "Beta (5Y Monthly)", value: "1.24" },
      { label: "Dividend Yield", value: "0.46%" },
    ]
  },
  "MSFT": {
    name: "Microsoft Corporation",
    ticker: "MSFT",
    price: "450.00",
    change: "-1.50",
    changePercent: "-0.33%",
    isUp: false,
    chartData: [
        { date: '2024-07-01', price: 440 },
        { date: '2024-07-02', price: 445 },
        { date: '2024-07-03', price: 442 },
        { date: '2024-07-04', price: 448 },
        { date: '2024-07-05', price: 452 },
        { date: '2024-07-08', price: 455 },
        { date: '2024-07-09', price: 451 },
        { date: '2024-07-10', price: 450.00 },
    ],
    fundamentalsData: [
      { label: "Market Cap", value: "3.34T" },
      { label: "P/E Ratio (TTM)", value: "38.7" },
      { label: "EPS (TTM)", value: "11.62" },
      { label: "Revenue (TTM)", value: "236.58B" },
      { label: "Net Income (TTM)", value: "86.19B" },
      { label: "Shares Outstanding", value: "7.43B" },
      { label: "Beta (5Y Monthly)", value: "0.91" },
      { label: "Dividend Yield", value: "0.66%" },
    ]
  },
   "RELIANCE.NS": {
    name: "Reliance Industries Limited",
    ticker: "RELIANCE.NS",
    price: "2,850.50",
    change: "+25.10",
    changePercent: "+0.89%",
    isUp: true,
    chartData: [
        { date: '2024-07-01', price: 2800 },
        { date: '2024-07-02', price: 2820 },
        { date: '2024-07-03', price: 2810 },
        { date: '2024-07-04', price: 2835 },
        { date: '2024-07-05', price: 2840 },
        { date: '2024-07-08', price: 2860 },
        { date: '2024-07-09', price: 2845 },
        { date: '2024-07-10', price: 2850.50 },
    ],
    fundamentalsData: [
        { label: "Market Cap", value: "19.28T" },
        { label: "P/E Ratio (TTM)", value: "28.5" },
        { label: "EPS (TTM)", value: "100.2" },
        { label: "Revenue (TTM)", value: "9.14T" },
        { label: "Net Income (TTM)", value: "677.58B" },
        { label: "Shares Outstanding", value: "6.76B" },
        { label: "Beta (5Y Monthly)", value: "1.15" },
        { label: "Dividend Yield", value: "0.32%" },
    ]
  }
};

const FallbackStock = allStockData["AAPL"];

export default function StocksPage() {
  const searchParams = useSearchParams();
  const [stockData, setStockData] = useState(FallbackStock);

  useEffect(() => {
    const queryTicker = searchParams.get('q')?.toUpperCase();
    if (queryTicker && allStockData[queryTicker]) {
      setStockData(allStockData[queryTicker]);
    } else {
      // Fallback to a default stock if ticker is not found or not present
      setStockData(FallbackStock);
    }
  }, [searchParams]);

  if (!stockData) {
      return (
         <Card>
            <CardHeader>
                <CardTitle>Stock not found</CardTitle>
                <CardDescription>Please search for a stock to see its details.</CardDescription>
            </CardHeader>
        </Card>
      )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{stockData.name} ({stockData.ticker})</h1>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-semibold">{stockData.price}</p>
            <p className={`text-lg font-semibold ${stockData.isUp ? "text-green-600" : "text-red-600"}`}>
              {stockData.isUp ? '+' : ''}{stockData.change} ({stockData.changePercent})
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96">
            <ResponsiveContainer>
              <LineChart data={stockData.chartData}>
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="fundamentals">
        <TabsList>
          <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>
        <TabsContent value="fundamentals">
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
        </TabsContent>
        <TabsContent value="news">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <Newspaper className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">Coming Soon</h3>
                        <p className="text-muted-foreground">The latest news and sentiment analysis will appear here.</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="predictions">
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <BarChart className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">Coming Soon</h3>
                        <p className="text-muted-foreground">AI-powered price predictions and what-if analysis will be available here.</p>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
