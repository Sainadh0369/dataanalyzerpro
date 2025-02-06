import { DataField } from '@/types/data';
import { calculateFieldStats } from '../statistics/calculations';
import { determineTrend } from '../statistics/trends';
import { createError } from '@/utils/core/error';
import type { SimulationResult, SimulationScenario, SensitivityAnalysis } from './types';

export class SimulationEngine {
  private fields: DataField[];
  private readonly SENSITIVITY_VARIATIONS = [10, 20, 30];

  constructor(fields: DataField[]) {
    this.validateFields(fields);
    this.fields = fields;
  }

  private validateFields(fields: DataField[]) {
    if (!fields?.length) {
      throw createError('SIMULATION_ERROR', 'Please upload data before running simulations');
    }

    const numericFields = fields.filter(f => f.type === 'number');
    if (numericFields.length === 0) {
      throw createError('SIMULATION_ERROR', 'Your data must contain numeric fields to run simulations');
    }
  }

  async runSimulation(): Promise<SimulationResult[]> {
    const numericFields = this.fields.filter(f => f.type === 'number');
    
    // Additional validation
    if (numericFields.some(f => !Array.isArray(f.value) || f.value.length === 0)) {
      throw createError('SIMULATION_ERROR', 'Invalid or empty numeric fields detected');
    }
    
    return Promise.all(numericFields.map(async field => ({
      field: field.name,
      scenarios: await this.generateScenarios(field),
      sensitivity: this.performSensitivityAnalysis(field),
      summary: this.generateSummary(field)
    })));
  }

  private async generateScenarios(field: DataField): Promise<SimulationScenario[]> {
    const values = field.value as number[];
    const stats = calculateFieldStats(field);
    const trend = determineTrend(values);
    
    // Calculate trend factor
    const trendFactor = trend === 'up' ? 1.1 : trend === 'down' ? 0.9 : 1.0;
    
    // Generate scenarios
    return [
      {
        name: 'Best Case',
        description: 'Optimistic scenario with favorable conditions',
        adjustments: { [field.name]: 15 },
        probability: 0.25,
        results: this.simulateScenario(values, trendFactor * 1.15)
      },
      {
        name: 'Base Case',
        description: 'Most likely scenario based on current trends',
        adjustments: { [field.name]: 0 },
        probability: 0.5,
        results: this.simulateScenario(values, trendFactor)
      },
      {
        name: 'Worst Case',
        description: 'Conservative scenario with adverse conditions',
        adjustments: { [field.name]: -15 },
        probability: 0.25,
        results: this.simulateScenario(values, trendFactor * 0.85)
      }
    ];
  }

  private simulateScenario(values: number[], factor: number): Record<string, number[]> {
    // Initialize TypedArrays for better performance
    const valuesArray = new Float64Array(values);
    const result = new Float64Array(5); // 5 future points
    
    if (!Array.isArray(values) || values.length === 0) {
      throw new Error('Invalid input data for simulation');
    }
    
    if (valuesArray.some(v => !isFinite(v))) {
      throw new Error('Input data contains invalid numeric values');
    }
    
    const volatility = this.calculateVolatility(valuesArray);
    const lastValue = valuesArray[valuesArray.length - 1];
    const trend = this.calculateTrend(valuesArray);
    
    for (let i = 0; i < result.length; i++) {
      // Use Monte Carlo simulation
      const randomWalk = volatility * Math.sqrt(1/12) * (Math.random() * 2 - 1);
      const trendFactor = 1 + (trend * factor);
      result[i] = lastValue * trendFactor * (1 + randomWalk);
    }
    
    return { values: Array.from(result) };
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) {
      return 0;
    }
    
    const returns = values.slice(1).map((v, i) => Math.log(v / values[i]));
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  private calculateTrend(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;

    // Ensure no zero values that would cause log(0)
    if (values.some(v => v <= 0)) {
      return 0;
    }
    
    const returns = values.slice(1).map((v, i) => Math.log(v / values[i]));
    return returns.reduce((a, b) => a + b, 0) / (n - 1);
  }

  private performSensitivityAnalysis(field: DataField): SensitivityAnalysis[] {
    const values = field.value as number[];
    const baseValue = values[values.length - 1];
    
    return [{
      variable: field.name,
      variations: this.SENSITIVITY_VARIATIONS.flatMap(percentage => {
        const variations = [];
        
        // Positive variation
        const positiveImpact = this.calculateImpact(baseValue, percentage);
        variations.push({
          percentage,
          impact: positiveImpact,
          direction: 'positive'
        });
        
        // Negative variation
        const negativeImpact = this.calculateImpact(baseValue, -percentage);
        variations.push({
          percentage: -percentage,
          impact: negativeImpact,
          direction: 'negative'
        });
        
        return variations;
      }),
      elasticity: this.calculateElasticity(values)
    }];
  }

  private calculateImpact(baseValue: number, percentage: number): number {
    const change = baseValue * (percentage / 100);
    return Math.abs((baseValue + change - baseValue) / baseValue);
  }

  private calculateElasticity(values: number[]): number {
    const percentageChange = ((values[values.length - 1] - values[0]) / values[0]) * 100;
    const timeChange = values.length - 1;
    return Math.abs(percentageChange / timeChange);
  }

  private generateSummary(field: DataField): SimulationResult['summary'] {
    const values = field.value as number[];
    const stats = calculateFieldStats(field);
    const lastValue = values[values.length - 1];
    
    const bestCase = lastValue * 1.15;
    const baseCase = lastValue;
    const worstCase = lastValue * 0.85;
    
    return {
      bestCase,
      baseCase,
      worstCase,
      range: bestCase - worstCase,
      confidence: 1 - (stats.stdDev / stats.mean) // Higher stability = higher confidence
    };
  }
}