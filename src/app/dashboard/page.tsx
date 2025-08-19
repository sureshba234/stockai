import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowRight, BotMessageSquare, BarChart, BellRing, Link as LinkIcon } from 'lucide-react';

const features = [
  {
    title: "ML Note Generation",
    description: "Generate ML-specific notes for feature handling, explainability, and confidence for your models.",
    href: "/dashboard/ml-notes",
    icon: BotMessageSquare,
  },
  {
    title: "Prediction Visualization",
    description: "Enhance financial predictions with interactive visualizations and detailed ML notes.",
    href: "/dashboard/predictions",
    icon: BarChart,
  },
  {
    title: "Real-time Alerts",
    description: "Configure real-time alerts based on ML signals for timely and informed decision-making.",
    href: "/dashboard/alerts",
    icon: BellRing,
  },
  {
    title: "Cross-Asset Relations",
    description: "Discover hidden relationships between financial assets using graph neural networks.",
    href: "/dashboard/relations",
    icon: LinkIcon,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Insight Canvas</h1>
        <p className="text-muted-foreground">Your intelligent financial analysis and MLOps platform.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="mt-1">{feature.description}</CardDescription>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                     <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <Link href={feature.href} className="w-full">
                  <Button variant="outline" className="w-full">
                    <span>Go to {feature.title.split(' ')[0]}</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
