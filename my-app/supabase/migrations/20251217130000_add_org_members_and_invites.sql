create table members (
    id uuid primary key default gen_random_uuid(),
   organization_id uuid not null references organizations(id) on delete cascade,
    user_id uuid not null  references auth.users(id) on delete cascade,
    role  text not null,
     created_at timestamptz not null default now(),

     constraint organization_members_unique
    unique (organization_id, user_id)
);

create table invites (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid  not null references organizations(id) on delete cascade,
    email text not null,
    role text not null,
    token text unique not null,
    expires_at timestamptz not null default ( now() + interval '7days'),
    accepted_at timestamptz ,
    created_by uuid references auth.users(id),
    created_at timestamptz not null default now()

);