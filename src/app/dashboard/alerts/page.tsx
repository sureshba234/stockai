"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { configureRealTimeMLAlerts, type ConfigureRealTimeMLAlertsOutput } from "@/ai/flows/configure-real-time-ml-alerts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  mlSignal: z.string().min(1, "ML signal is required."),
  threshold: z.coerce.number().min(0, "Threshold must be a positive number."),
  alertFrequency: z.string().min(1, "Alert frequency is required."),
  featureHandlingNotes: z.string().optional(),
  explainabilityNotes: z.string().optional(),
  confidenceNotes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AlertsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ConfigureRealTimeMLAlertsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mlSignal: "Model Drift Score",
      threshold: 0.85,
      alertFrequency: "daily",
      featureHandlingNotes: "The model is sensitive to sudden changes in transaction volume.",
      explainabilityNotes: "SHAP values are available for all predictions.",
      confidenceNotes: "Confidence is high for transactions under $1000.",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const apiResult = await configureRealTimeMLAlerts(data);
      setResult(apiResult);
    } catch (error) {
      console.error("Error configuring alert:", error);
      toast({
        title: "Error",
        description: "Failed to configure alert. Please try again.",
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
          <CardTitle>Configure Real-time Alert</CardTitle>
          <CardDescription>Set up alerts based on ML signals and thresholds, with optional ML-specific notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="mlSignal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ML Signal</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Anomaly Detection Score" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Threshold</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 0.95" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="alertFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField control={form.control} name="featureHandlingNotes" render={({ field }) => <FormItem><FormLabel>Feature Handling Notes (Optional)</FormLabel><FormControl><Textarea placeholder="Notes on feature handling..." {...field} /></FormControl></FormItem>} />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Configure Alert
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {result && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Alert Configuration Details</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-md bg-muted text-sm whitespace-pre-wrap">{result.alertConfiguration}</pre>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>ML Notes Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{result.mlNotesSummary}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
