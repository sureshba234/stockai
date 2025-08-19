"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { discoverCrossAssetRelations, type DiscoverCrossAssetRelationsOutput } from "@/ai/flows/discover-cross-asset-relations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  assetList: z.string().min(1, "Asset list is required."),
  analysisType: z.string().min(1, "Analysis type is required."),
});

type FormData = z.infer<typeof formSchema>;

export default function RelationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiscoverCrossAssetRelationsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetList: "AAPL, MSFT, GOOGL, AMZN, NVDA",
      analysisType: "co-movement",
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setResult(null);
    try {
      const apiResult = await discoverCrossAssetRelations(data);
      setResult(apiResult);
    } catch (error) {
      console.error("Error discovering relations:", error);
      toast({
        title: "Error",
        description: "Failed to discover relations. Please try again.",
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
          <CardTitle>Discover Cross-Asset Relations</CardTitle>
          <CardDescription>Analyze relationships between financial assets using graph neural networks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="assetList"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset List</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., AAPL, GOOG, MSFT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="analysisType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Analysis Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select analysis type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="correlation">Correlation</SelectItem>
                        <SelectItem value="co-movement">Co-movement</SelectItem>
                        <SelectItem value="influence">Influence</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Discover Relations
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
                <CardTitle>Discovered Relations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{result.relations}</p>
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Confidence Score</span>
                    <span className="text-sm font-medium text-primary">{(result.confidenceScore * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={result.confidenceScore * 100} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{result.explanation}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
