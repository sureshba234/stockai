"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { navigationLinks } from "@/components/dashboard/sidebar-nav";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Search, LineChart } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { stockData } from "@/lib/stocks";
import { useDebounce } from "@/hooks/use-debounce";


function StockSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((ticker: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/dashboard/stocks?q=${ticker}`);
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const filteredStocks = debouncedQuery.length > 0
    ? stockData.filter(stock =>
        stock.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        stock.ticker.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 7)
    : [];

  return (
    <div className="relative" ref={searchRef}>
      <Command shouldFilter={false} className="overflow-visible bg-transparent">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <CommandInput
            className="w-full pl-9 pr-4 h-10 border rounded-lg md:w-[200px] lg:w-[336px]"
            placeholder="Search stocks..."
            value={query}
            onValueChange={setQuery}
            onFocus={() => setIsOpen(true)}
          />
        </div>
        {isOpen && (
           <div className="absolute top-full z-50 mt-2 w-full md:w-[200px] lg:w-[336px] rounded-md border bg-popover text-popover-foreground shadow-md">
            <CommandList>
              {filteredStocks.length > 0 && (
                <CommandGroup heading="Suggestions">
                  {filteredStocks.map((stock) => (
                    <CommandItem
                      key={stock.ticker}
                      value={`${stock.name} ${stock.ticker}`}
                      onSelect={() => handleSelect(stock.ticker)}
                      className="cursor-pointer"
                    >
                      <LineChart className="mr-2 h-4 w-4" />
                      <span>{stock.name} ({stock.ticker})</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {isOpen && query.length > 0 && filteredStocks.length === 0 && (
                 <CommandEmpty>No results found.</CommandEmpty>
              )}
            </CommandList>
           </div>
        )}
      </Command>
    </div>
  )
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
