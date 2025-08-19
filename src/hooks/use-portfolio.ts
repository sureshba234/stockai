
"use client"

import { useState, useEffect, useCallback } from 'react';
import { getStockData } from '@/ai/flows/get-stock-data';

export interface Transaction {
  id: string;
  ticker: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  date: Date;
}

export interface Holding {
  ticker: string;
  shares: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  totalCost: number;
  profitOrLoss: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvestment: number;
  totalPL: number;
  totalPLPercent: number;
}


export function usePortfolio() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [holdings, setHoldings] = useState<Record<string, Holding>>({});
  const [summary, setSummary] = useState<PortfolioSummary>({ totalValue: 0, totalInvestment: 0, totalPL: 0, totalPLPercent: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = useCallback(() => {
    try {
      const savedTransactions = localStorage.getItem('portfolioTransactions');
      if (savedTransactions) {
        const parsed = JSON.parse(savedTransactions) as Transaction[];
        // Dates are stored as strings, so we need to convert them back
        return parsed.map(tx => ({ ...tx, date: new Date(tx.date) }));
      }
    } catch (error) {
      console.error("Failed to load or parse transactions from localStorage", error);
    }
    return [];
  }, []);

  const saveTransactions = (newTransactions: Transaction[]) => {
    localStorage.setItem('portfolioTransactions', JSON.stringify(newTransactions));
    setTransactions(newTransactions);
  };
  
  const addTransaction = (transaction: Transaction) => {
    const newTransactions = [...transactions, transaction];
    saveTransactions(newTransactions);
    // No need to call processTransactions here, useEffect will handle it
  };

  const removeTransaction = (transactionId: string) => {
    const newTransactions = transactions.filter(tx => tx.id !== transactionId);
    saveTransactions(newTransactions);
    // No need to call processTransactions here, useEffect will handle it
  };
  
  const processTransactions = useCallback(async (txs: Transaction[]) => {
      setIsLoading(true);
      
      const holdingsCalc: Record<string, { shares: number, totalCost: number, ticker: string }> = {};

      // Sort transactions by date to process them in order
      const sortedTxs = [...txs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      for (const tx of sortedTxs) {
          if (!holdingsCalc[tx.ticker]) {
              holdingsCalc[tx.ticker] = { shares: 0, totalCost: 0, ticker: tx.ticker };
          }
          const currentHolding = holdingsCalc[tx.ticker];
          
          if (tx.type === 'buy') {
              currentHolding.shares += tx.shares;
              currentHolding.totalCost += tx.shares * tx.price;
          } else {
              const avgCost = currentHolding.shares > 0 ? currentHolding.totalCost / currentHolding.shares : 0;
              currentHolding.shares -= tx.shares;
              currentHolding.totalCost -= tx.shares * avgCost; // Reduce cost basis proportionally
              if (currentHolding.shares < 1e-9) { // Handle floating point inaccuracies
                  currentHolding.shares = 0;
                  currentHolding.totalCost = 0;
              }
          }
      }
      
      const uniqueTickers = Object.keys(holdingsCalc).filter(ticker => holdingsCalc[ticker].shares > 0);
      
      if(uniqueTickers.length === 0) {
          setHoldings({});
          setSummary({ totalValue: 0, totalInvestment: 0, totalPL: 0, totalPLPercent: 0 });
          setIsLoading(false);
          return;
      }
      
      const stockDataPromises = uniqueTickers.map(ticker => getStockData({ ticker }));
      const stockDataResults = await Promise.all(stockDataPromises);
      
      const newHoldings: Record<string, Holding> = {};
      let totalValue = 0;
      let totalInvestment = 0;
      
      for (let i = 0; i < uniqueTickers.length; i++) {
          const ticker = uniqueTickers[i];
          const stockData = stockDataResults[i];
          const holdingInfo = holdingsCalc[ticker];
          
          const currentPrice = stockData ? parseFloat(stockData.price) : 0;
          const marketValue = holdingInfo.shares * currentPrice;
          const averageCost = holdingInfo.shares > 0 ? holdingInfo.totalCost / holdingInfo.shares : 0;
          const profitOrLoss = marketValue - holdingInfo.totalCost;
          
          newHoldings[ticker] = {
              ticker,
              shares: holdingInfo.shares,
              averageCost,
              currentPrice,
              marketValue,
              totalCost: holdingInfo.totalCost,
              profitOrLoss,
          };
          
          totalValue += marketValue;
          totalInvestment += holdingInfo.totalCost;
      }
      
      const totalPL = totalValue - totalInvestment;
      const totalPLPercent = totalInvestment > 0 ? (totalPL / totalInvestment) * 100 : 0;
      
      setHoldings(newHoldings);
      setSummary({ totalValue, totalInvestment, totalPL, totalPLPercent });
      setIsLoading(false);

  }, []);

  useEffect(() => {
    const txs = loadTransactions();
    setTransactions(txs);
  }, [loadTransactions]);
  
  useEffect(() => {
      processTransactions(transactions);
  }, [transactions, processTransactions])
  
  const refreshPortfolio = useCallback(() => {
    processTransactions(transactions);
  }, [transactions, processTransactions]);

  return { transactions, holdings, summary, isLoading, addTransaction, removeTransaction, refreshPortfolio };
}
