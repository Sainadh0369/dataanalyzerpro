-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can add members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can update member roles" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace owners can remove members" ON public.workspace_members;

-- Create new, simplified policies
CREATE POLICY "Users can view workspace members"
  ON public.workspace_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
      AND (
        -- User is the workspace owner
        w.created_by = auth.uid() OR
        -- User is a member of the workspace
        EXISTS (
          SELECT 1 FROM public.workspace_members m2
          WHERE m2.workspace_id = w.id
          AND m2.user_id = auth.uid()
          AND m2.role IN ('owner', 'editor', 'viewer')
        )
      )
    )
  );

CREATE POLICY "Workspace owners can manage members"
  ON public.workspace_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspaces w
      WHERE w.id = workspace_id
      AND w.created_by = auth.uid()
    )
  );

-- Add index to improve policy performance
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_user 
ON public.workspace_members(workspace_id, user_id);

-- Add index for workspace ownership lookups
CREATE INDEX IF NOT EXISTS idx_workspaces_created_by
ON public.workspaces(created_by);