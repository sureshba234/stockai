"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Please enter a valid email."),
});

const apiKeysFormSchema = z.object({
    openaiApiKey: z.string().optional(),
    polygonApiKey: z.string().optional(),
    financialModelingPrepApiKey: z.string().optional(),
    finnhubApiKey: z.string().optional(),
    twelveDataApiKey: z.string().optional(),
    alphaVantageApiKey: z.string().optional(),
    marketstackApiKey: z.string().optional(),
});

const appearanceFormSchema = z.object({
  theme: z.string(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;
type ApiKeysFormData = z.infer<typeof apiKeysFormSchema>;
type AppearanceFormData = z.infer<typeof appearanceFormSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: "", email: "" },
  });

  const apiKeysForm = useForm<ApiKeysFormData>({
    resolver: zodResolver(apiKeysFormSchema),
    defaultValues: { 
        openaiApiKey: "",
        polygonApiKey: "",
        financialModelingPrepApiKey: "",
        finnhubApiKey: "", 
        twelveDataApiKey: "",
        alphaVantageApiKey: "",
        marketstackApiKey: "",
     },
  });
  
  const appearanceForm = useForm<AppearanceFormData>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: { theme: theme || "system" },
  });

  useEffect(() => {
    if (isClient) {
      const storedProfile = localStorage.getItem("userProfile");
      if (storedProfile) {
        profileForm.reset(JSON.parse(storedProfile));
      } else {
        profileForm.reset({ name: "User", email: "user@example.com" });
      }

      const storedApiKeys = localStorage.getItem("apiKeys");
      if (storedApiKeys) {
        apiKeysForm.reset(JSON.parse(storedApiKeys));
      }
      
      appearanceForm.setValue("theme", theme || "system");
    }
  }, [isClient, profileForm, apiKeysForm, theme, appearanceForm]);
  
  useEffect(() => {
    appearanceForm.setValue("theme", theme || "system");
  }, [theme, appearanceForm]);

  function onProfileSubmit(data: ProfileFormData) {
    localStorage.setItem("userProfile", JSON.stringify(data));
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
  }
  
  function onApiKeysSubmit(data: ApiKeysFormData) {
    localStorage.setItem("apiKeys", JSON.stringify(data));
    // NOTE: This is NOT a secure way to handle API keys for a real production app.
    // This is a workaround for the demo environment. A real app would send this
    // to a secure backend that sets an HttpOnly cookie or uses a secure secret manager.
    // To make this work for the demo, we are asking the user to refresh.
    toast({
      title: "API Keys Saved",
      description: "Your API keys have been saved locally. Please refresh the page for them to take effect.",
    });
  }
  
  function onAppearanceSubmit(data: AppearanceFormData) {
    setTheme(data.theme);
     toast({
      title: "Theme Updated",
      description: `Switched to ${data.theme} theme.`,
    });
  }

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings, API keys, and theme preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>This is how others will see you on the site.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField control={profileForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={profileForm.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit">Save Profile</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage your API keys for financial data providers. Keys are stored in your browser's local storage and require a page refresh to apply.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...apiKeysForm}>
            <form onSubmit={apiKeysForm.handleSubmit(onApiKeysSubmit)} className="space-y-6">
                <FormField control={apiKeysForm.control} name="openaiApiKey" render={({ field }) => (
                    <FormItem>
                        <FormLabel>OpenAI API Key (Primary for Agent)</FormLabel>
                        <FormControl><Input type="password" placeholder="sk-..." {...field} /></FormControl>
                        <FormDescription>Used for the conversational AI agent on the dashboard.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={apiKeysForm.control} name="polygonApiKey" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Polygon.io API Key (Primary)</FormLabel>
                        <FormControl><Input type="password" placeholder="Enter your Polygon.io API key" {...field} /></FormControl>
                        <FormDescription>High-quality, primary data source.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={apiKeysForm.control} name="financialModelingPrepApiKey" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Financial Modeling Prep API Key</FormLabel>
                        <FormControl><Input type="password" placeholder="Enter your FMP API key" {...field} /></FormControl>
                        <FormDescription>Excellent source for fundamentals and general data.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={apiKeysForm.control} name="finnhubApiKey" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Finnhub API Key</FormLabel>
                        <FormControl><Input type="password" placeholder="Enter your Finnhub API key" {...field} /></FormControl>
                        <FormDescription>Good all-around data source.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={apiKeysForm.control} name="twelveDataApiKey" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Twelve Data API Key</FormLabel>
                        <FormControl><Input type="password" placeholder="Enter your Twelve Data API key" {...field} /></FormControl>
                         <FormDescription>Good for real-time and historical data.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={apiKeysForm.control} name="alphaVantageApiKey" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Alpha Vantage API Key</FormLabel>
                        <FormControl><Input type="password" placeholder="Enter your Alpha Vantage API key" {...field} /></FormControl>
                        <FormDescription>A free but rate-limited fallback source.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                 <FormField control={apiKeysForm.control} name="marketstackApiKey" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Marketstack API Key</FormLabel>
                        <FormControl><Input type="password" placeholder="Enter your Marketstack API key" {...field} /></FormControl>
                        <FormDescription>Another fallback data source.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
              <Button type="submit">Save API Keys</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...appearanceForm}>
            <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-4">
                <FormField
                  control={appearanceForm.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a theme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Select the theme for the dashboard.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <Button type="submit">Save Theme</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
