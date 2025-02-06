import React from 'react';
import { TrendingUp, Globe, BarChart2, AlertCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { DataField } from '@/types/data';
import { formatNumber } from '@/utils/analysis/formatting';
import { calculateFieldStats } from '@/utils/analysis/statistics/calculations';
import { determineTrend } from '@/utils/analysis/statistics/trends';

interface MarketComparisonProps {
  data: {
    fields: DataField[];
  };
}

interface MarketMetric {
  name: string;
  value: number;
  marketAvg: number;
  percentile: number;
  trend: 'above' | 'below' | 'aligned';
  change: number;
}

interface CompetitorInsight {
  metric: string;
  gap: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export function MarketComparison({ data }: MarketComparisonProps) {
  const [metrics, setMetrics] = React.useState<MarketMetric[]>([]);
  const [insights, setInsights] = React.useState<CompetitorInsight[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [historicalData, setHistoricalData] = React.useState<{
    dates: string[];
    marketData: Record<string, number[]>;
  }>({ dates: [], marketData: {} });

  React.useEffect(() => {
    async function fetchMarketData() {
      try {
        setIsLoading(true);
        
        // Generate realistic market data based on field statistics
        const marketMetrics = data.fields
          .filter(f => f.type === 'number')
          .map(field => {
            const values = field.value as number[];
            const stats = calculateFieldStats(field);
            const currentValue = values[values.length - 1];
            const marketAvg = stats.mean * (0.9 + (Math.random() * 0.2));
            const percentile = calculatePercentile(currentValue, marketAvg, stats.stdDev);
            const change = ((currentValue - values[0]) / values[0]) * 100;
            const trend = determineTrend(values);

            return {
              name: field.name,
              value: currentValue,
              marketAvg,
              percentile,
              trend: trend === 'up' ? 'above' : trend === 'down' ? 'below' : 'aligned',
              change
            };
          });

        setMetrics(marketMetrics);

        // Generate historical market data
        const dates = generateDateRange(12); // Last 12 months
        const marketData: Record<string, number[]> = {};
        
        marketMetrics.forEach(metric => {
          marketData[metric.name] = generateMarketHistory(
            metric.value,
            metric.marketAvg,
            dates.length
          );
        });

        setHistoricalData({ dates, marketData });

        // Generate insights based on market comparison
        const competitorInsights = marketMetrics
          .filter(m => Math.abs(m.value - m.marketAvg) / m.marketAvg > 0.1)
          .map(metric => ({
            metric: metric.name,
            gap: ((metric.value - metric.marketAvg) / metric.marketAvg) * 100,
            recommendation: generateRecommendation(metric),
            priority: Math.abs(metric.value - metric.marketAvg) / metric.marketAvg > 0.2
              ? 'high'
              : Math.abs(metric.value - metric.marketAvg) / metric.marketAvg > 0.1
              ? 'medium'
              : 'low'
          }));

        setInsights(competitorInsights);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMarketData();
  }, [data.fields]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Market Position Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold">Market Position</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">{metric.name}</h4>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  metric.trend === 'above'
                    ? 'bg-green-100 text-green-700'
                    : metric.trend === 'below'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {metric.percentile.toFixed(1)}th percentile
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">Your Value</span>
                    <span className="font-medium">{metric.value.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">Market Average</span>
                    <span className="font-medium">{metric.marketAvg.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Change</span>
                    <span className={`font-medium ${
                      metric.change > 0 ? 'text-green-600' : 
                      metric.change < 0 ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold">Competitive Insights</h3>
        </div>

        <div className="grid gap-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                insight.priority === 'high'
                  ? 'border-red-200 bg-red-50'
                  : insight.priority === 'medium'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{insight.metric}</h4>
                <span className={`text-sm font-medium ${
                  insight.gap > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {insight.gap > 0 ? '+' : ''}{insight.gap.toFixed(1)}% vs Market
                </span>
              </div>
              <p className="text-sm text-gray-600">{insight.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold">Market Trends</h3>
        </div>

        <div className="h-[400px]">
          <Line
            data={{
              labels: historicalData.dates,
              datasets: metrics.map((metric, index) => ({
                label: metric.name,
                data: historicalData.marketData[metric.name],
                borderColor: `hsl(${index * 360 / metrics.length}, 70%, 50%)`,
                backgroundColor: `hsla(${index * 360 / metrics.length}, 70%, 50%, 0.1)`,
                fill: true,
                tension: 0.4
              }))
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: 'Performance vs Market Average'
                },
                tooltip: {
                  mode: 'index',
                  intersect: false
                }
              },
              scales: {
                y: {
                  beginAtZero: false
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Helper functions
function calculatePercentile(value: number, mean: number, stdDev: number): number {
  const zScore = (value - mean) / stdDev;
  return Math.min(100, Math.max(0, (1 - normalCDF(zScore)) * 100));
}

function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

function generateDateRange(months: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    dates.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
  }
  
  return dates;
}

function generateMarketHistory(currentValue: number, marketAvg: number, points: number): number[] {
  const volatility = 0.15; // 15% volatility
  const trend = (currentValue - marketAvg) / points;
  const history: number[] = [];
  
  for (let i = 0; i < points; i++) {
    const trendValue = marketAvg + (trend * i);
    const randomFactor = 1 + (Math.random() - 0.5) * volatility;
    history.push(trendValue * randomFactor);
  }
  
  return history;
}

function generateRecommendation(metric: MarketMetric): string {
  if (metric.value < metric.marketAvg) {
    const gap = ((metric.marketAvg - metric.value) / metric.marketAvg * 100).toFixed(1);
    return `Increase ${metric.name.toLowerCase()} by ${gap}% to reach market average. ` +
           `Consider implementing targeted improvements based on competitor benchmarks.`;
  } else {
    const lead = ((metric.value - metric.marketAvg) / metric.marketAvg * 100).toFixed(1);
    return `Maintain strong ${metric.name.toLowerCase()} performance (${lead}% above market). ` +
           `Focus on sustaining competitive advantage through continuous optimization.`;
  }
}