"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { stockData } from '@/lib/stocks';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

export default function ScreenerPage() {
  const [sectorFilter, setSectorFilter] = useState('All');

  const sectors = useMemo(() => {
    const allSectors = new Set(stockData.map(stock => stock.sector));
    return ['All', ...Array.from(allSectors).sort()];
  }, []);

  const filteredStocks = useMemo(() => {
    if (sectorFilter === 'All') {
      return stockData;
    }
    return stockData.filter(stock => stock.sector === sectorFilter);
  }, [sectorFilter]);

  return (
    <div className="flex flex-col gap-8">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Stock Screener</h1>
        <p className="text-muted-foreground">Filter and discover stocks based on your criteria.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Apply filters to find stocks that match your strategy.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col space-y-1.5">
                <Label htmlFor="sector-filter">Sector</Label>
                <Select value={sectorFilter} onValueChange={setSectorFilter}>
                    <SelectTrigger id="sector-filter">
                        <SelectValue placeholder="Select a sector" />
                    </SelectTrigger>
                    <SelectContent>
                        {sectors.map(sector => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Screening Results</CardTitle>
            <CardDescription>Found {filteredStocks.length} stocks matching your criteria.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Sector</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStocks.length > 0 ? (
                    filteredStocks.map(stock => (
                    <TableRow key={stock.ticker}>
                      <TableCell>
                         <Link href={`/dashboard/stocks?q=${stock.ticker}`} className="hover:underline">
                            <Badge variant="outline">{stock.ticker}</Badge>
                         </Link>
                      </TableCell>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell>{stock.sector}</TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                            No stocks found matching your criteria.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
