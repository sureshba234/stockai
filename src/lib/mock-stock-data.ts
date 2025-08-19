import type { StockDataOutput } from "@/ai/schemas/stock-data";
import { stockData as stockList } from "@/lib/stocks";

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePriceHistory(basePrice: number, days: number): { date: string, price: number, volume: number }[] {
  const history = [];
  let currentPrice = basePrice;
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - i));
    const changePercent = (Math.random() - 0.49) * 0.05; // -2.5% to +2.5% change
    currentPrice *= (1 + changePercent);
    history.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 5_000_000) + 1_000_000, // Random volume
    });
  }
  return history;
}

export function generateMockStockData(ticker: string): StockDataOutput {
  const stockInfo = stockList.find(s => s.ticker === ticker) || { name: `${ticker.toUpperCase()} Inc.`, sector: "Technology" };
  const basePrice = Math.random() * 500 + 50; // Random price between 50 and 550
  const chartData = generatePriceHistory(basePrice, 90);

  const currentPrice = chartData[chartData.length - 1].price;
  const previousPrice = chartData.length > 1 ? chartData[chartData.length - 2].price : currentPrice;
  
  const change = (currentPrice - previousPrice);
  const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;
  const isUp = change >= 0;

  return {
    name: stockInfo.name,
    ticker: ticker.toUpperCase(),
    price: currentPrice.toFixed(2),
    change: change.toFixed(2),
    changePercent: `${changePercent.toFixed(2)}%`,
    isUp,
    chartData,
    fundamentalsData: [
      { label: "Market Cap", value: `${(Math.random() * 2000 + 100).toFixed(2)}B` },
      { label: "P/E Ratio", value: (Math.random() * 30 + 10).toFixed(2) },
      { label: "EPS", value: (Math.random() * 10 + 1).toFixed(2) },
      { label: "Revenue (TTM)", value: `${(Math.random() * 100 + 10).toFixed(2)}B` },
    ],
    news: [
      { title: `Exciting developments for ${stockInfo.name} as new product is announced.`, source: "Tech News Today", url: "https://example.com", publishedAt: "2024-07-29" },
      { title: `${stockInfo.sector} sector sees major shift, with ${ticker.toUpperCase()} at the forefront.`, source: "Market Watch", url: "https://example.com", publishedAt: "2024-07-28" },
      { title: `Analysts rate ${ticker.toUpperCase()} a 'Strong Buy' after recent performance.`, source: "Financial Times", url: "https://example.com", publishedAt: "2024-07-27" },
    ],
    predictions: `AI analysis suggests a positive short-term outlook for ${stockInfo.name}, citing strong market position and recent technological advancements. However, sector-wide volatility could introduce some risk. This prediction is for informational purposes only.`
  };
}

export function generateMockMarketMovers(count: number, type: 'gainers' | 'losers') {
    const movers = [];
    const usedTickers = new Set<string>();

    while(movers.length < count) {
        const stock = getRandomElement(stockList);
        if(!usedTickers.has(stock.ticker)) {
            const price = (Math.random() * 800 + 20).toFixed(2);
            const changeAmount = (Math.random() * 10 + 1);
            const change = (type === 'gainers' ? changeAmount : -changeAmount);
            const changePercent = (change / parseFloat(price) * 100).toFixed(2);

            movers.push({
                ticker: stock.ticker,
                name: stock.name,
                price: price,
                change: `${change.toFixed(2)}`,
                changePercent: `${changePercent}%`,
                isUp: type === 'gainers',
            });
            usedTickers.add(stock.ticker);
        }
    }
    return movers;
}
