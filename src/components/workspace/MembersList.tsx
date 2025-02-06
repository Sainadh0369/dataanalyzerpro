import React from 'react';
import { UserPlus, Crown, Edit2, Eye } from 'lucide-react';
import { useWorkspace } from './WorkspaceProvider';
import { supabase } from '@/utils/supabase/client';

interface MembersListProps {
  members: Array<{
    user_id: string;
    role: 'owner' | 'editor' | 'viewer';
    joined_at: string;
  }>;
}

export function MembersList({ members }: MembersListProps) {
  const { workspace } = useWorkspace();
  const [isInviting, setIsInviting] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<'editor' | 'viewer'>('viewer');
  const [error, setError] = React.useState<string | null>(null);

  const isOwner = members.some(m => 
    m.user_id === 'anonymous' && m.role === 'owner'
  );

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;

    try {
      setError(null);

      // Check if user exists
      const { data: invitedUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        throw new Error('User not found');
      }

      // Add user to workspace
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: invitedUser.id,
          role
        });

      if (memberError) throw memberError;

      setEmail('');
      setIsInviting(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to invite user');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor':
        return <Edit2 className="w-4 h-4 text-blue-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-4">
      {isOwner && (
        <button
          onClick={() => setIsInviting(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      )}

      {isInviting && (
        <form onSubmit={handleInvite} className="mb-6 bg-gray-50 p-4 rounded-lg">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsInviting(false)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Send Invite
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.user_id}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                {getRoleIcon(member.role)}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {member.user_id === user?.id ? 'You' : member.user_id}
                </p>
                <p className="text-sm text-gray-500">
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Joined {new Date(member.joined_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}