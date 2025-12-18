alter table subscriptions enable row level security;
create policy "Owners and admins can read subscriptions"
on subscriptions
for select
using (
  exists (
    select 1
    from members m
    where m.organization_id = subscriptions.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);
