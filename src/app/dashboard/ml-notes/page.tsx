"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateMLNotes, type MLNotesOutput } from "@/ai/flows/generate-ml-notes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  modelName: z.string().min(1, "Model name is required."),
  featureList: z.string().min(1, "Feature list is required."),
  performanceMetrics: z.string().min(1, "Performance metrics are required."),
});

type FormData = z.infer<typeof formSchema>;

export default function MLNotesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<MLNotesOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      modelName: "Credit Score Predictor",
      featureList: "age, income, debt_to_income_ratio, credit_history_length",
      performanceMetrics: "AUC-ROC: 0.88, F1-Score: 0.82, Accuracy: 0.91",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setNotes(null);
    try {
      const result = await generateMLNotes(data);
      setNotes(result);
    } catch (error) {
      console.error("Error generating ML notes:", error);
      toast({
        title: "Error",
        description: "Failed to generate ML notes. Please try again.",
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
          <CardTitle>Generate ML Notes</CardTitle>
          <CardDescription>Provide model details to generate notes on feature handling, explainability, and confidence.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="modelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Fraud Detection Model" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featureList"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feature List</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Comma-separated list of features" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="performanceMetrics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Performance Metrics</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., AUC: 0.95, F1: 0.92" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Notes
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
        {notes && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Feature Handling Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{notes.featureHandlingNotes}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Explainability Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{notes.explainabilityNotes}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Confidence Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{notes.confidenceNotes}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
