import React from 'react';
import { TrendingUp, Calculator, Brain, AlertCircle, ChevronDown } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { DataField } from '@/types/data';
import { formatNumber } from '@/utils/analysis/formatting';
import { 
  performLinearRegression,
  performLogisticRegression,
  performPolynomialRegression,
  performRidgeRegression,
  performLassoRegression,
  performElasticNetRegression,
  performStepwiseRegression,
  performTimeSeriesRegression,
  performQuantileRegression,
  performLogLogRegression
} from '@/utils/analysis/regression/models';

interface RegressionAnalysisViewProps {
  data: {
    fields: DataField[];
  };
}

export function RegressionAnalysisView({ data }: RegressionAnalysisViewProps) {
  const [selectedType, setSelectedType] = React.useState('linear');
  const [selectedVariables, setSelectedVariables] = React.useState<{
    dependent?: string;
    independent?: string[];
  }>({});
  const [results, setResults] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const numericFields = React.useMemo(() => 
    data.fields.filter(f => f.type === 'number'),
    [data.fields]
  );

  const regressionTypes = [
    { id: 'linear', name: 'Linear Regression', description: 'Simple linear relationship between variables' },
    { id: 'multiple', name: 'Multiple Linear', description: 'Multiple independent variables' },
    { id: 'logistic', name: 'Logistic Regression', description: 'Binary outcome prediction' },
    { id: 'polynomial', name: 'Polynomial', description: 'Non-linear relationships with polynomial terms' },
    { id: 'ridge', name: 'Ridge (L2)', description: 'Linear regression with L2 regularization' },
    { id: 'lasso', name: 'Lasso (L1)', description: 'Linear regression with L1 regularization' },
    { id: 'elastic-net', name: 'Elastic Net', description: 'Combines L1 and L2 regularization' },
    { id: 'stepwise', name: 'Stepwise', description: 'Automated variable selection' },
    { id: 'time-series', name: 'Time Series', description: 'Time-dependent data analysis' },
    { id: 'quantile', name: 'Quantile', description: 'Estimates conditional quantiles' },
    { id: 'log-log', name: 'Log-Log', description: 'Log-transformed variables analysis' }
  ];

  const handleAnalyze = async () => {
    if (!selectedVariables.dependent || !selectedVariables.independent?.length) {
      setError('Please select both dependent and independent variables');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const dependentField = numericFields.find(f => f.name === selectedVariables.dependent);
      const independentFields = selectedVariables.independent
        .map(name => numericFields.find(f => f.name === name))
        .filter((f): f is DataField => f !== undefined);

      if (!dependentField || independentFields.length === 0) {
        throw new Error('Selected fields not found');
      }

      const X = independentFields.map(f => f.value as number[]);
      const y = dependentField.value as number[];

      let result;
      switch (selectedType) {
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
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (numericFields.length < 2) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
        <p className="text-yellow-700">At least two numeric fields are required for regression analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Regression Type Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Select Regression Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regressionTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                selectedType === type.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              <h4 className="font-medium text-gray-900">{type.name}</h4>
              <p className="text-sm text-gray-500 mt-1">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Variable Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Select Variables</h3>
        <div className="space-y-4">
          {/* Dependent Variable */}
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
              <option value="">Select a variable</option>
              {numericFields.map(field => (
                <option key={field.name} value={field.name}>
                  {field.name}
                </option>
              ))}
            </select>
          </div>

          {/* Independent Variables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Independent Variable(s) (X)
            </label>
            <select
              multiple
              value={selectedVariables.independent || []}
              onChange={(e) => setSelectedVariables(prev => ({
                ...prev,
                independent: Array.from(e.target.selectedOptions, option => option.value)
              }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              size={4}
            >
              {numericFields
                .filter(f => f.name !== selectedVariables.dependent)
                .map(field => (
                  <option key={field.name} value={field.name}>
                    {field.name}
                  </option>
                ))}
            </select>
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
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Regression Results</h3>
          
          {/* Model Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-1">R² Score</h4>
              <p className="text-2xl font-semibold">
                {(results.rSquared * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Standard Error</h4>
              <p className="text-2xl font-semibold">
                {formatNumber(results.standardError)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-1">F-Statistic</h4>
              <p className="text-2xl font-semibold">
                {formatNumber(results.fStatistic)}
              </p>
            </div>
          </div>

          {/* Coefficients */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Coefficients</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variable
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coefficient
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Std Error
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        t-Statistic
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        p-Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-2 text-sm text-gray-900">Intercept</td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatNumber(results.intercept)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatNumber(results.interceptStdError)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatNumber(results.interceptTStat)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatNumber(results.interceptPValue)}
                      </td>
                    </tr>
                    {results.coefficients.map((coef: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {selectedVariables.independent?.[index]}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatNumber(coef.value)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatNumber(coef.stdError)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatNumber(coef.tStat)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatNumber(coef.pValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Regression Plot */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Regression Plot</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="h-[400px]">
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
                        label: 'Confidence Interval (Upper)',
                        data: results.confidence.upper,
                        borderColor: 'rgba(99, 102, 241, 0.2)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderDash: [2, 2],
                        pointRadius: 0,
                        fill: 1
                      },
                      {
                        label: 'Confidence Interval (Lower)',
                        data: results.confidence.lower,
                        borderColor: 'rgba(99, 102, 241, 0.2)',
                        backgroundColor: 'transparent',
                        borderDash: [2, 2],
                        pointRadius: 0,
                        fill: false
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      title: {
                        display: true,
                        text: `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Regression Results`
                      }
                    },
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: selectedVariables.dependent
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Observations'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}