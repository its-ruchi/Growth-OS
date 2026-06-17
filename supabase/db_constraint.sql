-- SQL migration to protect against workspaces database bloat.
-- Run this query in your Supabase SQL Editor.

-- Enforce a maximum size limit of 500KB (512,000 characters) on the workspace JSON representation.
ALTER TABLE public.workspaces 
  DROP CONSTRAINT IF EXISTS check_workspace_size;

ALTER TABLE public.workspaces 
  ADD CONSTRAINT check_workspace_size CHECK (octet_length(workspace::text) < 512000);
