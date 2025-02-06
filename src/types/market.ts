export interface MarketData {
  revenue: number;
  customers: number;
  satisfaction: number;
  marketShare: number;
  growthRate: number;
}

export interface MarketTrend {
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  description: string;
}

export interface MarketMetric {
  value: number;
  trend: MarketTrend;
  benchmark: number;
}