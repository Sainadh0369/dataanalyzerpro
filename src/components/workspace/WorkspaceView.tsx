import React from 'react';
import { Users, MessageSquare, History, Share2 } from 'lucide-react';
import { useWorkspace } from './WorkspaceProvider';
import { MembersList } from './MembersList';
import { CommentThread } from './CommentThread';
import { VersionHistory } from './VersionHistory';
import { ShareDialog } from './ShareDialog';

export function WorkspaceView() {
  const { 
    workspace,
    members,
    comments,
    versions,
    currentVersion,
    isLoading,
    error
  } = useWorkspace();
  const [activeTab, setActiveTab] = React.useState<'members' | 'comments' | 'versions'>('members');
  const [isShareOpen, setIsShareOpen] = React.useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error.message}
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No workspace selected</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
              <p className="text-gray-500">{workspace.description}</p>
            </div>
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Version Info */}
          {currentVersion && (
            <div className="bg-white p-4 rounded-lg mb-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current Version</p>
                  <p className="font-medium">v{currentVersion.version}</p>
                </div>
                <p className="text-sm text-gray-500">
                  Last updated {new Date(currentVersion.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Analysis Content */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            {/* Your existing analysis components go here */}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l border-gray-200 bg-white shadow-sm">
        <div className="h-full flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'members'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Members ({members.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'comments'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments ({comments.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'versions'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <History className="w-4 h-4" />
                History
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'members' && <MembersList members={members} />}
            {activeTab === 'comments' && <CommentThread comments={comments} />}
            {activeTab === 'versions' && (
              <VersionHistory
                versions={versions}
                currentVersion={currentVersion}
              />
            )}
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        workspaceId={workspace.id}
      />
    </div>
  );
}