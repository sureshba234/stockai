"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { analyzeMarketSector, type AnalyzeMarketSectorOutput } from "@/ai/flows/analyze-market-sector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, BarChartBig, Users, Forward, FileText, BrainCircuit } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  sector: z.string().min(3, "Market sector must be at least 3 characters."),
});

type FormData = z.infer<typeof formSchema>;

const sectors = [
    "Aerospace & Defense",
    "Agricultural Food & other Products",
    "Agricultural, Commercial & Construction Vehicles",
    "Auto Components",
    "Automobiles",
    "Banks",
    "Beverages",
    "Capital Markets",
    "Cement & Cement Products",
    "Chemicals & Petrochemicals",
    "Cigarettes & Tobacco Products",
    "Commercial Services & Supplies",
    "Construction",
    "Consumable Fuels",
    "Consumer Durables",
    "Diversified",
    "Diversified FMCG",
    "Diversified Metals",
    "Electrical Equipment",
    "Technology",
    "Healthcare",
    "Financial Services",
    "Renewable Energy",
    "Cloud Computing"
];


export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeMarketSectorOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sector: "Artificial Intelligence Hardware",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const apiResult = await analyzeMarketSector(data);
      setResult(apiResult);
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed the ${data.sector} sector.`
      })
    } catch (error) {
      console.error("Error analyzing sector:", error);
      toast({
        title: "Error",
        description: "Failed to analyze market sector. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSectorClick = (sector: string) => {
    form.setValue('sector', sector);
    onSubmit({ sector });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
            <Card>
                <CardHeader>
                <CardTitle>AI-Powered Market Sector Analysis</CardTitle>
                <CardDescription>Enter a market sector to generate a comprehensive analysis of key players, trends, and future outlook.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
                    <FormField
                        control={form.control}
                        name="sector"
                        render={({ field }) => (
                        <FormItem className="flex-grow">
                            <FormLabel>Market Sector</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., 'Renewable Energy' or 'Cloud Computing'" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                        {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <Zap className="mr-2 h-4 w-4" />
                        )}
                        Analyze
                    </Button>
                    </form>
                </Form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Browse Sectors</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {sectors.map(sector => (
                            <Button 
                                key={sector} 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleSectorClick(sector)}
                                disabled={isLoading}
                            >
                                {sector}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="flex flex-col">
            {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg h-full">
                <div className="relative mb-4">
                    <BrainCircuit className="w-24 h-24 text-primary animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold">Analyzing Sector...</h3>
                <p className="text-muted-foreground">The AI is processing data, identifying trends, and generating insights. This may take a moment.</p>
            </div>
            )}

            {!isLoading && !result && (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full">
                <BarChartBig className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Your Analytics Hub</h3>
                <p className="text-muted-foreground">Enter a sector or select one from the browser to begin your deep-dive analysis.</p>
            </div>
            )}
            
            {result && (
            <Card>
                <CardHeader>
                <CardTitle>Analysis for: {form.getValues("sector")}</CardTitle>
                <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                
                <div className="space-y-4">
                    <h3 className="flex items-center text-lg font-semibold"><Users className="mr-2 text-primary" /> Key Players</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.keyPlayers}</p>
                </div>
                
                <Separator />

                <div className="space-y-4">
                    <h3 className="flex items-center text-lg font-semibold"><Forward className="mr-2 text-primary" /> Recent Trends</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.recentTrends}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                    <h3 className="flex items-center text-lg font-semibold"><Zap className="mr-2 text-primary" /> Future Outlook</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.futureOutlook}</p>
                </div>
                
                <Separator />

                <div className="space-y-4">
                    <h3 className="flex items-center text-lg font-semibold"><FileText className="mr-2 text-primary" /> Investment Summary</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.investmentSummary}</p>
                </div>
                </CardContent>
            </Card>
            )}
        </div>
      </div>
    </div>
  );
}
