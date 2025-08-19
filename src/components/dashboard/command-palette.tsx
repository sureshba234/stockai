
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { navigationLinks } from "@/components/dashboard/sidebar-nav"
import { stockData } from "@/lib/stocks"
import { File, Moon, Sun, Laptop, LineChart } from "lucide-react"

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const { setTheme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey))) {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }

        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Stocks">
          {stockData.slice(0, 5).map((stock) => (
            <CommandItem
              key={stock.ticker}
              value={`${stock.ticker} ${stock.name}`}
              onSelect={() => {
                runCommand(() => router.push(`/dashboard/stocks?q=${stock.ticker}`))
              }}
            >
              <LineChart className="mr-2 h-4 w-4" />
              <span>{stock.name} ({stock.ticker})</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Links">
          {navigationLinks.flat().map((link) => (
            <CommandItem
              key={link.href}
              value={link.label}
              onSelect={() => {
                runCommand(() => router.push(link.href))
              }}
            >
              <link.icon className="mr-2 h-4 w-4" />
              <span>{link.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun className="mr-2 h-4 w-4" />
            Light
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
            <Laptop className="mr-2 h-4 w-4" />
            System
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
