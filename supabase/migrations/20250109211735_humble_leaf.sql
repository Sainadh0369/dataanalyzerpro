-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_select" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete" ON public.workspace_members;

-- Create new, optimized policies without recursion
CREATE POLICY "workspace_members_read"
  ON public.workspace_members
  FOR SELECT
  USING (
    -- User is either:
    user_id = auth.uid() OR -- The member themselves
    workspace_id IN ( -- Or the workspace owner
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_members_insert"
  ON public.workspace_members
  FOR INSERT
  WITH CHECK (
    -- Only workspace owners can add members
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_members_update"
  ON public.workspace_members
  FOR UPDATE
  USING (
    -- Only workspace owners can update members
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_members_delete"
  ON public.workspace_members
  FOR DELETE
  USING (
    -- Only workspace owners can remove members
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_workspace 
ON public.workspace_members(user_id, workspace_id);

CREATE INDEX IF NOT EXISTS idx_workspaces_created_by 
ON public.workspaces(created_by);

-- Add helper function to check workspace ownership
CREATE OR REPLACE FUNCTION public.is_workspace_owner(workspace_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_id
    AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;