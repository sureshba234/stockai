"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { navigationLinks } from "@/components/dashboard/sidebar-nav";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import React from 'react';

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const generateBreadcrumbs = () => {
      const pathSegments = pathname.split('/').filter(Boolean);
      let currentPath = '';
      const breadcrumbItems = pathSegments.map((segment, index) => {
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
      
      setBreadcrumbs(breadcrumbItems);
    }
    generateBreadcrumbs();
  }, [pathname, searchParams]);


  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      router.push(`/dashboard/stocks?q=${searchQuery.trim()}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <SidebarTrigger className="md:hidden" />
       <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbs}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search stocks..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>
      <UserNav />
    </header>
  );
}
