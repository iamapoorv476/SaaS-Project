create table api_keys (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    created_by uuid not null references auth.users(id),

    name text not null,

    prefix text not null,
    hash text not null,
    last_four_chars text not null,

    scopes text[] not null default '{}',
    environment text not null default 'development'
        check (environment in ('development', 'staging', 'production')),

    status text not null default 'active'
        check (status in ('active', 'revoked')),

    expires_at timestamptz,
    last_used_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (project_id, name),
    unique (hash)
);

create table usage_events (
    id uuid primary key default gen_random_uuid(),

    api_key_id uuid not null references api_keys(id) on delete cascade,
    project_id uuid not null references projects(id) on delete cascade,

    endpoint text not null,
    method text not null,
    status_code integer not null,
    latency_ms integer not null,

    ip_address_hash text,
    user_agent_hash text,

    event_timestamp timestamptz not null default now()
);

create table project_usage (
    id uuid primary key default gen_random_uuid(),

    project_id uuid not null references projects(id) on delete cascade,
    month date not null,

    total_requests integer not null default 0,
    error_requests integer not null default 0,

    last_updated timestamptz not null default now(),

    unique (project_id, month)
);
