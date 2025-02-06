import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { useWorkspace } from './WorkspaceProvider';

interface VersionHistoryProps {
  versions: Array<{
    id: string;
    version: number;
    created_by: string;
    created_at: string;
    description: string;
  }>;
  currentVersion: {
    id: string;
    version: number;
  } | null;
}

export function VersionHistory({ versions, currentVersion }: VersionHistoryProps) {
  const { switchVersion } = useWorkspace();
  const [selectedVersion, setSelectedVersion] = React.useState<string | null>(
    currentVersion?.id || null
  );

  const handleVersionSelect = async (versionId: string) => {
    try {
      await switchVersion(versionId);
      setSelectedVersion(versionId);
    } catch (error) {
      console.error('Failed to switch version:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        {versions.map((version) => (
          <button
            key={version.id}
            onClick={() => handleVersionSelect(version.id)}
            className={`w-full text-left p-4 rounded-lg border transition-colors ${
              selectedVersion === version.id
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-teal-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {selectedVersion === version.id ? (
                  <CheckCircle className="w-5 h-5 text-teal-500" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">Version {version.version}</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(version.created_at).toLocaleString()}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{version.description}</p>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Created by</span>
              <span className="text-xs font-medium text-gray-700">
                {version.created_by}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}