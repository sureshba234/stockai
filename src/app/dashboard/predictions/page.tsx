"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { enhanceFinancialPredictions, type EnhanceFinancialPredictionsOutput } from "@/ai/flows/enhance-financial-predictions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BarChart2 } from "lucide-react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

const formSchema = z.object({
  predictionData: z.string().min(1, "Prediction data is required.").refine(
    (val) => {
      try {
        JSON.parse(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    { message: "Must be valid JSON." }
  ),
  modelDescription: z.string().min(1, "Model description is required."),
});

type FormData = z.infer<typeof formSchema>;

const mockPredictionData = [
  { name: 'Q1', revenue: 4000, profit: 2400 },
  { name: 'Q2', revenue: 3000, profit: 1398 },
  { name: 'Q3', revenue: 2000, profit: 9800 },
  { name: 'Q4', revenue: 2780, profit: 3908 },
];

export default function PredictionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EnhanceFinancialPredictionsOutput | null>(null);
  const [chartData, setChartData] = useState<any[]>(mockPredictionData);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      predictionData: JSON.stringify(mockPredictionData, null, 2),
      modelDescription: "A gradient boosting model trained on historical quarterly financial data to predict next quarter's revenue and profit.",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      setChartData(JSON.parse(data.predictionData));
      const apiResult = await enhanceFinancialPredictions(data);
      setResult(apiResult);
      toast({
          title: "Analysis Complete",
          description: "Your prediction has been enhanced with notes and a visualization."
      })
    } catch (error) {
      console.error("Error enhancing predictions:", error);
      toast({
        title: "Error",
        description: "Failed to enhance predictions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Enhance Financial Predictions</CardTitle>
          <CardDescription>Input prediction data and model details to generate visualizations and ML notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="predictionData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prediction Data (JSON)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter JSON data for prediction" {...field} rows={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modelDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the ML model used" {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enhance Prediction
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {isLoading && !result && (
            <Card className="flex h-full items-center justify-center">
                <div className="text-center p-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="mt-4 text-muted-foreground">AI is analyzing your data...</p>
                </div>
          </Card>
        )}

        {!isLoading && !result && (
            <Card className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full w-full">
                    <BarChart2 className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">Prediction Visualizer</h3>
                    <p className="text-muted-foreground">Enter your data to generate an enhanced visualization and analysis.</p>
                </div>
            </Card>
        )}

        {result && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{result.enhancedVisualization}</CardTitle>
                <CardDescription>Based on the provided data and model description.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-80">
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--background))",
                          borderColor: "hsl(var(--border))",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>ML-Specific Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{result.mlNotes}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
