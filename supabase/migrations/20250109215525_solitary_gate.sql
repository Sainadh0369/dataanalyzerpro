-- Create integrations table
CREATE TABLE public.integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  provider text NOT NULL,
  name text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}',
  credentials jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'disconnected',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create integration_logs table for tracking activity
CREATE TABLE public.integration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES public.integrations ON DELETE CASCADE,
  event_type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for integrations
CREATE POLICY "users_can_view_workspace_integrations"
  ON public.integrations
  FOR SELECT
  USING (
    -- User can view if they are:
    user_id = auth.uid() OR -- The integration owner
    EXISTS ( -- Or a member of the workspace
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = integrations.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "users_can_manage_own_integrations"
  ON public.integrations
  FOR ALL
  USING (
    user_id = auth.uid() OR -- Integration owner
    EXISTS ( -- Or workspace owner
      SELECT 1 FROM public.workspaces
      WHERE id = workspace_id
      AND created_by = auth.uid()
    )
  );

-- Create policies for integration logs
CREATE POLICY "users_can_view_integration_logs"
  ON public.integration_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.integrations
      WHERE id = integration_id
      AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.workspace_members
          WHERE workspace_id = integrations.workspace_id
          AND user_id = auth.uid()
        )
      )
    )
  );

-- Add indexes for performance
CREATE INDEX idx_integrations_workspace_user 
ON public.integrations(workspace_id, user_id);

CREATE INDEX idx_integration_logs_integration 
ON public.integration_logs(integration_id);

-- Add update trigger for integrations
CREATE OR REPLACE FUNCTION public.handle_integration_update()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER integration_update_timestamp
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_integration_update();