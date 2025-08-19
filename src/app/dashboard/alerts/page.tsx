
"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { stockData } from "@/lib/stocks";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, PlusCircle, Trash2, Bell, Mail, MessageSquare, Send, BellRing } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const conditionSchema = z.object({
  metric: z.enum(["price", "ma50", "ma200", "volume"]),
  operator: z.enum(["crosses_above", "crosses_below", "is_above", "is_below", "is_greater_than", "is_less_than"]),
  value: z.coerce.number().optional(),
});

const alertFormSchema = z.object({
  ticker: z.string().min(1, "Please select a stock."),
  name: z.string().min(1, "Alert name is required."),
  conditions: z.array(conditionSchema).min(1, "At least one condition is required."),
  channels: z.array(z.string()).min(1, "Please select at least one notification channel."),
});

type AlertFormData = z.infer<typeof alertFormSchema>;

export default function AlertsPage() {
  const { toast } = useToast();
  const [isTickerOpen, setIsTickerOpen] = useState(false);

  const form = useForm<AlertFormData>({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      ticker: "",
      name: "",
      conditions: [{ metric: "price", operator: "crosses_above", value: 0 }],
      channels: ["in-app"],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "conditions",
  });

  const onSubmit = (data: AlertFormData) => {
    console.log("Alert Created:", data);
    toast({
      title: "Alert Created Successfully!",
      description: `Your alert "${data.name}" for ${data.ticker} has been saved.`,
    });
    form.reset();
  };
  
  const deliveryChannels = [
      { id: 'in-app', label: 'In-App Notification', icon: Bell },
      { id: 'email', label: 'Email', icon: Mail },
      { id: 'sms', label: 'SMS', icon: MessageSquare },
      { id: 'webhook', label: 'Webhook', icon: Send },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create & Manage Alerts</h1>
        <p className="text-muted-foreground">Build custom, compound alerts to stay on top of market movements.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Alert</CardTitle>
          <CardDescription>Define the conditions and delivery channels for your new alert.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="ticker"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Stock Ticker</FormLabel>
                      <Popover open={isTickerOpen} onOpenChange={setIsTickerOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                              {field.value ? `${field.value.toUpperCase()} - ${stockData.find(s => s.ticker === field.value)?.name}` : "Select a stock"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                          <Command>
                            <CommandInput placeholder="Search stocks..." />
                            <CommandList>
                              <CommandEmpty>No results found.</CommandEmpty>
                              <CommandGroup>
                                {stockData.map((stock) => (
                                  <CommandItem
                                    key={stock.ticker}
                                    value={stock.ticker}
                                    onSelect={(currentValue) => {
                                      form.setValue("ticker", currentValue.toUpperCase());
                                      setIsTickerOpen(false);
                                    }}
                                  >
                                    {stock.name} ({stock.ticker})
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alert Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 'AAPL Breakout Alert'" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              
              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Conditions</h3>
                <p className="text-sm text-muted-foreground mb-4">Define the logic that will trigger this alert. All conditions must be true.</p>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-4 border rounded-lg bg-muted/50">
                      <FormField
                        control={form.control}
                        name={`conditions.${index}.metric`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Metric</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="price">Price</SelectItem>
                                <SelectItem value="ma50">50-Day MA</SelectItem>
                                <SelectItem value="ma200">200-Day MA</SelectItem>
                                <SelectItem value="volume">Volume</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`conditions.${index}.operator`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Operator</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="crosses_above">Crosses Above</SelectItem>
                                <SelectItem value="crosses_below">Crosses Below</SelectItem>
                                <SelectItem value="is_above">Is Above</SelectItem>
                                <SelectItem value="is_below">Is Below</SelectItem>
                                <SelectItem value="is_greater_than">Is Greater Than</SelectItem>
                                <SelectItem value="is_less_than">Is Less Than</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                       <FormField
                          control={form.control}
                          name={`conditions.${index}.value`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter target value" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                   <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ metric: 'price', operator: 'crosses_above', value: 0})}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Condition
                  </Button>
                </div>
                 <FormMessage>{form.formState.errors.conditions?.message}</FormMessage>
              </div>

                <Separator />
              
                <div>
                    <h3 className="text-lg font-medium mb-2">Delivery Channels</h3>
                    <p className="text-sm text-muted-foreground mb-4">Where should we send the notification when this alert is triggered?</p>
                    <FormField
                        control={form.control}
                        name="channels"
                        render={() => (
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {deliveryChannels.map((channel) => {
                                const Icon = channel.icon;
                                return (
                                <FormField
                                    key={channel.id}
                                    control={form.control}
                                    name="channels"
                                    render={({ field }) => {
                                    return (
                                        <FormItem 
                                            key={channel.id}
                                            className={cn(
                                                "flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 cursor-pointer transition-colors",
                                                field.value?.includes(channel.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                                            )}
                                            onClick={() => {
                                                const a = form.getValues("channels");
                                                const valueSet = new Set(a);
                                                if (valueSet.has(channel.id)) {
                                                    valueSet.delete(channel.id);
                                                } else {
                                                    valueSet.add(channel.id);
                                                }
                                                form.setValue("channels", Array.from(valueSet));
                                            }}
                                        >
                                        <FormControl>
                                            <div className="flex items-center gap-3">
                                                <Icon className="h-5 w-5 text-muted-foreground" />
                                                <FormLabel className="font-normal cursor-pointer">
                                                    {channel.label}
                                                </FormLabel>
                                            </div>
                                        </FormControl>
                                        </FormItem>
                                    )
                                    }}
                                />
                                )
                            })}
                            </div>
                        )}
                    />
                     <FormMessage>{form.formState.errors.channels?.message}</FormMessage>
                </div>
              
              <Button type="submit" size="lg">
                <BellRing className="mr-2 h-4 w-4" />
                Create Alert
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
