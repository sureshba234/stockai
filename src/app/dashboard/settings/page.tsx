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
    finnhubApiKey: z.string().optional(),
    alphaVantageApiKey: z.string().optional(),
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
    defaultValues: { finnhubApiKey: "", alphaVantageApiKey: "" },
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
    toast({
      title: "API Keys Saved",
      description: "Your API keys have been saved locally. Note: For production, use a secure backend to store keys.",
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
          <CardDescription>Manage your API keys for financial data providers. Keys are stored in your browser's local storage.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...apiKeysForm}>
            <form onSubmit={apiKeysForm.handleSubmit(onApiKeysSubmit)} className="space-y-4">
                <FormField control={apiKeysForm.control} name="finnhubApiKey" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Finnhub API Key</FormLabel>
                        <FormControl><Input type="password" placeholder="Enter your Finnhub API key" {...field} /></FormControl>
                        <FormDescription>Used as the primary data source for stock information.</FormDescription>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={apiKeysForm.control} name="alphaVantageApiKey" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Alpha Vantage API Key</FormLabel>
                        <FormControl><Input type="password" placeholder="Enter your Alpha Vantage API key" {...field} /></FormControl>
                        <FormDescription>Used as a fallback data source.</FormDescription>
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