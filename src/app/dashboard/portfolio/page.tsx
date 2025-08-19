"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Loader2, PlusCircle, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { stockData as stockList } from "@/lib/stocks";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const transactionSchema = z.object({
  ticker: z.string().min(1, "Ticker is required."),
  type: z.enum(["buy", "sell"]),
  shares: z.coerce.number().positive("Shares must be a positive number."),
  price: z.coerce.number().positive("Price must be a positive number."),
  date: z.date(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

function AddTransactionDialog({ onTransactionAdd }: { onTransactionAdd: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const { addTransaction } = usePortfolio();
  const { toast } = useToast();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      ticker: "",
      type: "buy",
      shares: 0,
      price: 0,
      date: new Date(),
    },
  });
  
  const [isTickerOpen, setIsTickerOpen] = useState(false)

  function onSubmit(data: TransactionFormData) {
    addTransaction({ ...data, id: crypto.randomUUID() });
    toast({
      title: "Transaction Added",
      description: `Successfully added ${data.type} transaction for ${data.shares} shares of ${data.ticker}.`,
    });
    onTransactionAdd();
    form.reset();
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>Record a new stock purchase or sale to track in your portfolio.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ticker"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ticker</FormLabel>
                   <Popover open={isTickerOpen} onOpenChange={setIsTickerOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                           aria-expanded={isTickerOpen}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? stockList.find(
                                (stock) => stock.ticker.toUpperCase() === field.value.toUpperCase()
                              )?.name
                            : "Select stock"}
                           <TrendingUp className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                       <Command>
                        <CommandInput placeholder="Search stocks..." />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {stockList.map((stock) => (
                                <CommandItem
                                    key={stock.ticker}
                                    value={stock.ticker}
                                    onSelect={(currentValue) => {
                                      form.setValue("ticker", currentValue.toUpperCase())
                                      setIsTickerOpen(false)
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="shares" render={({ field }) => ( <FormItem> <FormLabel>Shares</FormLabel> <FormControl><Input type="number" step="any" placeholder="0.00" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Price per Share</FormLabel> <FormControl><Input type="number" step="any" placeholder="0.00" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            </div>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Transaction Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")} >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Add Transaction</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function PortfolioPage() {
  const { holdings, summary, isLoading, transactions, removeTransaction, refreshPortfolio } = usePortfolio();
  const { toast } = useToast();

  const handleRemove = (id: string, ticker: string) => {
    if(window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      removeTransaction(id);
      toast({
        title: "Transaction Removed",
        description: `The transaction for ${ticker} has been removed.`,
        variant: "destructive"
      });
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">Track your investments and performance.</p>
        </div>
        <AddTransactionDialog onTransactionAdd={refreshPortfolio} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : transactions.length === 0 ? (
        <Card>
           <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                    <Wallet className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">Your Portfolio is Empty</h3>
                    <p className="text-muted-foreground">Add your first transaction to start tracking your investments.</p>
                </div>
           </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profit/Loss</CardTitle>
                {summary.totalPL >= 0 ? <TrendingUp className="h-4 w-4 text-muted-foreground" /> : <TrendingDown className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", summary.totalPL >= 0 ? "text-green-600" : "text-red-600")}>
                  {summary.totalPL >= 0 ? "+" : ""}${summary.totalPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className={cn("text-xs text-muted-foreground", summary.totalPL >= 0 ? "text-green-500" : "text-red-500")}>
                   ({summary.totalPLPercent.toFixed(2)}%)
                </p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${summary.totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Holdings</CardTitle>
              <CardDescription>Your current stock positions and their performance.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticker</TableHead>
                    <TableHead>Shares</TableHead>
                    <TableHead>Avg. Cost</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>P/L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(holdings).map((holding) => (
                    <TableRow key={holding.ticker}>
                      <TableCell className="font-medium">{holding.ticker}</TableCell>
                      <TableCell>{holding.shares.toLocaleString()}</TableCell>
                      <TableCell>${holding.averageCost.toFixed(2)}</TableCell>
                      <TableCell>${holding.currentPrice.toFixed(2)}</TableCell>
                      <TableCell>${holding.marketValue.toFixed(2)}</TableCell>
                      <TableCell className={holding.profitOrLoss >= 0 ? "text-green-600" : "text-red-600"}>
                        {holding.profitOrLoss.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your most recent buy and sell orders.</CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Ticker</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Shares</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Total</TableHead>
                           <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                   <TableBody>
                        {[...transactions].reverse().slice(0, 10).map((tx) => (
                           <TableRow key={tx.id}>
                               <TableCell>{format(new Date(tx.date), "PPP")}</TableCell>
                               <TableCell className="font-medium">{tx.ticker}</TableCell>
                               <TableCell className={cn("capitalize", tx.type === 'buy' ? 'text-green-600' : 'text-red-600')}>{tx.type}</TableCell>
                               <TableCell>{tx.shares}</TableCell>
                               <TableCell>${tx.price.toFixed(2)}</TableCell>
                               <TableCell>${(tx.shares * tx.price).toFixed(2)}</TableCell>
                               <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleRemove(tx.id, tx.ticker)}>
                                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                    </Button>
                               </TableCell>
                           </TableRow>
                        ))}
                   </TableBody>
               </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

    