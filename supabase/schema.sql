-- Create a per-user workspace store.
-- Run this in Supabase SQL Editor.

create table if not exists public.workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  workspace jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

-- Only the logged-in user can read/write their workspace.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'workspaces' and policyname = 'workspaces_select_own'
  ) then
    create policy workspaces_select_own on public.workspaces
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'workspaces' and policyname = 'workspaces_insert_own'
  ) then
    create policy workspaces_insert_own on public.workspaces
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'workspaces' and policyname = 'workspaces_update_own'
  ) then
    create policy workspaces_update_own on public.workspaces
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

