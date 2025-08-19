import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Hub</CardTitle>
        <CardDescription>Advanced analytics, research tools, and market intelligence.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
          <Sheet className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Coming Soon</h3>
          <p className="text-muted-foreground">This feature is currently under construction. Check back later!</p>
        </div>
      </CardContent>
    </Card>
  );
}
