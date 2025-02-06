import React from 'react';

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-auto relative">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </main>
  );
}