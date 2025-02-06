-- Drop all existing workspace member policies to start fresh
DROP POLICY IF EXISTS "workspace_members_select_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_update_policy" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_delete_policy" ON public.workspace_members;

-- Create a single, simplified policy for all operations
CREATE POLICY "workspace_members_policy"
  ON public.workspace_members
  FOR ALL
  USING (
    -- User can access if they are:
    user_id = auth.uid() OR -- The member themselves
    workspace_id IN ( -- Or the workspace owner
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    -- Only workspace owners can modify members
    workspace_id IN (
      SELECT id FROM public.workspaces
      WHERE created_by = auth.uid()
    )
  );

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_workspace_members_lookup
ON public.workspace_members(workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner_lookup
ON public.workspaces(created_by);

-- Add helper function for checking workspace ownership
CREATE OR REPLACE FUNCTION public.is_workspace_owner(workspace_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_id
    AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;