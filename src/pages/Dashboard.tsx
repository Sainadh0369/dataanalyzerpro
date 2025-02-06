import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hexagon, Brain, BarChart2, FileText, PlayCircle, 
  LineChart, Settings2, Share2, Database, MessageSquare 
} from 'lucide-react';
import { FileUpload } from '@/components/file';
import { useFileUpload } from '@/hooks/useFileUpload';

export function Dashboard() {
  const navigate = useNavigate();
  const { handleFileUpload, isUploading, error } = useFileUpload(() => {
    navigate('/analysis');
  });

  const features = [
    {
      title: 'Data Analysis',
      description: 'Analyze your data with AI-powered insights',
      icon: Brain,
      color: 'teal',
      path: '/analysis/new'
    },
    {
      title: 'Visualizations',
      description: 'Create interactive charts and dashboards',
      icon: BarChart2,
      color: 'indigo',
      path: '/analysis/visualizations'
    },
    {
      title: 'Reports',
      description: 'Generate comprehensive analysis reports',
      icon: FileText,
      color: 'blue',
      path: '/analysis/reports'
    },
    {
      title: 'Simulations',
      description: 'Run predictive simulations and scenarios',
      icon: PlayCircle,
      color: 'purple',
      path: '/analysis/simulations'
    },
    {
      title: 'Trends',
      description: 'Track patterns and predict future trends',
      icon: LineChart,
      color: 'green',
      path: '/analysis/trends'
    },
    {
      title: 'Workspaces',
      description: 'Organize and share your analyses',
      icon: Database,
      color: 'orange',
      path: '/workspaces'
    },
    {
      title: 'Collaboration',
      description: 'Work together with your team',
      icon: Share2,
      color: 'pink',
      path: '/team'
    },
    {
      title: 'Settings',
      description: 'Configure analysis preferences',
      icon: Settings2,
      color: 'gray',
      path: '/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse bg-teal-200 rounded-full blur-2xl opacity-75"></div>
              <div className="relative group">
                <Hexagon className="w-16 h-16 text-teal-600 transition-transform group-hover:scale-110" strokeWidth={1.5} />
                <Hexagon className="w-12 h-12 text-teal-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90" strokeWidth={1.5} />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            DataAnalyzer Pro
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Transform your data into actionable insights with AI-powered analytics
          </p>
          
          {/* File Upload */}
          <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-12">
            <FileUpload
              onFileSelect={handleFileUpload}
              isProcessing={isUploading}
              error={error}
            />
          </div>
          
          {/* Features Grid */}
          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <button
                  key={feature.title}
                  onClick={() => navigate(feature.path)}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-left group border border-gray-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-${feature.color}-50 text-${feature.color}-600 transition-colors group-hover:bg-${feature.color}-100`}>
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </button>
              ))}
            </div>
            
            {/* Quick Links */}
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                onClick={() => navigate('/help')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Documentation
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={() => navigate('/tutorials')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Tutorials
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={() => navigate('/support')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Support
              </button>
            </div>
                </div>
        </div>
      </div>
    </div>
  );
}