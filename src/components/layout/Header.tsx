import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hexagon, Bell, Settings } from 'lucide-react';
import { AlertSystem } from '../analysis/AlertSystem';

export function Header() {
  const location = useLocation();

  return (
    <header className="h-16 bg-white border-b border-gray-200">
      <div className="h-full max-w-full mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 animate-pulse bg-teal-200 rounded-full blur-xl"></div>
              <div className="relative">
                <Hexagon className="w-8 h-8 text-teal-600 transition-transform group-hover:scale-110" strokeWidth={1.5} />
                <Hexagon className="w-6 h-6 text-teal-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90" strokeWidth={1.5} />
              </div>
            </div>
            <span className="text-lg font-bold text-gray-900">DataAnalyzer Pro</span>
          </Link>
        </div>

        {/* Actions */}
        {location.pathname !== '/' && (
          <div className="flex items-center gap-4">
            <AlertSystem
              data={{ fields: [] }}
              thresholds={{
                revenue: 1000000,
                profit: 100000,
                roi: 15
              }}
            />
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}