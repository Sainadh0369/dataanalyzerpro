/*
  # Secure Dataset Storage System

  1. New Tables
    - `datasets` - Stores dataset metadata and encryption details
    - `dataset_shares` - Manages dataset access permissions
    - `dataset_versions` - Handles version control for datasets

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Granular access policies for different user roles
    - Secure sharing mechanism with expiration support

  3. Features
    - End-to-end encryption support
    - Version control
    - Access control
    - Workspace integration
*/

-- Create datasets table for secure storage
CREATE TABLE public.datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  file_key text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users NOT NULL,
  workspace_id uuid REFERENCES public.workspaces ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  encryption_key text NOT NULL,
  encryption_iv text NOT NULL
);

-- Create dataset_shares table for managing access
CREATE TABLE public.dataset_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid REFERENCES public.datasets ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  access_level text NOT NULL CHECK (access_level IN ('read', 'write')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  UNIQUE (dataset_id, user_id)
);

-- Create dataset_versions table for version control
CREATE TABLE public.dataset_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id uuid REFERENCES public.datasets ON DELETE CASCADE,
  version integer NOT NULL,
  file_key text NOT NULL,
  file_size bigint NOT NULL,
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  description text,
  encryption_key text NOT NULL,
  encryption_iv text NOT NULL,
  UNIQUE (dataset_id, version)
);

-- Enable RLS
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_versions ENABLE ROW LEVEL SECURITY;

-- Dataset Policies
CREATE POLICY "Users can view datasets they have access to"
  ON public.datasets
  FOR SELECT
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.dataset_shares
      WHERE dataset_id = id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = datasets.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create datasets in their workspaces"
  ON public.datasets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = datasets.workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "Dataset owners can update their datasets"
  ON public.datasets
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Dataset Shares Policies
CREATE POLICY "Users can view their dataset shares"
  ON public.dataset_shares
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.datasets
      WHERE id = dataset_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Dataset owners can manage shares"
  ON public.dataset_shares
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.datasets
      WHERE id = dataset_id AND created_by = auth.uid()
    )
  );

-- Dataset Versions Policies
CREATE POLICY "Users can view dataset versions they have access to"
  ON public.dataset_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.datasets
      WHERE id = dataset_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.dataset_shares
          WHERE dataset_id = datasets.id AND user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.workspace_members
          WHERE workspace_id = datasets.workspace_id
          AND user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create versions of datasets they own"
  ON public.dataset_versions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.datasets
      WHERE id = dataset_id AND created_by = auth.uid()
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION public.handle_dataset_update()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER dataset_update_timestamp
  BEFORE UPDATE ON public.datasets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_dataset_update();