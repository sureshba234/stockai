"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { navigationLinks } from "@/components/dashboard/sidebar-nav";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Search, History } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import React from 'react';
import { Input } from "@/components/ui/input";
import { stockData } from "@/lib/stocks";
import { useDebounce } from "@/hooks/use-debounce";
import { useLocalStorage } from "@/hooks/use-local-storage";
import Image from "next/image";
import { generateMockMarketMovers } from "@/lib/mock-stock-data";
import { cn } from "@/lib/utils";

type Mover = {
    ticker: string;
    price: string;
    changePercent: string;
    isUp: boolean;
};

function StockSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>("recentStockSearches", []);
  
  const [marketMovers, setMarketMovers] = useState<Record<string, Mover>>({});

  useEffect(() => {
    setIsMounted(true);
    const movers = generateMockMarketMovers(stockData.length, 'gainers');
    const moversMap: Record<string, Mover> = {};
    movers.forEach(mover => {
        moversMap[mover.ticker] = mover;
    })
    setMarketMovers(moversMap);

  }, []);

  const handleSelect = (ticker: string) => {
    router.push(`/dashboard/stocks?q=${ticker}`);
    setQuery("");
    setIsOpen(false);
    
    setRecentSearches(prev => {
        const newRecents = [ticker, ...prev.filter(t => t !== ticker)];
        return newRecents.slice(0, 5);
    })
  };

  const filteredStocks = React.useMemo(() => {
    if (debouncedQuery.length === 0) return [];
    return stockData.filter(stock =>
        stock.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        stock.ticker.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 7);
  }, [debouncedQuery]);
  
  const recentStockDetails = useMemo(() => {
      return recentSearches.map(ticker => stockData.find(s => s.ticker === ticker)).filter(Boolean) as (typeof stockData[0])[];
  }, [recentSearches])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search stocks..."
          className="w-full pl-9 pr-4 h-10 border rounded-lg md:w-[200px] lg:w-[336px]"
        />
      </div>
      {isMounted && isOpen && (
        <div className="absolute top-full z-50 mt-2 w-full md:w-[200px] lg:w-[336px] rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            {debouncedQuery.length === 0 && recentStockDetails.length > 0 && (
              <div className="p-1">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Recent Searches</div>
                {recentStockDetails.map((stock) => (
                  <button
                    key={`recent-${stock.ticker}`}
                    onClick={() => handleSelect(stock.ticker)}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  >
                    <History className="mr-2 h-4 w-4" />
                    <span>{stock.name} ({stock.ticker})</span>
                  </button>
                ))}
              </div>
            )}
            {filteredStocks.length > 0 ? (
              <div className="p-1">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Suggestions</div>
                {filteredStocks.map((stock) => {
                  const moverData = marketMovers[stock.ticker];
                  return (
                    <button
                      key={stock.ticker}
                      onClick={() => handleSelect(stock.ticker)}
                      className="relative flex w-full cursor-default select-none items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left"
                    >
                      <div className="flex items-center gap-2">
                          <Image src={stock.logoUrl} alt={`${stock.name} logo`} width={24} height={24} className="rounded-full" />
                          <div>
                              <span className="font-medium">{stock.ticker}</span>
                              <p className="text-xs text-muted-foreground">{stock.name}</p>
                          </div>
                      </div>
                     {moverData && (
                       <div className="text-right">
                          <p className="font-mono text-sm">${moverData.price}</p>
                          <p className={cn("text-xs", moverData.isUp ? 'text-green-500' : 'text-red-500')}>{moverData.isUp ? '+' : ''}{moverData.changePercent}</p>
                      </div>
                     )}
                    </button>
                  )
                })}
              </div>
            ) : (
              debouncedQuery.length > 0 && <div className="py-6 text-center text-sm">No results found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export function DashboardHeader() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="md:hidden" />
      {isClient && <DashboardBreadcrumb />}
      <div className="relative ml-auto flex-1 md:grow-0">
        <StockSearch />
      </div>
      <UserNav />
    </header>
  );
}

function DashboardBreadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    let currentPath = '';
    return pathSegments.map((segment, index) => {
      currentPath += `/${segment}`;
      const navLink = navigationLinks.flat().find(link => link.href === currentPath);

      const isLast = index === pathSegments.length - 1;
      let pageName = navLink?.label || segment.charAt(0).toUpperCase() + segment.slice(1);

      // Special handling for dynamic pages like stocks
      if (currentPath === '/dashboard/stocks' && searchParams.has('q')) {
        pageName = searchParams.get('q')!.toUpperCase();
      }

      return (
        <React.Fragment key={currentPath}>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {isLast ? (
              <BreadcrumbPage>{pageName}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <Link href={navLink?.href || currentPath}>{pageName}</Link>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        </React.Fragment>
      );
    });
  };

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {generateBreadcrumbs()}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
