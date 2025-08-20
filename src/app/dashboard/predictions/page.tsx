"use client";

import { cn } from "@/lib/utils"
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BarChart2, Info, TrendingUp, TrendingDown, Wand, Download, AlertCircle } from "lucide-react";
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend, Bar, Line, Area } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data generation
const generateMockPredictionData = ({ volatility = 0.5, trend = 0.1 } = {}) => {
  const data = [];
  const today = new Date();
  let price = 150;

  // Historical data
  for (let i = 60; i > 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    price += (Math.random() - 0.5) * 5;
    data.push({
      date: date.toISOString().split("T")[0],
      actual: price,
    });
  }

  // Forecast data
  let forecastPrice = price;
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const randomFactor = (Math.random() - 0.5) * volatility * 10;
    forecastPrice += trend + randomFactor;
    const lowerBound = forecastPrice * (1 - volatility * 0.2);
    const upperBound = forecastPrice * (1 + volatility * 0.2);
    data.push({
      date: date.toISOString().split("T")[0],
      forecast: forecastPrice,
      confidence: [lowerBound, upperBound]
    });
  }
  return data;
};

const formSchema = z.object({
  volatility: z.array(z.number()).default([50]),
  trend: z.array(z.number()).default([50]),
  scenario: z.string().default("neutral"),
});

type FormData = z.infer<typeof formSchema>;

const scenarioPresets = {
    neutral: { volatility: 0.5, trend: 0.1 },
    earnings_beat: { volatility: 0.8, trend: 0.5 },
    earnings_miss: { volatility: 1.2, trend: -0.3 },
    macro_shock: { volatility: 1.5, trend: -0.8 },
    sector_rally: { volatility: 0.6, trend: 0.6 },
};

