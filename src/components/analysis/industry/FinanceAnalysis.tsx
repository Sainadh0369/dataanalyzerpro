import React from 'react';
import { Activity, Server, Cpu, AlertTriangle, Shield } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { DataField } from '@/types/data';
import { FinanceAnalyzer } from '@/utils/analysis/industry/finance';

interface FinanceAnalysisProps {
  data: {
    fields: DataField[];
  };
}

export function FinanceAnalysis({ data }: FinanceAnalysisProps) {
  const fraudResults = React.useMemo(() => 
    FinanceAnalyzer.detectFraud(data.fields),
    [data.fields]
  );

  const riskAnalysis = React.useMemo(() =>
    FinanceAnalyzer.analyzeRisk(data.fields),
    [data.fields]
  );

  return (
    <div className="space-y-8">
      {/* Fraud Detection */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold">Fraud Detection</h3>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Flagged Transactions</h4>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">{fraudResults.summary.totalFlagged}</span>
              <span className="text-sm text-gray-500 mb-1">transactions</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">High Risk</h4>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-red-600">
                {fraudResults.summary.riskDistribution.high}
              </span>
              <span className="text-sm text-gray-500 mb-1">cases</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Common Patterns</h4>
            <div className="space-y-1">
              {fraudResults.summary.commonPatterns.map((pattern, index) => (
                <div key={index} className="text-sm text-gray-600">{pattern}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Flagged Transactions */}
        <div className="space-y-4">
          {fraudResults.transactions.map((transaction, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                transaction.riskScore > 0.7
                  ? 'border-red-200 bg-red-50'
                  : transaction.riskScore > 0.4
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${
                    transaction.riskScore > 0.7
                      ? 'text-red-500'
                      : transaction.riskScore > 0.4
                      ? 'text-yellow-500'
                      : 'text-gray-500'
                  }`} />
                  <span className="font-medium text-gray-900">
                    Transaction {transaction.id}
                  </span>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  transaction.riskScore > 0.7
                    ? 'bg-red-100 text-red-700'
                    : transaction.riskScore > 0.4
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  Risk Score: {(transaction.riskScore * 100).toFixed(0)}%
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {transaction.flags.map((flag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-600"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Confidence:</span>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                    <div
                      className="h-1.5 bg-teal-600 rounded-full"
                      style={{ width: `${transaction.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {(transaction.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold">Risk Analysis</h3>
        </div>

        {/* Overall Risk Score */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">Overall Risk Score</h4>
            <span className={`text-lg font-bold ${
              riskAnalysis.overallRisk > 0.7 ? 'text-red-600' :
              riskAnalysis.overallRisk > 0.4 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {(riskAnalysis.overallRisk * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                riskAnalysis.overallRisk > 0.7 ? 'bg-red-600' :
                riskAnalysis.overallRisk > 0.4 ? 'bg-yellow-500' :
                'bg-green-600'
              }`}
              style={{ width: `${riskAnalysis.overallRisk * 100}%` }}
            />
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Volatility</h4>
            <div className="text-2xl font-bold">
              {(riskAnalysis.metrics.volatility * 100).toFixed(1)}%
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Sharpe Ratio</h4>
            <div className="text-2xl font-bold">
              {riskAnalysis.metrics.sharpeRatio.toFixed(2)}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Max Drawdown</h4>
            <div className="text-2xl font-bold">
              {(riskAnalysis.metrics.maxDrawdown * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Risk Factors</h4>
          <div className="space-y-4">
            {riskAnalysis.factors.map((factor, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">{factor.name}</h5>
                  <span className={`text-sm font-medium ${
                    factor.trend === 'increasing' ? 'text-red-600' :
                    factor.trend === 'decreasing' ? 'text-green-600' :
                    'text-gray-600'
                  }`}>
                    {factor.trend.charAt(0).toUpperCase() + factor.trend.slice(1)}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Impact</span>
                    <span className="text-sm font-medium">
                      {(Math.abs(factor.impact) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full"
                      style={{ width: `${Math.abs(factor.impact) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  {factor.recommendations.map((rec, i) => (
                    <p key={i} className="text-sm text-gray-600">• {rec}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}