import React from 'react';
import { TrendingUp, Info, AlertCircle, Brain, BarChart2, LineChart, Hash, Minimize2, Network, GitBranch, Timer, BoxSelect, TargetIcon } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { DataField } from '@/types/data';
import { performRegression } from '@/utils/analysis/regression';
import { formatNumber } from '@/utils/analysis/formatting';

interface RegressionAnalysisProps {
  data: {
    fields: DataField[];
  };
}

interface RegressionResult {
  field: string;
  equation: string;
  rSquared: number;
  standardError: number;
  predictions: number[];
  actualValues: number[];
}

interface ModelQualityProps {
  rSquared: number;
  standardError: number;
  equation: string;
}

function ModelQuality({ rSquared, standardError, equation }: ModelQualityProps) {
  const getQualityColor = (r2: number) => {
    if (r2 > 0.7) return 'text-green-600';
    if (r2 > 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLabel = (r2: number) => {
    if (r2 > 0.7) return 'Strong fit';
    if (r2 > 0.5) return 'Moderate fit';
    return 'Weak fit';
  };

  return (
    <div className="space-y-6">
      {/* Equation Display */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h5 className="text-sm font-medium text-gray-600 mb-2">Regression Equation</h5>
        <div className="bg-gray-50 p-3 rounded-md overflow-x-auto">
          <code className="text-sm font-mono whitespace-nowrap">
            {equation}
          </code>
        </div>
      </div>

      {/* Model Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h5 className="text-sm font-medium text-gray-600 mb-3">Model Fit (R²)</h5>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="h-3 bg-gray-100 rounded-full">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getQualityColor(rSquared)}`}
                    style={{ width: `${rSquared * 100}%` }}
                  />
                </div>
              </div>
              <span className={`text-sm font-medium ${getQualityColor(rSquared)}`}>
                {(rSquared * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-gray-500">{getQualityLabel(rSquared)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h5 className="text-sm font-medium text-gray-600 mb-3">Prediction Error</h5>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-gray-900">±{formatNumber(standardError)}</span>
            </div>
            <p className="text-xs text-gray-500">Average deviation from predicted values</p>
          </div>
        </div>
      </div>
      
      {/* Model Interpretation */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h5 className="text-sm font-medium text-gray-600 mb-2">Model Interpretation</h5>
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            {rSquared > 0.7 
              ? 'The model demonstrates strong predictive power, explaining a high percentage of data variation.'
              : rSquared > 0.5
              ? 'The model shows moderate predictive capability with room for improvement.'
              : 'The model has limited predictive power, suggesting complex or noisy relationships in the data.'}
          </p>
          <p className="text-sm text-gray-600">
            With a prediction error of ±{formatNumber(standardError)}, estimates are expected to fall within this range of actual values.
          </p>
        </div>
      </div>
    </div>
  );
}

export function RegressionAnalysis({ data }: RegressionAnalysisProps) {
  const [regressionType, setRegressionType] = React.useState('linear');
  const [selectedVariables, setSelectedVariables] = React.useState<{
    dependent?: string;
    independent?: string[];
  }>({});
  const [results, setResults] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  // Validate numeric fields
  const numericFields = data.fields.filter(f => f.type === 'number');
  
  if (numericFields.length < 2) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg flex items-center gap-2">
        <div className="flex items-center gap-2 text-yellow-700">
          <AlertCircle className="w-5 h-5" />
          <p>At least two numeric fields are required for regression analysis</p>
        </div>
      </div>
    );
  }

  // Handle regression analysis
  const handleAnalyze = async () => {
    // Validate inputs
    if (!selectedVariables.dependent || !selectedVariables.independent?.length) {
      setError('Please select both dependent and independent variables');
      return;
    }

    const dependentField = numericFields.find(f => f.name === selectedVariables.dependent);
    const independentFields = selectedVariables.independent
      .map(name => numericFields.find(f => f.name === name))
      .filter((f): f is DataField => f !== undefined);

    if (!dependentField || independentFields.length === 0) {
      setError('Selected fields not found');
      return;
    }

    if (!selectedVariables.dependent || !selectedVariables.independent?.length) {
      setError('Please select both dependent and independent variables');
      setResults(null);
      setResults(null);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    setResults(null);

    try {
      const X = independentFields.map(f => f.value as number[]);
      const y = dependentField.value as number[];

      let result;
      switch (regressionType) {
        case 'linear':
          result = await performLinearRegression(X, y);
          break;
        case 'multiple':
          result = await performLinearRegression(X, y);
          break;
        case 'logistic':
          result = await performLogisticRegression(X, y);
          break;
        case 'polynomial':
          result = await performPolynomialRegression(X, y, 2);
          break;
        case 'ridge':
          result = await performRidgeRegression(X, y, 1.0);
          break;
        case 'lasso':
          result = await performLassoRegression(X, y, 1.0);
          break;
        case 'elastic-net':
          result = await performElasticNetRegression(X, y, 1.0, 0.5);
          break;
        case 'stepwise':
          result = await performStepwiseRegression(X, y, 0.05);
          break;
        case 'time-series':
          result = await performTimeSeriesRegression(y, 1);
          break;
        case 'quantile':
          result = await performQuantileRegression(X, y, 0.5);
          break;
        case 'log-log':
          result = await performLogLogRegression(X, y);
          break;
        default:
          throw new Error('Invalid regression type');
      }

      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setResults(null);
      setResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <div>
          <h3 className="text-lg font-semibold">Regression Analysis</h3>
          <p className="text-sm text-gray-500">Select regression type and variables</p>
        </div>
      </div>

      {/* Variable Selection */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dependent Variable (Y)
            </label>
            <select
              value={selectedVariables.dependent || ''}
              onChange={(e) => setSelectedVariables(prev => ({
                ...prev,
                dependent: e.target.value
              }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select variable</option>
              {numericFields.map(field => (
                <option key={field.name} value={field.name}>{field.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Independent Variables (X)
            </label>
            <select
              multiple
              value={selectedVariables.independent || []}
              onChange={(e) => setSelectedVariables(prev => ({
                ...prev,
                independent: Array.from(e.target.selectedOptions, option => option.value)
              }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {numericFields
                .filter(f => f.name !== selectedVariables.dependent)
                .map(field => (
                  <option key={field.name} value={field.name}>{field.name}</option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Regression Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
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

      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !selectedVariables.dependent || !selectedVariables.independent?.length}
        className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Analyzing...
          </div>
        ) : (
          'Run Analysis'
        )}
      </button>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium mb-2">{selectedVariables.dependent}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-500">R² Score</p>
              <p className="text-lg font-semibold">
                {(results.rSquared * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-500">Standard Error</p>
              <p className="text-lg font-semibold">
                {formatNumber(results.standardError)}
              </p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-500">F-Statistic</p>
              <p className="text-lg font-semibold">
                {formatNumber(results.fStatistic)}
              </p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-500">AIC</p>
              <p className="text-lg font-semibold">
                {formatNumber(results.aic)}
              </p>
            </div>
          </div>

          {/* Regression Plot */}
          <div className="h-64 mb-4">
            <Line
              data={{
                labels: Array.from({ length: results.predictions.length }, (_, i) => i + 1),
                datasets: [
                  {
                    label: 'Actual Values',
                    data: results.actualValues,
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'transparent',
                    pointRadius: 4
                  },
                  {
                    label: 'Predicted Values',
                    data: results.predictions,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    pointRadius: 0
                  },
                  {
                    label: 'Confidence Interval',
                    data: results.confidence.upper,
                    borderColor: 'rgba(99, 102, 241, 0.2)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderDash: [2, 2],
                    pointRadius: 0,
                    fill: '+1'
                  },
                  {
                    label: 'Confidence Interval',
                    data: results.confidence.lower,
                    borderColor: 'rgba(99, 102, 241, 0.2)',
                    backgroundColor: 'transparent',
                    borderDash: [2, 2],
                    pointRadius: 0
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    text: `${regressionType.charAt(0).toUpperCase() + regressionType.slice(1)} Regression Results`
                  }
                }
              }}
            />
          </div>

          {/* Equation */}
          <div className="bg-white p-4 rounded-lg">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Regression Equation</h5>
            <code className="text-sm font-mono">{results.equation}</code>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegressionAnalysis