import React from 'react';
import { Brain, Calculator, TrendingUp, MessageSquare, Clock, Map, BarChart2, Share2, BarChart, TestTube, LineChart, Bot, FileText, Timer, Globe, Briefcase, Network, Building2 } from 'lucide-react';
import { DataField } from '@/types/data';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface AnalysisCategoriesProps {
  data: {
    fields: DataField[];
  };
}

export function AnalysisCategories({ data }: AnalysisCategoriesProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category');

  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === currentCategory) {
      navigate('/analysis'); // Clear category
    } else {
      navigate(`/analysis?category=${categoryId}`);
    }
  };

  const categories = [
    {
      id: 'descriptive',
      name: 'Basic Statistics',
      icon: Calculator,
      description: 'Mean, median, mode, variance, standard deviation',
      available: data.fields.some(f => f.type === 'number')
    },
    {
      id: 'visualization',
      name: 'Visualizations',
      icon: BarChart,
      description: 'Charts, graphs, and interactive visualizations',
      available: data.fields.some(f => f.type === 'number')
    },
    {
      id: 'correlation',
      name: 'Correlation Analysis',
      icon: TrendingUp,
      description: 'Relationships between variables',
      available: data.fields.some(f => f.type === 'number')
    },
    {
      id: 'industry',
      name: 'Industry Analysis',
      icon: Building2,
      description: 'Industry-specific metrics and benchmarks',
      available: true
    },
    {
      id: 'hypothesis',
      name: 'Hypothesis Testing',
      icon: TestTube,
      description: 'Statistical significance and confidence intervals',
      available: data.fields.some(f => f.type === 'number')
    },
    {
      id: 'regression',
      name: 'Regression Analysis',
      icon: LineChart,
      description: 'Linear and multiple regression models',
      available: data.fields.some(f => f.type === 'number')
    },
    {
      id: 'ml',
      name: 'Machine Learning',
      icon: Bot,
      description: 'Predictive modeling and pattern recognition',
      available: data.fields.some(f => f.type === 'number')
    },
    {
      id: 'text',
      name: 'Text Analysis',
      icon: FileText,
      description: 'Text mining and sentiment analysis',
      available: data.fields.some(f => f.type === 'string')
    },
    {
      id: 'time',
      name: 'Time Series',
      icon: Timer,
      description: 'Temporal patterns and forecasting',
      available: data.fields.some(f => f.type === 'date')
    },
    {
      id: 'spatial',
      name: 'Spatial Analysis',
      icon: Globe,
      description: 'Geographic and location-based analysis',
      available: data.fields.some(f => f.name.toLowerCase().includes('location'))
    },
    {
      id: 'business',
      name: 'Business Metrics',
      icon: LineChart,
      description: 'KPIs, ratios, and financial analysis',
      available: data.fields.some(f => f.type === 'number')
    },
    {
      id: 'network',
      name: 'Network Analysis',
      icon: Network,
      description: 'Graph analysis and relationships',
      available: data.fields.some(f => f.name.toLowerCase().includes('id'))
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Analysis Categories</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            disabled={!category.available}
            className={`p-4 rounded-lg text-left transition-colors border relative ${
              category.available
                ? `bg-white hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer ${
                    currentCategory === category.id ? 'border-indigo-500 bg-indigo-50' : ''
                  }`
                : 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
            }`}
          >
            {currentCategory === category.id && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-indigo-500 rounded-full" />
            )}
            <div className="flex items-center gap-2 mb-2">
              <category.icon className={`w-5 h-5 ${
                category.available ? 'text-indigo-600' : 'text-gray-400'
              }`} />
              <h4 className="font-medium">{category.name}</h4>
            </div>
            <p className="text-sm text-gray-500">{category.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}