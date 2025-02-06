import React from 'react';
import { FileText, Database, Hash, AlignLeft } from 'lucide-react';
import type { DataField } from '@types/data';

interface AnalysisOverviewProps {
  data: {
    fields: DataField[];
  };
}

export function AnalysisOverview({ data }: AnalysisOverviewProps) {
  const numericFields = data.fields.filter(f => f.type === 'number');
  const textFields = data.fields.filter(f => f.type === 'string');
  const dateFields = data.fields.filter(f => f.type === 'date');

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <OverviewCard
        title="Total Fields"
        value={data.fields.length}
        icon={<Database className="w-5 h-5 text-indigo-600" />}
      />
      <OverviewCard
        title="Numeric Fields"
        value={numericFields.length}
        icon={<Hash className="w-5 h-5 text-green-600" />}
      />
      <OverviewCard
        title="Text Fields"
        value={textFields.length}
        icon={<AlignLeft className="w-5 h-5 text-blue-600" />}
      />
      <OverviewCard
        title="Date Fields"
        value={dateFields.length}
        icon={<FileText className="w-5 h-5 text-purple-600" />}
      />
    </div>
  );
}

interface OverviewCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

function OverviewCard({ title, value, icon }: OverviewCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}