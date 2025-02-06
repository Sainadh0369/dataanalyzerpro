-- Drop all existing problematic policies
DROP POLICY IF EXISTS "workspace_member_select" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_member_insert" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_member_update" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_member_delete" ON public.workspace_members;

-- Create new, simplified non-recursive policies
CREATE POLICY "workspace_member_access"
  ON public.workspace_members
  FOR ALL
  USING (
    -- Direct access check without recursion
    user_id = auth.uid() OR
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    -- Only workspace owners can modify
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

-- Optimize indexes
DROP INDEX IF EXISTS idx_workspace_member_lookup_v3;
DROP INDEX IF EXISTS idx_workspace_owner_lookup_v3;

CREATE INDEX idx_workspace_member_lookup_v4
  ON public.workspace_members(workspace_id, user_id);

CREATE INDEX idx_workspace_owner_lookup_v4
  ON public.workspaces(created_by);