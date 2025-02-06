import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import type { FileData } from '@/types/file';

interface Workspace {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface WorkspaceMember {
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  joined_at: string;
}

interface WorkspaceComment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  parent_id?: string;
}

interface WorkspaceVersion {
  id: string;
  version: number;
  data: FileData;
  created_by: string;
  created_at: string;
  description: string;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  members: WorkspaceMember[];
  comments: WorkspaceComment[];
  versions: WorkspaceVersion[];
  currentVersion: WorkspaceVersion | null;
  isLoading: boolean;
  error: Error | null;
  createWorkspace: (name: string, description: string, data: FileData) => Promise<void>;
  joinWorkspace: (workspaceId: string) => Promise<void>;
  addComment: (content: string, parentId?: string) => Promise<void>;
  createVersion: (data: FileData, description: string) => Promise<void>;
  switchVersion: (versionId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [comments, setComments] = useState<WorkspaceComment[]>([]);
  const [versions, setVersions] = useState<WorkspaceVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<WorkspaceVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!workspace?.id) return;

    // Subscribe to real-time updates
    const workspaceSubscription = supabase
      .channel(`workspace:${workspace.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'workspace_members'
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setMembers(prev => [...prev, payload.new as WorkspaceMember]);
        } else if (payload.eventType === 'DELETE') {
          setMembers(prev => prev.filter(m => m.user_id !== payload.old.user_id));
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workspace_comments'
      }, payload => {
        if (payload.eventType === 'INSERT') {
          setComments(prev => [...prev, payload.new as WorkspaceComment]);
        } else if (payload.eventType === 'UPDATE') {
          setComments(prev => prev.map(c => 
            c.id === payload.new.id ? payload.new as WorkspaceComment : c
          ));
        } else if (payload.eventType === 'DELETE') {
          setComments(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'workspace_versions'
      }, payload => {
        setVersions(prev => [...prev, payload.new as WorkspaceVersion]);
      })
      .subscribe();

    return () => {
      workspaceSubscription.unsubscribe();
    };
  }, [workspace?.id]);

  const createWorkspace = async (name: string, description: string, data: FileData) => {
    try {
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name,
          description,
          created_by: 'anonymous'
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: 'anonymous',
          role: 'owner'
        });

      if (memberError) throw memberError;

      // Create initial version
      const { error: versionError } = await supabase
        .from('workspace_versions')
        .insert({
          workspace_id: workspace.id,
          created_by: 'anonymous',
          data,
          version: 1,
          description: 'Initial version'
        });

      if (versionError) throw versionError;

      setWorkspace(workspace);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to create workspace'));
    }
  };

  const joinWorkspace = async (workspaceId: string) => {
    try {
      // Check if workspace exists and user isn't already a member
      const { data: existingMember, error: memberError } = await supabase
        .from('workspace_members')
        .select()
        .eq('workspace_id', workspaceId)
        .eq('user_id', 'anonymous')
        .single();

      if (memberError && memberError.code !== 'PGRST116') { // PGRST116 = not found
        throw memberError;
      }

      if (existingMember) {
        throw new Error('Already a member of this workspace');
      }

      // Join as viewer
      const { error: joinError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: 'anonymous',
          role: 'viewer'
        });

      if (joinError) throw joinError;

      // Load workspace data
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .select()
        .eq('id', workspaceId)
        .single();

      if (workspaceError) throw workspaceError;

      setWorkspace(workspace);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to join workspace'));
    }
  };

  const addComment = async (content: string, parentId?: string) => {
    try {
      if (!workspace) throw new Error('Must be in a workspace');

      const { error: commentError } = await supabase
        .from('workspace_comments')
        .insert({
          workspace_id: workspace.id,
          user_id: 'anonymous',
          content,
          parent_id: parentId
        });

      if (commentError) throw commentError;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to add comment'));
    }
  };

  const createVersion = async (data: FileData, description: string) => {
    try {
      if (!workspace) throw new Error('Must be in a workspace');

      // Get latest version number
      const { data: latestVersion, error: versionError } = await supabase
        .from('workspace_versions')
        .select('version')
        .eq('workspace_id', workspace.id)
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (versionError) throw versionError;

      const newVersion = (latestVersion?.version || 0) + 1;

      const { error: createError } = await supabase
        .from('workspace_versions')
        .insert({
          workspace_id: workspace.id,
          created_by: 'anonymous',
          data,
          version: newVersion,
          description
        });

      if (createError) throw createError;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to create version'));
    }
  };

  const switchVersion = async (versionId: string) => {
    try {
      if (!workspace) throw new Error('No active workspace');

      const { data: version, error: versionError } = await supabase
        .from('workspace_versions')
        .select()
        .eq('id', versionId)
        .single();

      if (versionError) throw versionError;

      setCurrentVersion(version);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to switch version'));
    }
  };

  return (
    <WorkspaceContext.Provider value={{
      workspace,
      members,
      comments,
      versions,
      currentVersion,
      isLoading,
      error,
      createWorkspace,
      joinWorkspace,
      addComment,
      createVersion,
      switchVersion
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}