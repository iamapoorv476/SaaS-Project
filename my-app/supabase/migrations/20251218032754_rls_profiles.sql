alter table profiles enable row level security;

create policy "Users can read their own profile"
on profiles
for select
using (id = auth.uid());

create policy "Users can insert their own profile"
on profiles
for insert
with check (id = auth.uid());

create policy "Users can update their own profile"
on profiles
for update
using (id=auth.uid())
with check (id=auth.uid());
