"use client"

import type { ReactNode } from "react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { DashboardHeader } from "@/components/dashboard/header";
import { Logo } from "@/components/icons";
import Link from "next/link";
import { Ticker } from "@/components/dashboard/ticker";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { CommandPalette } from "@/components/dashboard/command-palette";


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">Insight Canvas</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <DashboardHeader />
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex-grow p-4 sm:p-6 lg:p-8"
            >
              {children}
            </motion.main>
          </AnimatePresence>
          <Ticker />
          <CommandPalette />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
