import React from 'react';
import { 
  Brain, Calculator, TrendingUp, MessageSquare, Clock, Map, BarChart2, Share2,
  BarChart, TestTube, LineChart, Bot, FileText, Timer, Globe, Briefcase, Network,
  Building2, Target as TargetIcon, Minus, PlayCircle, Download, Save, Hash, Minimize2, GitBranch, BoxSelect,
  AlertCircle, CheckCircle
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import type { DataField } from '@/types/data';
import { getTrendDescription } from '@/utils/analysis/statistics/formatting';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnalysisCategories } from './AnalysisCategories';
import { QuickActionCard } from './QuickActionCard';
import { AnalysisErrorBoundary } from './AnalysisErrorBoundary';
import { SystemHealthMonitor } from './SystemHealthMonitor';
import { AlertSystem } from './AlertSystem';
import { AnalysisReport } from './AnalysisReport';
import { DataTypeAnalysisView } from './DataTypeAnalysis';
import { MLAnalysisView } from './MLAnalysisView';
import { AnalysisOverview } from './AnalysisOverview';
import { StatisticalSummary } from './StatisticalSummary';
import { IndustryAnalysisView } from './industry/IndustryAnalysisView';
import { ChartView } from '@/components/visualization';
import { CorrelationMatrix } from './CorrelationMatrix';
import { calculateFieldStats } from '@/utils/analysis/statistics/calculations';
import { generateReport, downloadReport } from '@/utils/analysis/reports';
import { runSimulation } from '@/utils/analysis/simulation';
import { generatePredictions } from '@/utils/analysis/predictions';
import { generateAutoInsights } from '@/utils/analysis/insights';
import { useAnalysis } from '@/hooks/analysis';
import { useFileUpload } from '@/hooks/file';

