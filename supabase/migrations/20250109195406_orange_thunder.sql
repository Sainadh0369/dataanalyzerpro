-- Drop existing policies
DROP POLICY IF EXISTS "Users can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can manage members" ON public.workspace_members;

-- Create new, optimized policies
CREATE POLICY "Users can view workspace members"
  ON public.workspace_members
  FOR SELECT
  USING (
    -- Direct access: user is the member
    user_id = auth.uid() OR
    -- Workspace owner access
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
      AND w.created_by = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can manage members"
  ON public.workspace_members
  FOR ALL
  USING (
    -- Only workspace owners can manage members
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
      AND w.created_by = auth.uid()
    )
  );

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id 
ON public.workspace_members(user_id);

CREATE INDEX IF NOT EXISTS idx_workspaces_created_by 
ON public.workspaces(created_by);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id 
ON public.workspace_members(workspace_id);