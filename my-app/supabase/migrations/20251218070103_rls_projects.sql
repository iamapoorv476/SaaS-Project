alter table projects enable row level security;

create policy "Members can read projects in their org"
on projects
for select
using (
  exists (
    select 1
    from members m
    where m.organization_id = projects.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "Members can create projects in their org"
on projects
for insert
with check (
  exists (
    select 1
    from members m
    where m.organization_id = projects.organization_id
      and m.user_id = auth.uid()
  )
);
create policy "Members can update projects in their org"
on projects
for update
using(
    exists(
        select 1
        from members m
        where m.organization_id = projects.organization_id
           and m.user_id = auth.uid()
    )
)
with check(
    exists(
        select 1
        from members m
        where m.organization_id = projects.organization_id
           and m.user_id = auth.uid()
    )
);

create policy "Members can delete projects in their org"
on projects
for delete
using (
  exists (
    select 1
    from members m
    where m.organization_id = projects.organization_id
      and m.user_id = auth.uid()
  )
);


