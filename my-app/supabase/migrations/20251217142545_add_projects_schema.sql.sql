create table projects (
  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references organizations(id) on delete cascade,

  created_by uuid
    references auth.users(id) on delete set null,

  name text not null,
  description text,
  status text not null default 'active',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organization_projects_unique
    unique (organization_id, name)
);
