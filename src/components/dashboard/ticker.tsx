"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const tickerData = [
  { name: "S&P 500", value: "5,477.90", change: "+2.62", changePercent: "+0.05%", isUp: true },
  { name: "NASDAQ", value: "17,689.36", change: "-32.23", changePercent: "-0.18%", isUp: false },
  { name: "DOW", value: "39,150.33", change: "+15.57", changePercent: "+0.04%", isUp: true },
  { name: "RUSSELL", value: "2,022.03", change: "-4.79", changePercent: "-0.24%", isUp: false },
  { name: "GOLD", value: "2,333.10", change: "+2.00", changePercent: "+0.09%", isUp: true },
  { name: "OIL", value: "81.58", change: "-0.05", changePercent: "-0.06%", isUp: false },
  { name: "BTC", value: "61,164.21", change: "-455.51", changePercent: "-0.74%", isUp: false },
  { name: "ETH", value: "3,375.40", change: "+1.93", changePercent: "+0.06%", isUp: true },
];

export function Ticker() {
  return (
    <footer className="sticky bottom-0 z-30 mt-auto border-t bg-background/95 backdrop-blur-sm">
      <div className="relative flex w-full overflow-hidden">
        <div className="flex animate-marquee motion-reduce:pause">
          {[...tickerData, ...tickerData].map((item, index) => (
            <div key={index} className="flex flex-shrink-0 items-center gap-4 border-r px-6 py-2">
              <span className="font-semibold text-foreground/80">{item.name}</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm font-medium">{item.value}</span>
                <span
                  className={cn(
                    "text-xs font-semibold flex items-center",
                    item.isUp ? "text-green-500" : "text-red-500"
                  )}
                >
                  {item.isUp ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                  {item.change} ({item.changePercent})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
