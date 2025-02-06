-- Drop all existing workspace member policies and related objects
DROP POLICY IF EXISTS "workspace_members_access" ON public.workspace_members;
DROP MATERIALIZED VIEW IF EXISTS workspace_access_cache;
DROP TRIGGER IF EXISTS refresh_workspace_access_on_workspace_change ON public.workspaces;
DROP TRIGGER IF EXISTS refresh_workspace_access_on_member_change ON public.workspace_members;
DROP FUNCTION IF EXISTS refresh_workspace_access_cache();

-- Create new, simplified policy without recursion or complex joins
CREATE POLICY "workspace_members_read_access"
  ON public.workspace_members
  FOR SELECT
  USING (
    user_id = auth.uid() OR -- User is the member
    EXISTS ( -- User is the workspace owner
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_members_write_access"
  ON public.workspace_members
  FOR INSERT
  WITH CHECK (
    EXISTS ( -- Only workspace owners can add members
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_members_update_access"
  ON public.workspace_members
  FOR UPDATE
  USING (
    EXISTS ( -- Only workspace owners can update members
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_members_delete_access"
  ON public.workspace_members
  FOR DELETE
  USING (
    EXISTS ( -- Only workspace owners can delete members
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id
      AND created_by = auth.uid()
    )
  );

-- Optimize indexes
DROP INDEX IF EXISTS idx_workspace_members_composite;
DROP INDEX IF EXISTS idx_workspaces_owner;

CREATE INDEX IF NOT EXISTS idx_workspace_members_user
  ON public.workspace_members(user_id);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace
  ON public.workspace_members(workspace_id);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner
  ON public.workspaces(created_by);