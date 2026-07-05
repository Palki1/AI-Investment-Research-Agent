"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, Percent, DollarSign, Wallet } from "lucide-react";

import type { ReportChartData } from "@/lib/types/chart-data";
import { formatCompactNumber } from "@/lib/utils/chart-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FinancialChartsProps {
  chartData: ReportChartData;
  currency?: string | null;
}

export function FinancialCharts({ chartData, currency = "USD" }: FinancialChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border bg-card text-muted-foreground text-sm">
        Loading interactive charts...
      </div>
    );
  }

  if (!chartData || !chartData.hasData) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed bg-muted/10 text-muted-foreground text-sm">
        No verified financial metrics available to render charts.
      </div>
    );
  }

  // Calculate CAGR dynamically
  const revData = chartData.revenueGrowth || [];
  let cagrText = "N/A";
  if (revData.length >= 2) {
    const firstVal = revData[0].revenue;
    const lastVal = revData[revData.length - 1].revenue;
    const years = revData.length - 1;
    if (firstVal && lastVal && firstVal > 0 && lastVal > 0 && years > 0) {
      const cagr = (Math.pow(lastVal / firstVal, 1 / years) - 1) * 100;
      cagrText = `${cagr.toFixed(2)}%`;
    }
  }

  const formatYAxis = (value: number) => formatCompactNumber(value, currency ?? "USD");

  const TooltipFormatter = (value: unknown) => {
    if (typeof value === "number") {
      return [formatCompactNumber(value, currency ?? "USD"), ""];
    }
    return [String(value), ""];
  };

  const TooltipPercentFormatter = (value: unknown) => {
    if (typeof value === "number") {
      return [`${value.toFixed(2)}%`, ""];
    }
    return [String(value), ""];
  };

  const TooltipEpsFormatter = (value: unknown) => {
    if (typeof value === "number") {
      return [`${value.toFixed(2)}`, ""];
    }
    return [String(value), ""];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Interactive Financial Analytics</CardTitle>
        <CardDescription>
          Explore interactive trends derived directly from verified statements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="income" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 gap-1">
            <TabsTrigger value="income" className="py-2 text-xs md:text-sm">Income & EPS</TabsTrigger>
            <TabsTrigger value="margins" className="py-2 text-xs md:text-sm">Profitability & CAGR</TabsTrigger>
            <TabsTrigger value="balance" className="py-2 text-xs md:text-sm">Debt & Cash Flow</TabsTrigger>
            <TabsTrigger value="stock" className="py-2 text-xs md:text-sm">Stock Price</TabsTrigger>
          </TabsList>

          {/* TAB 1: Income Statement & EPS */}
          <TabsContent value="income" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Revenue Trend */}
              <div className="space-y-2 rounded-xl border p-4 bg-muted/5">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <DollarSign className="size-4 text-emerald-500" /> Revenue Trend
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.revenueGrowth}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                      <Tooltip formatter={TooltipFormatter} contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Net Income Trend */}
              <div className="space-y-2 rounded-xl border p-4 bg-muted/5">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <TrendingUp className="size-4 text-primary" /> Net Income Trend
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.netIncomeTrend}>
                      <defs>
                        <linearGradient id="colorNetIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                      <Tooltip formatter={TooltipFormatter} contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="netIncome" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorNetIncome)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue vs Net Income */}
              <div className="space-y-2 rounded-xl border p-4 bg-muted/5">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  Revenue vs Profit Comparison
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.revenueVsProfit}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                      <Tooltip formatter={TooltipFormatter} contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Legend verticalAlign="top" height={36} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary)/0.6)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="netIncome" name="Net Income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* EPS Trend */}
              <div className="space-y-2 rounded-xl border p-4 bg-muted/5">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  EPS Trend (Diluted)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.epsTrend}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip formatter={TooltipEpsFormatter} contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Bar dataKey="eps" name="EPS" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Margins & CAGR */}
          <TabsContent value="margins" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* CAGR Card */}
              <Card className="md:col-span-1 bg-gradient-to-br from-primary/10 via-background to-background flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="size-4 text-primary" /> Compound Growth Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 py-4">
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{cagrText}</div>
                  <p className="text-xs text-muted-foreground">
                    Calculated Revenue Compound Annual Growth Rate (CAGR) across the reported {revData.length} annual statements.
                  </p>
                </CardContent>
              </Card>

              {/* Profit Margin Trends */}
              <div className="md:col-span-2 space-y-2 rounded-xl border p-4 bg-muted/5">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Percent className="size-4 text-amber-500" /> Profit Margin Trends (%)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.profitMargins}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                      <Tooltip formatter={TooltipPercentFormatter} contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="profitMargin" name="Net Margin" stroke="hsl(var(--primary))" strokeWidth={3} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Debt & Cash Flow */}
          <TabsContent value="balance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Debt vs Equity */}
              <div className="space-y-2 rounded-xl border p-4 bg-muted/5">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Wallet className="size-4 text-rose-500" /> Debt vs Stockholders Equity
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.debtVsEquity}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                      <Tooltip formatter={TooltipFormatter} contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Legend verticalAlign="top" height={36} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="totalDebt" name="Total Debt" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="stockholdersEquity" name="Stockholders Equity" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Free Cash Flow Trend */}
              <div className="space-y-2 rounded-xl border p-4 bg-muted/5">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  Free Cash Flow (FCF) Trend
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.freeCashFlow}>
                      <defs>
                        <linearGradient id="colorFcf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                      <Tooltip formatter={TooltipFormatter} contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="freeCashFlow" name="FCF" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorFcf)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: Stock Price */}
          <TabsContent value="stock" className="space-y-6">
            <div className="space-y-2 rounded-xl border p-4 bg-muted/5">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                Historical Stock Price Trend
              </h3>
              {chartData.stockPrice.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm italic text-muted-foreground">
                  Stock price history unavailable for this symbol.
                </div>
              ) : (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.stockPrice}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                      <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="stockPrice" name="Stock Price" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
