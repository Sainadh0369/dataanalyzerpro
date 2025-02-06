import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { MarketData } from '../types';

interface DataInputProps {
  data: MarketData;
  onDataChange: (data: MarketData) => void;
}

export default function DataInput({ data, onDataChange }: DataInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onDataChange({
      ...data,
      [name]: parseFloat(value),
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-indigo-600" />
        <h2 className="text-xl font-semibold">Market Data Input</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Revenue</label>
          <input
            type="number"
            name="revenue"
            value={data.revenue}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Customers</label>
          <input
            type="number"
            name="customers"
            value={data.customers}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Satisfaction (%)</label>
          <input
            type="number"
            name="satisfaction"
            value={data.satisfaction}
            onChange={handleChange}
            min="0"
            max="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Market Share (%)</label>
          <input
            type="number"
            name="marketShare"
            value={data.marketShare}
            onChange={handleChange}
            min="0"
            max="100"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Growth Rate (%)</label>
          <input
            type="number"
            name="growthRate"
            value={data.growthRate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}