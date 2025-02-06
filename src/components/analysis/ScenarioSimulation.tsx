import React from 'react';
import { Calculator, TrendingUp, AlertCircle, PlayCircle, X, RotateCcw } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { DataField } from '@/types/data';
import { calculateFieldStats } from '@/utils/analysis/statistics/calculations';
import { formatNumber } from '@/utils/analysis/formatting';

interface ScenarioSimulationProps {
  data: {
    fields: DataField[];
  };
}

export function ScenarioSimulation({ data }: ScenarioSimulationProps) {
  const [scenarios, setScenarios] = React.useState<Array<{
    id: string;
    name: string;
    adjustments: Record<string, number>;
    results: Record<string, number[]>;
  }>>([]);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCreateScenario = () => {
    if (!data?.fields?.length) {
      setError('No data available for simulation');
      return;
    }

    const numericFields = data.fields.filter(f => f.type === 'number');
    if (numericFields.length === 0) {
      setError('No numeric fields available for simulation');
      return;
    }

    const newScenario = {
      id: crypto.randomUUID(),
      name: `Scenario ${scenarios.length + 1}`,
      adjustments: Object.fromEntries(numericFields.map(f => [f.name, 0])),
      results: {}
    };
    setScenarios([...scenarios, newScenario]);
  };

  // Validate data before rendering
  if (!data?.fields?.length) {
    return (
      <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <p className="text-red-600">No data available for simulation</p>
      </div>
    );
  }

  const numericFields = data.fields.filter(f => f.type === 'number');
  if (numericFields.length === 0) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        <p className="text-yellow-700">No numeric fields available for simulation</p>
      </div>
    );
  }
  const handleRunSimulation = async (scenarioId: string) => {
    try {
      setIsSimulating(true);
      setError(null);

      if (!data?.fields?.length) {
        throw new Error('No data available for simulation');
      }
      
      // Simulate scenario effects
      const scenario = scenarios.find(s => s.id === scenarioId);
      if (!scenario) return;

      const results: Record<string, number[]> = {};
      const numericFields = data.fields.filter(f => f.type === 'number');

      if (numericFields.length === 0) {
        throw new Error('No numeric fields available for simulation');
      }

      numericFields.forEach(field => {
        const values = field.value as number[];
        const stats = calculateFieldStats(field);
        const adjustment = scenario.adjustments[field.name] || 0;

        // Generate simulated values
        results[field.name] = values.map(v => 
          v * (1 + adjustment / 100) + (Math.random() - 0.5) * stats.stdDev
        );
      });

      // Update scenario results
      setScenarios(prev => prev.map(s => 
        s.id === scenarioId ? { ...s, results } : s
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-semibold">Scenario Simulation</h3>
          </div>
          {!isSimulating && (
          <button
            onClick={handleCreateScenario}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            <PlayCircle className="w-4 h-4" />
            New Scenario
          </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Scenarios */}
        <div className="space-y-6">
          {scenarios.map(scenario => (
            <div key={scenario.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={scenario.name}
                  onChange={(e) => setScenarios(prev => prev.map(s => 
                    s.id === scenario.id ? { ...s, name: e.target.value } : s
                  ))}
                  className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunSimulation(scenario.id)}
                    disabled={isSimulating}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-teal-600 border border-teal-200 rounded hover:bg-teal-50"
                  >
                    {isSimulating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-600 border-t-transparent" />
                    ) : (
                      <PlayCircle className="w-4 h-4" />
                    )}
                    Run
                  </button>
                  <button
                    onClick={() => setScenarios(prev => prev.filter(s => s.id !== scenario.id))}
                    className="p-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Adjustments */}
              <div className="space-y-4 mb-6">
                <h4 className="text-sm font-medium text-gray-700">Adjustments</h4>
                {data.fields.filter(f => f.type === 'number').map(field => (
                  <div key={field.name} className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 min-w-[120px]">
                      {field.name}
                    </span>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      step="1"
                      value={scenario.adjustments[field.name] || 0}
                      onChange={(e) => setScenarios(prev => prev.map(s => 
                        s.id === scenario.id ? {
                          ...s,
                          adjustments: {
                            ...s.adjustments,
                            [field.name]: Number(e.target.value)
                          }
                        } : s
                      ))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium min-w-[60px]">
                      {scenario.adjustments[field.name] || 0}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Results */}
              {Object.keys(scenario.results).length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Results</h4>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: Array.from(
                          { length: Object.values(scenario.results)[0]?.length || 0 },
                          (_, i) => i + 1
                        ),
                        datasets: Object.entries(scenario.results).map(([field, values], i) => ({
                          label: field,
                          data: values,
                          borderColor: `hsl(${i * 360 / Object.keys(scenario.results).length}, 70%, 50%)`,
                          backgroundColor: `hsla(${i * 360 / Object.keys(scenario.results).length}, 70%, 50%, 0.1)`,
                          fill: true
                        }))
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: 'Simulated Results'
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}