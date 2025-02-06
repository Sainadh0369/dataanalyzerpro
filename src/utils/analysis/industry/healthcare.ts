import { DataField } from '@/types/data';
import { calculateFieldStats } from '../statistics/calculations';

interface PatientOutcomeMetrics {
  successRate: number;
  readmissionRate: number;
  avgRecoveryTime: number;
  riskFactors: string[];
}

interface TreatmentEffectiveness {
  treatment: string;
  effectiveness: number;
  confidence: number;
  sideEffects: string[];
}

export class HealthcareAnalyzer {
  static analyzePatientOutcomes(fields: DataField[]): PatientOutcomeMetrics {
    const outcomes = fields.find(f => f.name.toLowerCase().includes('outcome'))?.value as string[];
    const readmissions = fields.find(f => f.name.toLowerCase().includes('readmission'))?.value as number[];
    const recoveryTimes = fields.find(f => f.name.toLowerCase().includes('recovery'))?.value as number[];

    const successRate = outcomes ? 
      outcomes.filter(o => o.toLowerCase().includes('success')).length / outcomes.length : 0;

    const readmissionRate = readmissions ?
      readmissions.filter(r => r === 1).length / readmissions.length : 0;

    const avgRecoveryTime = recoveryTimes ?
      recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length : 0;

    return {
      successRate,
      readmissionRate,
      avgRecoveryTime,
      riskFactors: this.identifyRiskFactors(fields)
    };
  }

  static analyzeTreatmentEffectiveness(fields: DataField[]): TreatmentEffectiveness[] {
    const treatments = fields.find(f => f.name.toLowerCase().includes('treatment'))?.value as string[];
    const outcomes = fields.find(f => f.name.toLowerCase().includes('outcome'))?.value as string[];
    const sideEffects = fields.find(f => f.name.toLowerCase().includes('side_effects'))?.value as string[];

    const treatmentResults = new Map<string, { success: number; total: number; effects: Set<string> }>();

    if (treatments && outcomes) {
      treatments.forEach((treatment, i) => {
        if (!treatmentResults.has(treatment)) {
          treatmentResults.set(treatment, { success: 0, total: 0, effects: new Set() });
        }
        const result = treatmentResults.get(treatment)!;
        result.total++;
        if (outcomes[i].toLowerCase().includes('success')) {
          result.success++;
        }
        if (sideEffects?.[i]) {
          result.effects.add(sideEffects[i]);
        }
      });
    }

    return Array.from(treatmentResults.entries()).map(([treatment, data]) => ({
      treatment,
      effectiveness: data.success / data.total,
      confidence: Math.sqrt(data.total) / 10, // Confidence increases with sample size
      sideEffects: Array.from(data.effects)
    }));
  }

  private static identifyRiskFactors(fields: DataField[]): string[] {
    const riskFactors: string[] = [];
    const outcomes = fields.find(f => f.name.toLowerCase().includes('outcome'))?.value as string[];
    
    fields.forEach(field => {
      if (field.type === 'number' && outcomes) {
        const values = field.value as number[];
        const correlation = this.calculateRiskCorrelation(values, outcomes);
        if (Math.abs(correlation) > 0.3) {
          riskFactors.push(
            `${field.name} (${correlation > 0 ? 'Positive' : 'Negative'} correlation: ${Math.abs(correlation).toFixed(2)})`
          );
        }
      }
    });

    return riskFactors;
  }

  private static calculateRiskCorrelation(values: number[], outcomes: string[]): number {
    const successValues = outcomes.map(o => o.toLowerCase().includes('success') ? 1 : 0);
    const meanX = values.reduce((a, b) => a + b, 0) / values.length;
    const meanY = successValues.reduce((a, b) => a + b, 0) / successValues.length;
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < values.length; i++) {
      const diffX = values[i] - meanX;
      const diffY = successValues[i] - meanY;
      numerator += diffX * diffY;
      denomX += diffX * diffX;
      denomY += diffY * diffY;
    }
    
    return numerator / Math.sqrt(denomX * denomY);
  }
}