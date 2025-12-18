alter table invites enable row level security;

create policy "Admins and owner  can read invites"
on invites
for select
using(
    exists(
        select 1
        from members m
        where m.organization_id = invites.organization_id
           and m.user_id = auth.uid()
           and m.role in ('owner','admin')
    )
);

create policy "Admins and owners can create invites"
on invites
for insert
with check (
  exists (
    select 1
    from members m
    where m.organization_id = invites.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);

create policy "Admins and owners can delete invites"
on invites
for delete
using (
  exists (
    select 1
    from members m
    where m.organization_id = invites.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);

