import React from 'react';

interface DataCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
}

export function DataCard({ icon, title, value }: DataCardProps) {
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