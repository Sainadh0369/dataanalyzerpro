export interface SimulationScenario {
  name: string;
  description: string;
  adjustments: Record<string, number>;
  probability: number;
  results: Record<string, number[]>;
}

export interface SensitivityAnalysis {
  variable: string;
  variations: {
    percentage: number;
    impact: number;
    direction: 'positive' | 'negative';
  }[];
  elasticity: number;
}

export interface SimulationResult {
  field: string;
  scenarios: SimulationScenario[];
  sensitivity: SensitivityAnalysis[];
  summary: {
    bestCase: number;
    baseCase: number;
    worstCase: number;
    range: number;
    confidence: number;
  };
}