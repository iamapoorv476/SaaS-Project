alter table audit_logs enable row level security;
create policy "Owners and admins can read audit logs"
on audit_logs
for select
using (
  exists (
    select 1
    from members m
    where m.organization_id = audit_logs.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);
