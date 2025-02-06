import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useWorkspace } from '@/components/workspace/WorkspaceProvider';
import { WorkspaceView } from '@/components/workspace/WorkspaceView';

export function Workspaces() {
  const location = useLocation();
  const { workspace } = useWorkspace();
  const isRoot = location.pathname === '/workspaces';

  if (!isRoot) {
    return <Outlet />;
  }

  if (workspace) {
    return <WorkspaceView />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Workspaces</h1>
      <p className="text-gray-600">Select a workspace to get started.</p>
    </div>
  );
}