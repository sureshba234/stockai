"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { BotMessageSquare, BarChart, BellRing, Link as LinkIcon, Wallet, Users, LayoutDashboard, Settings, Sheet, FileText, LineChart, Home, Newspaper, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const mainNavLinks: NavLink[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/markets", label: "Markets", icon: LayoutDashboard },
  { href: "/dashboard/stocks", label: "Stocks", icon: LineChart },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Star },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/dashboard/news", label: "News", icon: Newspaper },
];

const secondaryNavLinks: NavLink[] = [
  { href: "/dashboard/docs", label: "Docs", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/community", label: "Community", icon: Users },
]


const genAILinks: NavLink[] = [
  { href: "/dashboard/ml-notes", label: "ML Notes", icon: BotMessageSquare },
  { href: "/dashboard/predictions", label: "Predictions", icon: BarChart },
  { href: "/dashboard/alerts", label: "Alerts", icon: BellRing },
  { href: "/dashboard/relations", label: "Asset Relations", icon: LinkIcon },
  { href: "/dashboard/analytics", label: "Analytics", icon: Sheet },
];

export const navigationLinks = [mainNavLinks, genAILinks, secondaryNavLinks];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2">
      <SidebarGroup>
        <SidebarMenu>
          {mainNavLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href}>
                <SidebarMenuButton isActive={pathname.startsWith(link.href) && (link.href !== '/dashboard' || pathname === '/dashboard')}>
                  <link.icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>GenAI Tools</SidebarGroupLabel>
        <SidebarMenu>
          {genAILinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href}>
                <SidebarMenuButton isActive={pathname.startsWith(link.href)}>
                  <link.icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
      <SidebarGroupLabel>Support</SidebarGroupLabel>
        <SidebarMenu>
          {secondaryNavLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href}>
                <SidebarMenuButton isActive={pathname.startsWith(link.href)}>
                  <link.icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </div>
  );
}
