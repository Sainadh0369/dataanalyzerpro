import { DataField } from '@/types/data';
import { calculateFieldStats } from '../statistics/calculations';
import { determineTrend } from '../statistics/trends';

interface InventoryMetrics {
  turnoverRate: number;
  stockoutRisk: {
    product: string;
    risk: 'high' | 'medium' | 'low';
    daysUntilStockout: number;
  }[];
  optimalRestockLevels: {
    product: string;
    minimum: number;
    optimal: number;
    maximum: number;
  }[];
}

interface SalesTrends {
  product: string;
  trend: 'up' | 'down' | 'stable';
  growthRate: number;
  seasonality: number | null;
  forecast: number[];
}

export class RetailAnalyzer {
  static analyzeInventory(fields: DataField[]): InventoryMetrics {
    const inventory = fields.find(f => f.name.toLowerCase().includes('inventory'))?.value as number[];
    const sales = fields.find(f => f.name.toLowerCase().includes('sales'))?.value as number[];
    const products = fields.find(f => f.name.toLowerCase().includes('product'))?.value as string[];

    const turnoverRate = this.calculateTurnoverRate(inventory, sales);
    const stockoutRisk = this.assessStockoutRisk(products, inventory, sales);
    const optimalRestockLevels = this.calculateOptimalRestockLevels(products, inventory, sales);

    return {
      turnoverRate,
      stockoutRisk,
      optimalRestockLevels
    };
  }

  static analyzeSalesTrends(fields: DataField[]): SalesTrends[] {
    const products = fields.find(f => f.name.toLowerCase().includes('product'))?.value as string[];
    const sales = fields.find(f => f.name.toLowerCase().includes('sales'))?.value as number[];
    const dates = fields.find(f => f.name.toLowerCase().includes('date'))?.value;

    const trends: SalesTrends[] = [];
    const uniqueProducts = [...new Set(products)];

    uniqueProducts.forEach(product => {
      const productSales = sales.filter((_, i) => products[i] === product);
      const trend = determineTrend(productSales);
      const growthRate = this.calculateGrowthRate(productSales);
      const seasonality = this.detectSeasonality(productSales);
      const forecast = this.generateSalesForecast(productSales, seasonality);

      trends.push({
        product,
        trend,
        growthRate,
        seasonality,
        forecast
      });
    });

    return trends;
  }

  private static calculateTurnoverRate(inventory: number[], sales: number[]): number {
    if (!inventory?.length || !sales?.length) return 0;
    const avgInventory = inventory.reduce((a, b) => a + b, 0) / inventory.length;
    const totalSales = sales.reduce((a, b) => a + b, 0);
    return totalSales / avgInventory;
  }

  private static assessStockoutRisk(
    products: string[],
    inventory: number[],
    sales: number[]
  ): InventoryMetrics['stockoutRisk'] {
    if (!products?.length || !inventory?.length || !sales?.length) return [];

    const uniqueProducts = [...new Set(products)];
    return uniqueProducts.map(product => {
      const productInventory = inventory[products.indexOf(product)];
      const productSales = sales.filter((_, i) => products[i] === product);
      const dailySales = productSales.reduce((a, b) => a + b, 0) / productSales.length;
      const daysUntilStockout = productInventory / dailySales;

      return {
        product,
        risk: daysUntilStockout < 7 ? 'high' :
              daysUntilStockout < 14 ? 'medium' : 'low',
        daysUntilStockout: Math.round(daysUntilStockout)
      };
    });
  }

  private static calculateOptimalRestockLevels(
    products: string[],
    inventory: number[],
    sales: number[]
  ): InventoryMetrics['optimalRestockLevels'] {
    if (!products?.length || !inventory?.length || !sales?.length) return [];

    const uniqueProducts = [...new Set(products)];
    return uniqueProducts.map(product => {
      const productSales = sales.filter((_, i) => products[i] === product);
      const avgDailySales = productSales.reduce((a, b) => a + b, 0) / productSales.length;
      const stdDev = Math.sqrt(
        productSales.reduce((acc, sale) => 
          acc + Math.pow(sale - avgDailySales, 2), 0
        ) / productSales.length
      );

      return {
        product,
        minimum: Math.ceil(avgDailySales * 7), // 1 week minimum
        optimal: Math.ceil(avgDailySales * 14), // 2 weeks optimal
        maximum: Math.ceil((avgDailySales * 30) + (2 * stdDev)) // 1 month + buffer
      };
    });
  }

  private static calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;
    const first = values[0];
    const last = values[values.length - 1];
    return ((last - first) / first) * 100;
  }

  private static detectSeasonality(values: number[]): number | null {
    if (values.length < 8) return null;

    const maxLag = Math.floor(values.length / 2);
    let bestLag = null;
    let bestCorrelation = 0;

    for (let lag = 2; lag <= maxLag; lag++) {
      const correlation = this.calculateAutocorrelation(values, lag);
      if (correlation > bestCorrelation && correlation > 0.7) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }

    return bestLag;
  }

  private static calculateAutocorrelation(values: number[], lag: number): number {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n - lag; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
      denominator += Math.pow(values[i] - mean, 2);
    }

    return numerator / denominator;
  }

  private static generateSalesForecast(values: number[], seasonality: number | null): number[] {
    const forecast: number[] = [];
    const forecastHorizon = 5;

    if (seasonality) {
      // Use seasonal pattern for prediction
      const seasonalPattern = this.calculateSeasonalPattern(values, seasonality);
      const trend = this.calculateTrendComponent(values);
      
      for (let i = 0; i < forecastHorizon; i++) {
        const seasonalIndex = i % seasonality;
        const trendValue = trend.slope * (values.length + i) + trend.intercept;
        forecast.push(trendValue * seasonalPattern[seasonalIndex]);
      }
    } else {
      // Use exponential smoothing
      const alpha = 0.3;
      let lastValue = values[values.length - 1];
      let lastTrend = values[values.length - 1] - values[values.length - 2];

      for (let i = 0; i < forecastHorizon; i++) {
        const nextValue = lastValue + lastTrend;
        forecast.push(nextValue);
        lastTrend = alpha * (nextValue - lastValue) + (1 - alpha) * lastTrend;
        lastValue = nextValue;
      }
    }

    return forecast;
  }

  private static calculateSeasonalPattern(values: number[], seasonality: number): number[] {
    const pattern = new Array(seasonality).fill(0);
    const counts = new Array(seasonality).fill(0);

    for (let i = 0; i < values.length; i++) {
      const index = i % seasonality;
      pattern[index] += values[i];
      counts[index]++;
    }

    return pattern.map((sum, i) => sum / counts[i]);
  }

  private static calculateTrendComponent(values: number[]): { slope: number; intercept: number } {
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }
}