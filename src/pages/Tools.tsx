import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Brain, Plug, Settings, ChevronRight } from 'lucide-react';

const tools = [
  {
    name: 'Custom Models',
    description: 'Create and manage custom AI models',
    icon: Brain,
    href: '/tools/models'
  },
  {
    name: 'Integrations',
    description: 'Connect with external services and tools',
    icon: Plug,
    href: '/tools/integrations'
  },
  {
    name: 'Settings',
    description: 'Configure analysis preferences and defaults',
    icon: Settings,
    href: '/tools/settings'
  }
];

export function Tools() {
  const location = useLocation();
  const isRoot = location.pathname === '/tools';

  if (!isRoot) {
    return <Outlet />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tools & Settings</h1>
      
      <div className="grid gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.name}
            to={tool.href}
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-50 rounded-lg">
                  <tool.icon className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {tool.name}
                  </h2>
                  <p className="text-gray-500">{tool.description}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}