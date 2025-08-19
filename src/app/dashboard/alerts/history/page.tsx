
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, BellRing } from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';

const mockAlertHistory = [
  {
    id: "alert-1",
    name: "AAPL Breakout Alert",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)),
    triggeredValue: "Price crossed above $220.50",
    status: "Fired"
  },
  {
    id: "alert-2",
    name: "NVDA Volume Spike",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 2)),
    triggeredValue: "Volume was greater than 50M",
    status: "Fired"
  },
    {
    id: "alert-3",
    name: "MSFT MA Cross",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 5)),
    triggeredValue: "50-Day MA crossed above 200-Day MA",
    status: "Fired"
  }
];

export default function AlertHistoryPage() {
  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Alert History</h1>
            <p className="text-muted-foreground">A log of all the alerts that have been triggered.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Triggered Alerts</CardTitle>
                <CardDescription>Showing the most recent alerts that have fired.</CardDescription>
            </CardHeader>
            <CardContent>
                {mockAlertHistory.length > 0 ? (
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Alert Name</TableHead>
                        <TableHead>Triggered</TableHead>
                        <TableHead>Condition Met</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {mockAlertHistory.map((alert) => (
                        <TableRow key={alert.id}>
                        <TableCell className="font-medium">{alert.name}</TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span>{format(alert.timestamp, "PPP p")}</span>
                                <span className="text-xs text-muted-foreground">{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                            </div>
                        </TableCell>
                        <TableCell>{alert.triggeredValue}</TableCell>
                        <TableCell className="text-right">
                           <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-950">
                                <BellRing className="mr-1 h-3 w-3" />
                                {alert.status}
                           </Badge>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                    <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold">No Alert History</h3>
                    <p className="text-muted-foreground">Alerts that you create and get triggered will appear here.</p>
                </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
