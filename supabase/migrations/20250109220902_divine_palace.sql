-- Drop all existing workspace member policies
DROP POLICY IF EXISTS "workspace_members_policy" ON public.workspace_members;

-- Create new, simplified policies without recursion
CREATE POLICY "workspace_members_access"
  ON public.workspace_members
  FOR ALL
  USING (
    -- User can access if they are:
    user_id = auth.uid() OR -- The member themselves
    EXISTS ( -- Or the workspace owner
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_members.workspace_id
      AND created_by = auth.uid()
    )
  )
  WITH CHECK (
    -- Only workspace owners can modify
    EXISTS (
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_members.workspace_id
      AND created_by = auth.uid()
    )
  );

-- Ensure indexes exist for performance
DROP INDEX IF EXISTS idx_workspace_members_lookup;
DROP INDEX IF EXISTS idx_workspaces_owner_lookup;

CREATE INDEX IF NOT EXISTS idx_workspace_members_composite 
ON public.workspace_members(workspace_id, user_id);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner 
ON public.workspaces(created_by);

-- Add materialized view for faster access checks
CREATE MATERIALIZED VIEW IF NOT EXISTS workspace_access_cache AS
SELECT DISTINCT
  w.id as workspace_id,
  w.created_by as owner_id,
  m.user_id as member_id
FROM public.workspaces w
LEFT JOIN public.workspace_members m ON m.workspace_id = w.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_access_cache
ON workspace_access_cache(workspace_id, owner_id, member_id);

-- Function to refresh the cache
CREATE OR REPLACE FUNCTION refresh_workspace_access_cache()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY workspace_access_cache;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to keep cache updated
CREATE TRIGGER refresh_workspace_access_on_workspace_change
  AFTER INSERT OR UPDATE OR DELETE ON public.workspaces
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_workspace_access_cache();

CREATE TRIGGER refresh_workspace_access_on_member_change
  AFTER INSERT OR UPDATE OR DELETE ON public.workspace_members
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_workspace_access_cache();