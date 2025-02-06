import { DataField } from '@/types/data';
import { determineTrend } from '../statistics/trends';
import { calculateFieldStats } from '../statistics/calculations';

interface FraudDetectionResult {
  transactions: {
    id: string;
    riskScore: number;
    flags: string[];
    confidence: number;
  }[];
  summary: {
    totalFlagged: number;
    riskDistribution: {
      high: number;
      medium: number;
      low: number;
    };
    commonPatterns: string[];
  };
}

interface RiskAnalysisResult {
  overallRisk: number;
  factors: {
    name: string;
    impact: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    recommendations: string[];
  }[];
  metrics: {
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
}

export class FinanceAnalyzer {
  static detectFraud(fields: DataField[]): FraudDetectionResult {
    const transactions = this.analyzeFraudRisk(fields);
    const summary = this.summarizeFraudFindings(transactions);

    return {
      transactions,
      summary
    };
  }

  static analyzeRisk(fields: DataField[]): RiskAnalysisResult {
    const riskFactors = this.identifyRiskFactors(fields);
    const metrics = this.calculateRiskMetrics(fields);
    const overallRisk = this.calculateOverallRisk(riskFactors, metrics);

    return {
      overallRisk,
      factors: riskFactors,
      metrics
    };
  }

  private static analyzeFraudRisk(fields: DataField[]): FraudDetectionResult['transactions'] {
    const transactions: FraudDetectionResult['transactions'] = [];
    const amounts = fields.find(f => f.name.toLowerCase().includes('amount'))?.value as number[];
    const times = fields.find(f => f.name.toLowerCase().includes('time'))?.value as string[];
    const locations = fields.find(f => f.name.toLowerCase().includes('location'))?.value as string[];
    const ids = fields.find(f => f.name.toLowerCase().includes('id'))?.value as string[];

    if (!amounts || !times || !ids) return [];

    for (let i = 0; i < ids.length; i++) {
      const flags: string[] = [];
      let riskScore = 0;

      // Check for unusual amount
      const stats = calculateFieldStats({ name: 'amount', type: 'number', value: amounts });
      if (amounts[i] > stats.mean + 2 * stats.stdDev) {
        flags.push('Unusual amount');
        riskScore += 0.3;
      }

      // Check for unusual time
      if (times[i]) {
        const hour = new Date(times[i]).getHours();
        if (hour < 6 || hour > 22) {
          flags.push('Unusual time');
          riskScore += 0.2;
        }
      }

      // Check for location anomalies
      if (locations) {
        const userLocations = locations.filter((_, idx) => 
          times[idx] && 
          Math.abs(new Date(times[idx]).getTime() - new Date(times[i]).getTime()) < 3600000
        );
        if (userLocations.length > 1 && new Set(userLocations).size > 1) {
          flags.push('Multiple locations');
          riskScore += 0.4;
        }
      }

      if (flags.length > 0) {
        transactions.push({
          id: ids[i],
          riskScore,
          flags,
          confidence: this.calculateConfidence(flags.length, riskScore)
        });
      }
    }

    return transactions;
  }

  private static summarizeFraudFindings(
    transactions: FraudDetectionResult['transactions']
  ): FraudDetectionResult['summary'] {
    const riskDistribution = {
      high: 0,
      medium: 0,
      low: 0
    };

    transactions.forEach(t => {
      if (t.riskScore > 0.7) riskDistribution.high++;
      else if (t.riskScore > 0.4) riskDistribution.medium++;
      else riskDistribution.low++;
    });

    const patterns = new Map<string, number>();
    transactions.forEach(t => {
      t.flags.forEach(flag => {
        patterns.set(flag, (patterns.get(flag) || 0) + 1);
      });
    });

    const commonPatterns = Array.from(patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pattern, count]) => 
        `${pattern} (${count} occurrences)`
      );

    return {
      totalFlagged: transactions.length,
      riskDistribution,
      commonPatterns
    };
  }

  private static identifyRiskFactors(fields: DataField[]): RiskAnalysisResult['factors'] {
    return fields
      .filter(f => f.type === 'number')
      .map(field => {
        const values = field.value as number[];
        const stats = calculateFieldStats(field);
        const trend = this.analyzeTrend(values);
        const impact = this.calculateRiskImpact(values, stats);

        return {
          name: field.name,
          impact,
          trend,
          recommendations: this.generateRiskRecommendations(field.name, impact, trend)
        };
      })
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  }

  private static calculateRiskMetrics(fields: DataField[]): RiskAnalysisResult['metrics'] {
    const returns = fields.find(f => f.name.toLowerCase().includes('return'))?.value as number[];
    
    if (!returns?.length) {
      return {
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0
      };
    }

    const volatility = this.calculateVolatility(returns);
    const sharpeRatio = this.calculateSharpeRatio(returns, volatility);
    const maxDrawdown = this.calculateMaxDrawdown(returns);

    return {
      volatility,
      sharpeRatio,
      maxDrawdown
    };
  }

  private static calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / returns.length);
  }

  private static calculateSharpeRatio(returns: number[], volatility: number): number {
    const riskFreeRate = 0.02; // Assumed risk-free rate
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    return (meanReturn - riskFreeRate) / volatility;
  }

  private static calculateMaxDrawdown(returns: number[]): number {
    let maxDrawdown = 0;
    let peak = returns[0];
    
    returns.forEach(value => {
      if (value > peak) {
        peak = value;
      } else {
        const drawdown = (peak - value) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    });

    return maxDrawdown;
  }

  private static calculateOverallRisk(
    factors: RiskAnalysisResult['factors'],
    metrics: RiskAnalysisResult['metrics']
  ): number {
    const factorRisk = factors.reduce((sum, factor) => 
      sum + Math.abs(factor.impact), 0) / factors.length;
    
    const metricRisk = (
      (metrics.volatility * 0.4) +
      (Math.max(0, -metrics.sharpeRatio) * 0.3) +
      (metrics.maxDrawdown * 0.3)
    );

    return (factorRisk * 0.6 + metricRisk * 0.4);
  }

  private static analyzeTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    const trend = determineTrend(values as number[]);
    return trend === 'up' ? 'increasing' : trend === 'down' ? 'decreasing' : 'stable';
  }

  private static calculateRiskImpact(values: number[], stats: any): number {
    const volatility = stats.stdDev / stats.mean;
    const trend = this.analyzeTrend(values);
    const trendFactor = trend === 'increasing' ? 1.2 : trend === 'decreasing' ? 0.8 : 1;
    
    return volatility * trendFactor;
  }

  private static generateRiskRecommendations(
    name: string,
    impact: number,
    trend: 'increasing' | 'decreasing' | 'stable'
  ): string[] {
    const recommendations: string[] = [];

    if (Math.abs(impact) > 0.5) {
      recommendations.push(`Monitor ${name} closely due to high volatility`);
    }

    if (trend === 'increasing' && impact > 0) {
      recommendations.push(`Consider hedging against rising ${name}`);
    } else if (trend === 'decreasing' && impact > 0) {
      recommendations.push(`Evaluate exposure to declining ${name}`);
    }

    if (recommendations.length === 0) {
      recommendations.push(`Maintain current position on ${name}`);
    }

    return recommendations;
  }

  private static calculateConfidence(flagCount: number, riskScore: number): number {
    // More flags and higher risk score increase confidence
    return Math.min(0.3 + (flagCount * 0.2) + (riskScore * 0.5), 1);
  }
}