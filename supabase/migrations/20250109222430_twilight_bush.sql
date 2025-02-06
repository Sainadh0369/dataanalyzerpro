-- Drop all existing workspace member policies
DROP POLICY IF EXISTS "workspace_members_unified_access" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_access" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_select" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_read" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_write" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_modify" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_remove" ON public.workspace_members;

-- Create a single, simple policy for read access
CREATE POLICY "members_read_policy"
  ON public.workspace_members
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
      AND w.created_by = auth.uid()
    )
  );

-- Create a single, simple policy for write operations
CREATE POLICY "members_write_policy"
  ON public.workspace_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
      AND w.created_by = auth.uid()
    )
  );

-- Drop existing indexes to avoid conflicts
DROP INDEX IF EXISTS idx_workspace_members_efficient;
DROP INDEX IF EXISTS idx_workspace_owners_efficient;
DROP INDEX IF EXISTS idx_workspace_members_lookup;
DROP INDEX IF EXISTS idx_workspaces_owner_lookup;
DROP INDEX IF EXISTS idx_workspace_access;
DROP INDEX IF EXISTS idx_workspace_ownership;
DROP INDEX IF EXISTS idx_workspace_members_user_id;
DROP INDEX IF EXISTS idx_workspace_members_workspace_id;
DROP INDEX IF EXISTS idx_workspaces_created_by;
DROP INDEX IF EXISTS idx_workspace_members_access;
DROP INDEX IF EXISTS idx_workspace_ownership_lookup;
DROP INDEX IF EXISTS idx_wm_access_20250109;
DROP INDEX IF EXISTS idx_ws_owner_20250109;

-- Create new indexes with unique names
CREATE INDEX idx_members_access_20250109_v2
  ON public.workspace_members(workspace_id, user_id);

CREATE INDEX idx_workspace_owner_20250109_v2
  ON public.workspaces(created_by);