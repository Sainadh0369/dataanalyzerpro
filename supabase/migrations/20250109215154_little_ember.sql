-- Drop existing problematic policies
DROP POLICY IF EXISTS "workspace_members_select" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete" ON public.workspace_members;

-- Create new simplified policies without recursion
CREATE POLICY "workspace_members_select_policy"
  ON public.workspace_members
  FOR SELECT
  USING (
    -- User can see members if they are:
    user_id = auth.uid() OR -- The member themselves
    EXISTS ( -- Or the workspace owner
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_members_insert_policy"
  ON public.workspace_members
  FOR INSERT
  WITH CHECK (
    -- Only workspace owners can add members
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_members_update_policy"
  ON public.workspace_members
  FOR UPDATE
  USING (
    -- Only workspace owners can update members
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_members_delete_policy"
  ON public.workspace_members
  FOR DELETE
  USING (
    -- Only workspace owners can delete members
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id
      AND created_by = auth.uid()
    )
  );

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_workspace 
ON public.workspace_members(user_id, workspace_id);

CREATE INDEX IF NOT EXISTS idx_workspaces_created_by 
ON public.workspaces(created_by);