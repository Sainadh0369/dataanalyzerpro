import React from 'react';
import { Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { DataField } from '@/types/data';
import { RetailAnalyzer } from '@/utils/analysis/industry/retail';

interface RetailAnalysisProps {
  data: {
    fields: DataField[];
  };
}

export function RetailAnalysis({ data }: RetailAnalysisProps) {
  const inventory = React.useMemo(() => 
    RetailAnalyzer.analyzeInventory(data.fields),
    [data.fields]
  );

  const salesTrends = React.useMemo(() =>
    RetailAnalyzer.analyzeSalesTrends(data.fields),
    [data.fields]
  );

  return (
    <div className="space-y-8">
      {/* Inventory Management */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Package className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold">Inventory Management</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Turnover Rate</h4>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold">
                {inventory.turnoverRate.toFixed(2)}x
              </span>
              <span className="text-sm text-gray-500 mb-1">per period</span>
            </div>
          </div>
        </div>

        {/* Stockout Risk */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Stockout Risk Analysis</h4>
          <div className="grid gap-4">
            {inventory.stockoutRisk.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  item.risk === 'high'
                    ? 'border-red-200 bg-red-50'
                    : item.risk === 'medium'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-green-200 bg-green-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{item.product}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.risk === 'high'
                      ? 'bg-red-100 text-red-700'
                      : item.risk === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {item.risk.toUpperCase()} RISK
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {item.daysUntilStockout} days until potential stockout
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Optimal Restock Levels */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Recommended Stock Levels</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Minimum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Optimal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maximum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.optimalRestockLevels.map((level, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {level.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {level.minimum}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {level.optimal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {level.maximum}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sales Trends */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold">Sales Trends</h3>
        </div>

        <div className="grid gap-6">
          {salesTrends.map((trend, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">{trend.product}</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    trend.trend === 'up' ? 'text-green-600' :
                    trend.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {trend.growthRate > 0 ? '+' : ''}{trend.growthRate.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Sales Forecast Chart */}
              <div className="h-48 mb-4">
                <Line
                  data={{
                    labels: Array.from({ length: trend.forecast.length }, (_, i) => 
                      `Period ${i + 1}`
                    ),
                    datasets: [{
                      label: 'Forecast',
                      data: trend.forecast,
                      borderColor: 'rgb(13, 148, 136)',
                      backgroundColor: 'rgba(13, 148, 136, 0.1)',
                      fill: true,
                      tension: 0.4
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: false
                      }
                    }
                  }}
                />
              </div>

              {trend.seasonality && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    Seasonal pattern detected (period: {trend.seasonality})
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}