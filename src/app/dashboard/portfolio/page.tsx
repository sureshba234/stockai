import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function PortfolioPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Management</CardTitle>
        <CardDescription>Create and manage personalized watchlists and paper trading portfolios.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
          <Wallet className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Coming Soon</h3>
          <p className="text-muted-foreground">This feature is currently under construction. Check back later!</p>
        </div>
      </CardContent>
    </Card>
  );
}
