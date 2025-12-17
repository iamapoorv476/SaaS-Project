create table audit_logs(
    id uuid primary key default gen_random_uuid(),

    organization_id uuid not null references
        organizations(id) on delete restrict,
    
     actor_id uuid references auth.users(id) on delete set null,

     action text not null,
     entity_type text not null,
     entity_id uuid,

     metadata jsonb,

     created_at timestamptz not null default now()

       

);