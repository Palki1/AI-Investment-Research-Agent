export interface ChartDataPoint {
  period: string;
  label: string;
  revenue?: number;
  netIncome?: number;
  grossProfit?: number;
  freeCashFlow?: number;
  totalDebt?: number;
  stockholdersEquity?: number;
  stockPrice?: number;
  eps?: number;
  profitMargin?: number;
}

export interface ReportChartData {
  revenueGrowth: ChartDataPoint[];
  netIncomeTrend: ChartDataPoint[];
  freeCashFlow: ChartDataPoint[];
  debtVsEquity: ChartDataPoint[];
  revenueVsProfit: ChartDataPoint[];
  stockPrice: ChartDataPoint[];
  epsTrend: ChartDataPoint[];
  profitMargins: ChartDataPoint[];
  hasData: boolean;
  unavailable: string[];
}
