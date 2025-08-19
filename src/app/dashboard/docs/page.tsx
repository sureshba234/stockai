"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Book, Code, GraduationCap, Search } from "lucide-react";
import Link from "next/link";

const docSections = [
    {
        title: "Getting Started",
        description: "Your first steps to using Insight Canvas, from setup to your first analysis.",
        icon: GraduationCap,
        href: "#"
    },
    {
        title: "API Reference",
        description: "Detailed documentation for all API endpoints and data models.",
        icon: Code,
        href: "#"
    },
    {
        title: "Tutorials & Guides",
        description: "Step-by-step guides for features like stock screening, alerts, and portfolio management.",
        icon: Book,
        href: "#"
    }
]

export default function DocsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground">Guides, tutorials, and API references to help you get the most out of Insight Canvas.</p>
      </div>

       <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search documentation..." className="w-full pl-9" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {docSections.map(section => {
            const Icon = section.icon;
            return (
                 <Link key={section.title} href={section.href}>
                    <Card className="h-full hover:border-primary transition-colors">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                                <Icon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>{section.title}</CardTitle>
                                <CardDescription className="mt-1">{section.description}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                 </Link>
            )
        })}
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">Content Coming Soon</h3>
              <p className="text-muted-foreground">The FAQ section is currently being built. Check back later!</p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
