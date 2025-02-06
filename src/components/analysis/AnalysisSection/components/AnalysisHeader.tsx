import React from 'react';
import { Calculator } from 'lucide-react';

interface AnalysisHeaderProps {
  title: string;
  icon?: React.ReactNode;
}

export function AnalysisHeader({ 
  title, 
  icon = <Calculator className="w-5 h-5 text-indigo-600" />
}: AnalysisHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {icon}
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  );
}