export function AnalysisSection({ data, category, results }: {
  data: {
    fields: DataField[];
  };
  category: string | null;
  results: any;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { isAnalyzing } = useAnalysis();
  const { isUploading } = useFileUpload(() => {});
  const [isGeneratingReport, setIsGeneratingReport] = React.useState(false);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [isPredicting, setIsPredicting] = React.useState(false);

  const handleSaveToWorkspace = async () => {
    try {
      // Save current analysis to workspace
      // Implementation will be added later
    } catch (error) {
      console.error('Failed to save to workspace:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      if (!data?.fields?.length) {
        throw new Error('No data available for report generation');
      }
      setError(null);
      const report = await generateReport(data);
      downloadReport(report);
    } catch (error) {
      console.error('Failed to generate report:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleRunSimulation = async () => {
    try {
      setIsSimulating(true);
      if (!data?.fields?.length) {
        throw new Error('No data available for simulation');
      }
      setError(null);
      const simulationResults = await runSimulation(data);
      navigate('/analysis/simulations', { state: { results: simulationResults } });
    } catch (error) {
      console.error('Failed to run simulation:', error);
      setError(error instanceof Error ? error.message : 'Failed to run simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleViewPredictions = async () => {
    try {
      setIsPredicting(true);
      if (!data?.fields?.length) {
        throw new Error('No data available for predictions');
      }
      setError(null);
      const predictions = await generatePredictions(data);
      navigate('/analysis/predictions', { state: { predictions } });
    } catch (error) {
      console.error('Failed to view predictions:', error);
      setError(error instanceof Error ? error.message : 'Failed to view predictions');
    } finally {
      setIsPredicting(false);
    }
  };

  const handleAutoInsights = () => {
    try {
      setError(null);
      const insights = generateAutoInsights(data);
      navigate('/analysis/insights', { state: { insights } });
    } catch (error) {
      console.error('Failed to generate insights:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate insights');
    }
  };

  // Use aggregated data
  const aggregatedData = React.useMemo(() => ({
    ...data,
    fields: data.fields.map(field => ({
      ...field,
      value: field.metadata ? [field.metadata.average] : 
        new Float64Array(field.value.slice(0, Math.min(field.value.length, 1000)))
    }))
  }), [data]);

  // Memoize numeric fields to avoid recalculation
  const numericFields = React.useMemo(() => 
    data.fields.filter(f => f.type === 'number'),
    [data.fields]
  );

  // Memoize aggregated data for charts
  const chartData = React.useMemo(() => ({
    labels: numericFields.map(field => field.name),
    datasets: numericFields.map((field, index) => ({
      label: field.name,
      data: field.value,
      borderColor: `hsl(${index * 360 / numericFields.length}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 360 / numericFields.length}, 70%, 50%, 0.1)`,
      fill: true
    }))
  }), [numericFields]);

  // Early validation
  if (!data?.fields?.length) {
    return (
      <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <p className="text-red-600">No data available for analysis</p>
      </div>
    );
  }

  const [regressionType, setRegressionType] = React.useState('linear');

  return (
    <AnalysisErrorBoundary>
      <div className="space-y-8">
        {/* System Monitoring */}
        <div className="flex justify-end">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveToWorkspace}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save to Workspace
            </button>
          </div>
          <AlertSystem data={data} />
        </div>

        <AnalysisOverview data={aggregatedData} />
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QuickActionCard
            title="Download Report"
            description="Generate and download comprehensive analysis report"
            onClick={handleGenerateReport}
            isLoading={isGeneratingReport}
            icon={FileText}
          />
          <QuickActionCard
            title="Run Simulation"
            description="Test different scenarios and predict outcomes"
            onClick={handleRunSimulation}
            isLoading={isSimulating}
            icon={PlayCircle}
          />
          <QuickActionCard
            title="View Predictions"
            description="See AI-powered predictions and forecasts"
            onClick={handleViewPredictions}
            isLoading={isPredicting}
            icon={TrendingUp}
          />
          <QuickActionCard
            title="Auto Insights"
            description="Get automated insights and recommendations"
            onClick={handleAutoInsights}
            isLoading={isAnalyzing}
            icon={Brain}
          />
        </div>

        {/* Insights and Analysis Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Insights */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold">Key Insights</h3>
            </div>
            <ul className="space-y-3">
              {data.fields.map((field, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span className="text-gray-700">
                    {field.type === 'number' 
                      ? `${field.name} shows ${getTrendDescription(field.value as number[])} trend`
                      : `${field.name} contains ${field.value.length} entries`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pros and Cons */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Strengths & Areas for Improvement</h3>
            </div>
            <div className="space-y-4">
              {/* Strengths */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {data.fields
                    .filter(f => f.type === 'number')
                    .map((field, index) => {
                      const stats = calculateFieldStats(field);
                      return stats.trend === 'up' ? (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span className="text-gray-700">
                            {field.name} shows positive growth
                          </span>
                        </li>
                      ) : null;
                    })}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {data.fields
                    .filter(f => f.type === 'number')
                    .map((field, index) => {
                      const stats = calculateFieldStats(field);
                      return stats.trend === 'down' ? (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span className="text-gray-700">
                            {field.name} shows declining trend
                          </span>
                        </li>
                      ) : null;
                    })}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Categories */}
        <AnalysisCategories data={aggregatedData} />
        
        {/* Category-specific Analysis */}
        {category && results && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            {results.error ? (
              <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                {results.error}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold">
                    {category.charAt(0).toUpperCase() + category.slice(1)} Analysis
                  </h3>
                </div>
                
                {/* Render appropriate component based on category */}
                {category === 'descriptive' && results.statistics && (
                  <StatisticalSummary data={data} />
                )}
                
                {category === 'visualization' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-4">Distribution Overview</h4>
                        <div className="h-[300px]">
                          <ChartView data={data.fields} type="bar" title="Data Distribution" />
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-4">Trend Analysis</h4>
                        <div className="h-[300px]">
                          <ChartView data={data.fields} type="line" title="Value Trends" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {category === 'correlation' && (
                  <div className="space-y-8">
                    <CorrelationMatrix fields={data.fields} />
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-4">Correlation Visualization</h4>
                      <div className="h-[400px]">
                        <ChartView 
                          data={data.fields.filter(f => f.type === 'number')} 
                          type="scatter" 
                          title="Variable Relationships" 
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {category === 'hypothesis' && results.tests && (
                  <div className="space-y-8">
                    {results.tests.map((test: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-6 rounded-lg space-y-6">
                        <h4 className="font-medium text-gray-900">{test.field}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {test.tests.map((result: any, i: number) => (
                            <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                              <h5 className="font-medium text-gray-800 mb-4">{result.name}</h5>
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Test Statistic:</span>
                                  <span className="font-medium">{isFinite(result.statistic) ? result.statistic.toFixed(4) : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">P-Value:</span>
                                  <span className="font-medium">{isFinite(result.pValue) ? result.pValue.toFixed(4) : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Critical Value:</span>
                                  <span className="font-medium">{isFinite(result.criticalValue) ? result.criticalValue.toFixed(4) : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Effect Size:</span>
                                  <span className="font-medium">{isFinite(result.effectSize) ? result.effectSize.toFixed(4) : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">Power:</span>
                                  <span className="font-medium">{isFinite(result.power) ? `${(result.power * 100).toFixed(1)}%` : 'N/A'}</span>
                                </div>
                                <div className="pt-2 border-t">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Result:</span>
                                    <span className={`font-medium ${result.significant ? 'text-green-600' : 'text-gray-600'}`}>
                                      {result.significant ? 'Significant' : 'Not Significant'}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 italic text-sm mt-2">{result.interpretation}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {category === 'regression' && results.models && (
                  <div className="space-y-8">
                    {results.error && (
                      <div className="bg-yellow-50 p-4 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                        <p className="text-yellow-700">{results.error}</p>
                      </div>
                    )}
                    {/* Regression Type Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[
                        { id: 'linear', name: 'Linear Regression', icon: TrendingUp },
                        { id: 'multiple', name: 'Multiple Linear', icon: BarChart2 },
                        { id: 'logistic', name: 'Logistic Regression', icon: Brain },
                        { id: 'polynomial', name: 'Polynomial', icon: LineChart },
                        { id: 'ridge', name: 'Ridge (L2)', icon: Hash },
                        { id: 'lasso', name: 'Lasso (L1)', icon: Minimize2 },
                        { id: 'elastic-net', name: 'Elastic Net', icon: Network },
                        { id: 'stepwise', name: 'Stepwise', icon: GitBranch },
                        { id: 'time-series', name: 'Time Series', icon: Timer },
                        { id: 'quantile', name: 'Quantile', icon: BoxSelect },
                        { id: 'log-log', name: 'Log-Log', icon: TargetIcon }
                      ].map(type => (
                        <button
                          key={type.id}
                          onClick={() => setRegressionType(type.id)}
                          className={`p-4 rounded-lg border transition-colors ${
                            regressionType === type.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <type.icon className="w-5 h-5 text-indigo-600" />
                            <span className="font-medium">{type.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {results.models.map((model: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">{model.field}</h4>
                        <div className="h-[300px] mb-4">
                          <ChartView 
                            data={[
                              { name: 'Actual', type: 'number', value: model.actualValues },
                              { name: 'Predicted', type: 'number', value: model.predictions }
                            ]} 
                            type="line" 
                            title={`${model.type} Regression Model`}
                          />
                        </div>
                        <div className="space-y-4">
                          <div className="bg-gray-100 p-3 rounded-md">
                            <p className="font-mono text-sm">{model.equation}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-3 rounded-md shadow-sm">
                              <p className="text-sm text-gray-500">R² Score</p>
                              <p className="text-lg font-semibold">
                                {(model.rSquared * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-md shadow-sm">
                              <p className="text-sm text-gray-500">RMSE</p>
                              <p className="text-lg font-semibold">
                                {model.metrics.rmse.toFixed(3)}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-md shadow-sm">
                              <p className="text-sm text-gray-500">MAE</p>
                              <p className="text-lg font-semibold">
                                {model.metrics.mae.toFixed(3)}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-md shadow-sm">
                              <p className="text-sm text-gray-500">Adj. R²</p>
                              <p className="text-lg font-semibold">
                                {(model.metrics.rsquaredAdj * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          {/* Confidence Intervals */}
                          <div className="bg-white p-4 rounded-md shadow-sm">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">
                              Prediction Confidence Intervals
                            </h5>
                            <div className="h-[200px]">
                              <Line
                                data={{
                                  labels: Array.from({ length: model.predictions.length }, (_, i) => i + 1),
                                  datasets: [
                                    {
                                      label: 'Prediction',
                                      data: model.predictions,
                                      borderColor: 'rgb(99, 102, 241)',
                                      backgroundColor: 'transparent',
                                      borderWidth: 2
                                    },
                                    {
                                      label: 'Upper Bound',
                                      data: model.confidence.upper,
                                      borderColor: 'rgba(99, 102, 241, 0.3)',
                                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                      borderWidth: 1,
                                      fill: 1
                                    },
                                    {
                                      label: 'Lower Bound',
                                      data: model.confidence.lower,
                                      borderColor: 'rgba(99, 102, 241, 0.3)',
                                      backgroundColor: 'transparent',
                                      borderWidth: 1,
                                      fill: false
                                    }
                                  ]
                                }}
                                options={{
                                  responsive: true,
                                  plugins: {
                                    title: {
                                      display: true,
                                      text: '95% Confidence Interval'
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {category === 'ml' && results.predictions && (
                  <MLAnalysisView analysis={results.predictions} />
                )}
                
                {category === 'text' && results.analysis && (
                  <div className="space-y-4">
                    {results.analysis.map((analysis: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">{analysis.field}</h4>
                        <p className="text-sm">Word Count: {analysis.wordCount}</p>
                        <p className="text-sm">Unique Words: {analysis.uniqueWords}</p>
                        <p className="text-sm">Average Length: {analysis.averageLength.toFixed(1)}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {category === 'time' && results.series && (
                  <div className="space-y-8">
                    {results.series.map((series: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">{series.field}</h4>
                        <div className="h-[300px] mb-4">
                          <ChartView 
                            data={[
                              { name: 'Historical', type: 'number', value: series.values },
                              { name: 'Forecast', type: 'number', value: series.forecast }
                            ]} 
                            type="line" 
                            title="Time Series Analysis" 
                          />
                        </div>
                        <p className="text-sm">Trend: {series.trend}</p>
                        {series.seasonality && (
                          <p className="text-sm">Seasonality: {series.seasonality} periods</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {category === 'spatial' && results.locations && (
                  <div className="space-y-4">
                    {results.locations.map((loc: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">{loc.field}</h4>
                        <p className="text-sm">
                          Coordinates: {loc.coordinates.length} points
                        </p>
                        <p className="text-sm">
                          Clusters: {loc.clusters.length} identified
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                {category === 'business' && results.metrics && (
                  <div className="space-y-4">
                    {results.metrics.map((metric: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">{metric.field}</h4>
                        <p className="text-sm">Growth Rate: {metric.growth.toFixed(1)}%</p>
                        <p className="text-sm">Trend: {metric.trend}</p>
                        <p className="text-sm text-gray-600">{metric.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {category === 'network' && results.nodes && (
                  <div className="space-y-4">
                    {results.nodes.map((node: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">{node.field}</h4>
                        <p className="text-sm">
                          Connections: {node.connections.length}
                        </p>
                        <p className="text-sm">
                          Centrality: {(node.centrality * 100).toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                {category === 'industry' && (
                  <IndustryAnalysisView data={data} />
                )}
              </>
            )}
          </div>
        )}

        {/* System Health Monitor */}
        <SystemHealthMonitor />
      </div>
    </AnalysisErrorBoundary>
  );
}