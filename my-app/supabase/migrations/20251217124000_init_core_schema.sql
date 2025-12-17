create table profiles(
    id uuid primary key references auth.users(id) on delete cascade,
    name text not null,
    avatar_url text,
    created_at timestamptz not null default now()
);

create table organizations(
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text unique,
    owner_id uuid not null references auth.users(id),
     created_at timestamptz not null default now()
);