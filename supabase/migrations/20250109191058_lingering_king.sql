/*
  # Custom AI Models Support

  1. New Tables
    - `ai_models` - Stores custom model metadata and configurations
    - `model_versions` - Handles versioning for models
    - `model_deployments` - Tracks active model deployments

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Granular access policies for model management
    - Secure model storage and deployment

  3. Features
    - Model versioning
    - Deployment tracking
    - Access control
*/

-- Create ai_models table
CREATE TABLE public.ai_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  model_type text NOT NULL,
  framework text NOT NULL,
  input_schema jsonb NOT NULL,
  output_schema jsonb NOT NULL,
  created_by uuid REFERENCES auth.users NOT NULL,
  workspace_id uuid REFERENCES public.workspaces ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Create model_versions table
CREATE TABLE public.model_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES public.ai_models ON DELETE CASCADE,
  version integer NOT NULL,
  file_key text NOT NULL,
  file_size bigint NOT NULL,
  checksum text NOT NULL,
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  metrics jsonb DEFAULT '{}',
  training_data jsonb DEFAULT '{}',
  UNIQUE (model_id, version)
);

-- Create model_deployments table
CREATE TABLE public.model_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid REFERENCES public.ai_models ON DELETE CASCADE,
  version_id uuid REFERENCES public.model_versions ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'active', 'failed', 'stopped')),
  endpoint_url text,
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  config jsonb DEFAULT '{}',
  metrics jsonb DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_deployments ENABLE ROW LEVEL SECURITY;

-- AI Models Policies
CREATE POLICY "Users can view models they have access to"
  ON public.ai_models
  FOR SELECT
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = ai_models.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create models in their workspaces"
  ON public.ai_models
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = ai_models.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Model owners can update their models"
  ON public.ai_models
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Model Versions Policies
CREATE POLICY "Users can view model versions they have access to"
  ON public.model_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_models
      WHERE id = model_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.workspace_members
          WHERE workspace_id = ai_models.workspace_id
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create versions of their models"
  ON public.model_versions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_models
      WHERE id = model_id AND created_by = auth.uid()
    )
  );

-- Model Deployments Policies
CREATE POLICY "Users can view model deployments"
  ON public.model_deployments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_models
      WHERE id = model_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.workspace_members
          WHERE workspace_id = ai_models.workspace_id
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage their model deployments"
  ON public.model_deployments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_models
      WHERE id = model_id AND created_by = auth.uid()
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION public.handle_model_update()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER model_update_timestamp
  BEFORE UPDATE ON public.ai_models
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_model_update();

CREATE TRIGGER deployment_update_timestamp
  BEFORE UPDATE ON public.model_deployments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_model_update();