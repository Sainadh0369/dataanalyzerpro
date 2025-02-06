-- Drop all existing workspace member policies
DROP POLICY IF EXISTS "members_view_policy_v1" ON public.workspace_members;
DROP POLICY IF EXISTS "members_modify_policy_v1" ON public.workspace_members;

-- Create final, optimized policies
CREATE POLICY "workspace_member_access_v2"
  ON public.workspace_members
  FOR ALL
  USING (
    user_id = auth.uid() OR -- User is the member
    EXISTS ( -- User is the workspace owner
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
      AND w.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS ( -- Only workspace owners can modify
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
      AND w.created_by = auth.uid()
    )
  );

-- Drop existing indexes
DROP INDEX IF EXISTS idx_members_access_v1_20250109;
DROP INDEX IF EXISTS idx_workspace_owner_v1_20250109;

-- Create optimized indexes
CREATE INDEX idx_member_access_v2_20250109
  ON public.workspace_members(workspace_id, user_id);

CREATE INDEX idx_workspace_owner_v2_20250109
  ON public.workspaces(created_by);