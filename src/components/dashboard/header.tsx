"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/dashboard/user-nav";
import { usePathname, useSearchParams } from "next/navigation";
import { navigationLinks } from "@/components/dashboard/sidebar-nav";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import React from 'react';
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleSearchClick = () => {
    // This is a bit of a hack to trigger the command palette, which listens for Cmd/Ctrl+K.
    // In a real app, we'd use a more robust state management solution (like Zustand or Context)
    // to open the command palette from here.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="md:hidden" />
      {isClient && <DashboardBreadcrumb />}
      <div className="relative ml-auto flex-1 md:grow-0">
        <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground md:w-[200px] lg:w-[336px]"
            onClick={handleSearchClick}
        >
            <Search className="mr-2" />
            <span>Search stocks...</span>
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
        </Button>
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
