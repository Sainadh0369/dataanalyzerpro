-- Drop existing problematic policies
DROP POLICY IF EXISTS "workspace_member_access_v2" ON public.workspace_members;

-- Create simplified, non-recursive policies
CREATE POLICY "workspace_member_select"
  ON public.workspace_members
  FOR SELECT
  USING (
    -- User can view if they are:
    user_id = auth.uid() OR -- The member themselves
    workspace_id IN ( -- Or the workspace owner
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_member_insert"
  ON public.workspace_members
  FOR INSERT
  WITH CHECK (
    -- Only workspace owners can add members
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_member_update"
  ON public.workspace_members
  FOR UPDATE
  USING (
    -- Only workspace owners can update members
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_member_delete"
  ON public.workspace_members
  FOR DELETE
  USING (
    -- Only workspace owners can delete members
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

-- Drop existing indexes
DROP INDEX IF EXISTS idx_member_access_v2_20250109;
DROP INDEX IF EXISTS idx_workspace_owner_v2_20250109;

-- Create optimized indexes
CREATE INDEX idx_workspace_member_lookup_v3
  ON public.workspace_members(workspace_id, user_id);

CREATE INDEX idx_workspace_owner_lookup_v3
  ON public.workspaces(created_by);