-- Drop all existing workspace member policies
DROP POLICY IF EXISTS "workspace_members_read_access" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_write_access" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_access" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete_access" ON public.workspace_members;

-- Create a single, simple policy for all operations
CREATE POLICY "workspace_members_access_policy"
  ON public.workspace_members
  FOR ALL
  USING (
    -- User can access if they are:
    user_id = auth.uid() OR -- The member themselves
    EXISTS ( -- Or the workspace owner (direct check)
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
      AND w.created_by = auth.uid()
    )
  )
  WITH CHECK (
    -- Only workspace owners can modify
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
      AND w.created_by = auth.uid()
    )
  );

-- Optimize indexes for the simplified policy
DROP INDEX IF EXISTS idx_workspace_members_user;
DROP INDEX IF EXISTS idx_workspace_members_workspace;
DROP INDEX IF EXISTS idx_workspaces_owner;

CREATE INDEX idx_workspace_members_lookup
  ON public.workspace_members(workspace_id, user_id);

CREATE INDEX idx_workspaces_owner_lookup
  ON public.workspaces(created_by);