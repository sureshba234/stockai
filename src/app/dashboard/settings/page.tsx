import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your account and application settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
          <Settings className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Coming Soon</h3>
          <p className="text-muted-foreground">This feature is currently under construction. Check back later!</p>
        </div>
      </CardContent>
    </Card>
  );
}
