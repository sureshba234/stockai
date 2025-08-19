"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { BotMessageSquare, BarChart, BellRing, Link as LinkIcon, Wallet, Users, LayoutDashboard, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const mainNavLinks: NavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/dashboard/community", label: "Community", icon: Users },
];

const genAILinks: NavLink[] = [
  { href: "/dashboard/ml-notes", label: "ML Notes", icon: BotMessageSquare },
  { href: "/dashboard/predictions", label: "Predictions", icon: BarChart },
  { href: "/dashboard/alerts", label: "Real-time Alerts", icon: BellRing },
  { href: "/dashboard/relations", label: "Asset Relations", icon: LinkIcon },
];

export const navigationLinks = [mainNavLinks, genAILinks];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2">
      <SidebarGroup>
        <SidebarMenu>
          {mainNavLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href}>
                <SidebarMenuButton isActive={pathname === link.href}>
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
                <SidebarMenuButton isActive={pathname === link.href}>
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
