import { DataField } from '@/types/data';
import { SimulationEngine } from './simulation/engine';
import { createError } from '../core/error';
import type { SimulationResult } from './simulation/types';

export async function runSimulation(data: { fields: DataField[] }): Promise<SimulationResult[]> {
  try {
    const engine = new SimulationEngine(data.fields);
    return await engine.runSimulation();
  } catch (error) {
    console.error('Simulation error:', error);
    throw createError(
      'SIMULATION_ERROR',
      error instanceof Error ? error.message : 'Failed to run simulation'
    );
  }
}