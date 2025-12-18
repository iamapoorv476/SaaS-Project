alter table organizations enable row level security;

create policy "Members can read their organizations"
on organizations
for select
using(
    exists(
       select 1
       from members om
       where om.organization_id = organizations.id
         and om.user_id=auth.uid()

    )
);

create policy "Authenticated users can create organizations"
on organizations
for insert
with check(auth.uid()is not null);

create policy "Owners can update their organizations"
on organizations
for update
using(
    exists(
        select 1
        from members om
        where om.organization_id = organizations.id
           and om.user_id = auth.uid()
           and om.role = 'owner'
    )
)

with check(
    exists (
    select 1
    from members om
    where om.organization_id = organizations.id
      and om.user_id = auth.uid()
      and om.role = 'owner'
  )
);

create policy "Owners can delete their organizations"
on organizations
for delete
using (
    exists(
        select 1
        from members om
        where om.organization_id = organizations.id
           and om.user_id = auth.uid()
           and om.role =' owner'
    )
);