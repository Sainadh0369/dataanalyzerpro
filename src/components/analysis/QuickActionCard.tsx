import React, { useState } from 'react';
import { Loader } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  isLoading?: boolean;
}

export function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  isLoading = false 
}: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all text-left"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 bg-teal-50 rounded-lg ${isLoading ? 'animate-pulse' : ''} transition-all`}>
          {isLoading ? (
            <Loader className="w-5 h-5 text-teal-600 animate-spin" />
          ) : (
            <Icon className="w-5 h-5 text-teal-600" />
          )}
        </div>
        <h3 className={`font-medium text-gray-900 ${isLoading ? 'opacity-50' : ''}`}>{title}</h3>
      </div>
      <p className={`text-sm text-gray-500 ${isLoading ? 'opacity-50' : ''} transition-all`}>{description}</p>
    </button>
  );
}