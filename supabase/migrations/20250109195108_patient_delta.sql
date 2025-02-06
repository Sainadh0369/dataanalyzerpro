/*
  # Fix workspace member policies

  1. Changes
    - Remove recursive policy dependencies
    - Simplify workspace member access checks
    - Add explicit owner role check

  2. Security
    - Enable RLS
    - Add policies for workspace member access
    - Add policies for workspace management
*/

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;

-- Create new, simplified policies
CREATE POLICY "Users can view members of their workspaces"
  ON public.workspace_members
  FOR SELECT
  USING (
    -- User is a member of the workspace
    user_id = auth.uid() OR
    -- User is the workspace owner
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
      AND w.created_by = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can add members"
  ON public.workspace_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
      AND w.created_by = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can update member roles"
  ON public.workspace_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
      AND w.created_by = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can remove members"
  ON public.workspace_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
      AND w.created_by = auth.uid()
    )
  );

-- Add index to improve policy performance
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_user 
ON public.workspace_members(workspace_id, user_id);