export default function PredictionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState(() => generateMockPredictionData());
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      volatility: [50],
      trend: [50],
      scenario: 'neutral',
    },
  });

  const { volatility, trend, scenario } = form.watch();

  const metrics = useMemo(() => {
    const historicalData = chartData.filter(d => d.actual);
    if (historicalData.length === 0) return { startPrice: 0, endPrice: 0, change: 0, changePercent: 0 };
    const startPrice = historicalData[0].actual;
    const endPrice = historicalData[historicalData.length - 1].actual;
    const change = endPrice - startPrice;
    const changePercent = (change / startPrice) * 100;
    return { startPrice, endPrice, change, changePercent };
  }, [chartData]);
  
  const forecastMetrics = useMemo(() => {
    const forecastData = chartData.filter(d => d.forecast);
    if (forecastData.length === 0) return { startPrice: 0, endPrice: 0, change: 0, changePercent: 0 };
    const startPrice = forecastData[0].forecast;
    const endPrice = forecastData[forecastData.length - 1].forecast;
    const change = endPrice - startPrice;
    const changePercent = (change / startPrice) * 100;
    return { startPrice, endPrice, change, changePercent };
  }, [chartData]);

  function onSubmit(data: FormData) {
    setIsLoading(true);
    const settings = {
        volatility: data.volatility[0] / 50.0,
        trend: (data.trend[0] - 50) / 50.0
    }
    setChartData(generateMockPredictionData(settings));
    setIsLoading(false);
    toast({
      title: "Prediction Updated",
      description: "The forecast has been regenerated with the new parameters.",
    });
  }
  
  function onScenarioChange(scenarioKey: keyof typeof scenarioPresets) {
    const scenario = scenarioPresets[scenarioKey];
    const newVolatility = scenario.volatility * 50;
    const newTrend = scenario.trend * 50 + 50;

    form.setValue('volatility', [newVolatility]);
    form.setValue('trend', [newTrend]);
    form.setValue('scenario', scenarioKey);

    setIsLoading(true);
    setChartData(generateMockPredictionData(scenario));
    setIsLoading(false);
     toast({
      title: `Scenario Loaded: ${scenarioKey.replace(/_/g, ' ')}`,
      description: "The forecast has been updated with the scenario presets.",
    });
  }
  
  const handleExport = () => {
    toast({
        title: "Export Initiated",
        description: "In a real app, this would export the chart data as a CSV."
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Price Forecast &amp; Analysis</CardTitle>
                <CardDescription>Visualizing historical actuals vs. AI-powered future predictions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-96">
                  <ResponsiveContainer>
                    <ComposedChart data={chartData}>
                       <defs>
                        <linearGradient id="confidence" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v.toFixed(0)}`} domain={['auto', 'auto']} tick={{fontSize: 12}} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background))",
                          borderColor: "hsl(var(--border))",
                        }}
                         formatter={(value: any, name: string) => {
                           if (name === 'confidence') {
                             return [`$${value[0].toFixed(2)} - $${value[1].toFixed(2)}`, 'Confidence'];
                           }
                           return [`$${value.toFixed(2)}`, name.charAt(0).toUpperCase() + name.slice(1)];
                         }}
                      />
                      <Legend />
                      <Line dataKey="actual" stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" dot={false} name="Actual" />
                      <Line dataKey="forecast" stroke="hsl(var(--primary))" dot={false} strokeWidth={2} name="Forecast" />
                      <Area type="monotone" dataKey="confidence" fill="url(#confidence)" stroke="" name="Confidence Band" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>What-If Exploration</CardTitle>
                    <CardDescription>Adjust parameters to explore different prediction scenarios.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onChange={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="scenario"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Scenario Presets</FormLabel>
                                         <Select onValueChange={(value) => onScenarioChange(value as any)} value={field.value}>
                                            <FormControl>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="neutral">Neutral</SelectItem>
                                                <SelectItem value="earnings_beat">Earnings Beat</SelectItem>
                                                <SelectItem value="earnings_miss">Earnings Miss</SelectItem>
                                                <SelectItem value="macro_shock">Macro Shock</SelectItem>
                                                <SelectItem value="sector_rally">Sector Rally</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="volatility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Volatility ({field.value[0]}%)</FormLabel>
                                        <FormControl>
                                            <Slider
                                                min={10} max={200} step={1}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="trend"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Trend Strength ({field.value[0] - 50})</FormLabel>
                                        <FormControl>
                                            <Slider
                                                min={0} max={100} step={1}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Export Data (CSV)
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Historical Performance</CardTitle>
                <CardDescription>60-day lookback</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{metrics.change >= 0 ? "+" : ""}${metrics.change.toFixed(2)}</div>
                <div className={cn("text-sm", metrics.change >= 0 ? "text-green-500" : "text-red-500")}>
                    {metrics.changePercent.toFixed(2)}%
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Forecasted Performance</CardTitle>
                <CardDescription>30-day outlook</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="text-2xl font-bold">{forecastMetrics.change >= 0 ? "+" : ""}${forecastMetrics.change.toFixed(2)}</div>
                 <div className={cn("text-sm", forecastMetrics.change >= 0 ? "text-green-500" : "text-red-500")}>
                    {forecastMetrics.changePercent.toFixed(2)}%
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Key Error Metrics</CardTitle>
                <CardDescription>Model accuracy on historical data</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MAE:</span>
                    <span className="font-medium">$5.21</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">RMSE:</span>
                    <span className="font-medium">$7.88</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MAPE:</span>
                    <span className="font-medium">3.45%</span>
                </div>
            </CardContent>
        </Card>
      </div>
       <Card className="bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-4">
                <AlertCircle className="w-6 h-6 text-muted-foreground" />
                <div>
                    <CardTitle>Disclaimer</CardTitle>
                    <CardDescription>This information is for educational and illustrative purposes only. It is not financial advice. All predictions are based on models and may not be accurate.</CardDescription>
                </div>
            </CardHeader>
       </Card>
    </div>
  );
}
