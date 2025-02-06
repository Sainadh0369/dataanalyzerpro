/*
  # Add Collaboration Features

  1. New Tables
    - `workspaces`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_by` (uuid, references users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `workspace_members`
      - `workspace_id` (uuid, references workspaces)
      - `user_id` (uuid, references users)
      - `role` (text)
      - `joined_at` (timestamptz)
    
    - `workspace_comments`
      - `id` (uuid, primary key)
      - `workspace_id` (uuid, references workspaces)
      - `user_id` (uuid, references users)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `parent_id` (uuid, self-reference for comment threads)
    
    - `workspace_versions`
      - `id` (uuid, primary key)
      - `workspace_id` (uuid, references workspaces)
      - `created_by` (uuid, references users)
      - `data` (jsonb)
      - `version` (integer)
      - `created_at` (timestamptz)
      - `description` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for workspace access and collaboration
*/

-- Create workspaces table
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workspace_members table
CREATE TABLE public.workspace_members (
  workspace_id uuid REFERENCES public.workspaces ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Create workspace_comments table
CREATE TABLE public.workspace_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  parent_id uuid REFERENCES public.workspace_comments(id) ON DELETE CASCADE
);

-- Create workspace_versions table
CREATE TABLE public.workspace_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES public.workspaces ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users NOT NULL,
  data jsonb NOT NULL,
  version integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  description text,
  UNIQUE (workspace_id, version)
);

-- Enable Row Level Security
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_versions ENABLE ROW LEVEL SECURITY;

-- Workspace Policies
CREATE POLICY "Users can view workspaces they are members of"
  ON public.workspaces
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces"
  ON public.workspaces
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Workspace owners can update workspace details"
  ON public.workspaces
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Workspace Members Policies
CREATE POLICY "Users can view workspace members"
  ON public.workspace_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members AS m
      WHERE m.workspace_id = workspace_id
      AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can manage members"
  ON public.workspace_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_id
      AND user_id = auth.uid()
      AND role = 'owner'
    )
  );

-- Comments Policies
CREATE POLICY "Users can view workspace comments"
  ON public.workspace_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create comments"
  ON public.workspace_comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments"
  ON public.workspace_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Versions Policies
CREATE POLICY "Users can view workspace versions"
  ON public.workspace_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Editors can create versions"
  ON public.workspace_versions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'editor')
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION public.handle_workspace_update()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER workspace_update_timestamp
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_workspace_update();

CREATE TRIGGER comment_update_timestamp
  BEFORE UPDATE ON public.workspace_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_workspace_update();