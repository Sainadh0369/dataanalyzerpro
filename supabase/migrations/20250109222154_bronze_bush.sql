-- Drop all existing workspace member policies
DROP POLICY IF EXISTS "workspace_members_access_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_access" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_read_access" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_write_access" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_access" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete_access" ON public.workspace_members;

-- Create a single, ultra-simple policy for all operations
CREATE POLICY "workspace_members_unified_access"
  ON public.workspace_members
  FOR ALL
  USING (
    user_id = auth.uid() OR -- User is the member
    EXISTS ( -- User is the workspace owner
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id
      AND created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS ( -- Only workspace owners can modify
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id
      AND created_by = auth.uid()
    )
  );

-- Optimize indexes
DROP INDEX IF EXISTS idx_workspace_members_lookup;
DROP INDEX IF EXISTS idx_workspaces_owner_lookup;
DROP INDEX IF EXISTS idx_workspace_access;
DROP INDEX IF EXISTS idx_workspace_ownership;

-- Create optimized indexes
CREATE INDEX idx_workspace_members_efficient
  ON public.workspace_members(workspace_id, user_id);

CREATE INDEX idx_workspace_owners_efficient
  ON public.workspaces(created_by);