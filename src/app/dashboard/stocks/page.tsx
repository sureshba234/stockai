"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { FileText, Newspaper, BarChart, ArrowUp, ArrowDown } from 'lucide-react';


const stockData = {
  name: "Apple Inc.",
  ticker: "AAPL",
  price: "214.29",
  change: "+4.59",
  changePercent: "+2.19%",
  isUp: true
};

const chartData = [
  { date: '2024-07-01', price: 200 },
  { date: '2024-07-02', price: 205 },
  { date: '2024-07-03', price: 203 },
  { date: '2024-07-04', price: 208 },
  { date: '2024-07-05', price: 210 },
  { date: '2024-07-08', price: 214 },
  { date: '2024-07-09', price: 212 },
  { date: '2024-07-10', price: 214.29 },
];

const fundamentalsData = [
    { label: "Market Cap", value: "3.28T" },
    { label: "P/E Ratio (TTM)", value: "33.19" },
    { label: "EPS (TTM)", value: "6.46" },
    { label: "Revenue (TTM)", value: "381.62B" },
    { label: "Net Income (TTM)", value: "100.39B" },
    { label: "Shares Outstanding", value: "15.33B" },
    { label: "Beta (5Y Monthly)", value: "1.24" },
    { label: "Dividend Yield", value: "0.46%" },
]

export default function StocksPage() {
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
              <LineChart data={chartData}>
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
                        {fundamentalsData.map((item) => (
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
