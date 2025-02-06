-- Drop existing policies
DROP POLICY IF EXISTS "Users can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;

-- Create simplified, non-recursive policies
CREATE POLICY "workspace_members_select"
  ON public.workspace_members
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_members_insert"
  ON public.workspace_members
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_members_update"
  ON public.workspace_members
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "workspace_members_delete"
  ON public.workspace_members
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

-- Optimize indexes
CREATE INDEX IF NOT EXISTS idx_workspace_members_lookup
ON public.workspace_members(workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner_lookup
ON public.workspaces(created_by);