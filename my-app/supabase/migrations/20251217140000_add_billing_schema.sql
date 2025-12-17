create table subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price_cents integer not null,
  currency text not null,
  billing_interval text not null,
  stripe_price_id text,
  max_projects integer not null default 3,
  max_members integer not null default 5,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references organizations(id) on delete restrict,
  plan_id uuid not null
    references subscription_plans(id),
  stripe_subscription_id text,
  status text not null,
  current_period_start timestamptz not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),

  constraint one_subscription_per_org
    unique (organization_id)
);
