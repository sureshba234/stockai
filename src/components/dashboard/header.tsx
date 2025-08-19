"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { navigationLinks } from "@/components/dashboard/sidebar-nav";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import React from 'react';
import { stockData } from "@/lib/stocks";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

function fuzzySearch(query: string, text: string): boolean {
    let textIndex = 0;
    let queryIndex = 0;
    const qLower = query.toLowerCase();
    const tLower = text.toLowerCase();

    while (queryIndex < qLower.length && textIndex < tLower.length) {
        if (qLower[queryIndex] === tLower[textIndex]) {
            queryIndex++;
        }
        textIndex++;
    }

    return queryIndex === qLower.length;
}


function StockSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ name: string; ticker: string; sector: string }[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const filteredStocks = stockData
        .filter(
          (stock) =>
            fuzzySearch(searchQuery, stock.name) ||
            fuzzySearch(searchQuery, stock.ticker)
        )
        .slice(0, 10); // Limit to 10 suggestions
      setSuggestions(filteredStocks);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  const handleSelectStock = (ticker: string) => {
    setSearchQuery("");
    setSuggestions([]);
    setIsFocused(false);
    router.push(`/dashboard/stocks?q=${ticker}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
        handleSelectStock(searchQuery.trim().toUpperCase())
    }
  };


  return (
    <div className="relative" ref={searchRef}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search stocks..."
        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
      />
      {isFocused && suggestions.length > 0 && (
        <Card className="absolute top-full mt-2 w-full rounded-lg border bg-background shadow-lg z-50">
          <ul>
            {suggestions.map((stock) => (
              <li
                key={stock.ticker}
                className="cursor-pointer p-2 hover:bg-accent"
                onClick={() => handleSelectStock(stock.ticker)}
              >
                <div className="flex justify-between items-center">
                    <span className="font-bold">{stock.ticker}</span>
                    <Badge variant="outline">{stock.sector}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">{stock.name}</div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
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
