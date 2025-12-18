alter table members enable row level security;

create policy "Members can  read organizations members"
on members
for select
using(
    exists(
        select 1
        from members m
        where m.organization_id = members.organization_id
           and m.user_id = auth.uid()
    )
);

create policy "Admin and Owner can add members"
on members
for insert
with check (
  exists (
    select 1
    from members m
    where m.organization_id = members.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);

create policy "Admins and owners can update members"
on members
for update
using(
    exists(
        select 1
        from members m
        where m.organization_id = members.organization_id
              and m.user_id = auth.uid()
              and m.role in ('owner','admin')

    )
    and members.user_id <> auth.uid()
)
with check (
  exists (
    select 1
    from members m
    where m.organization_id = members.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
);

create policy "Admins and owners can remove members"
on members
for delete
using (
  exists (
    select 1
    from members m
    where m.organization_id = members.organization_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  )
  and members.user_id <> auth.uid()
);