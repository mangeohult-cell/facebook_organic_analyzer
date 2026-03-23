-- Kör detta i Supabase SQL Editor

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  month text not null,
  uploaded_by text not null,
  uploaded_by_name text not null,
  uploaded_at timestamptz not null default now(),
  row_count integer not null default 0
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  file_id uuid not null references files(id) on delete cascade,
  title text,
  published_at timestamptz,
  reach integer not null default 0,
  engagement integer not null default 0,
  reactions integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  post_type text not null default 'text',
  link_clicks integer not null default 0
);

-- Index för snabba queries
create index if not exists posts_file_id_idx on posts(file_id);
create index if not exists posts_published_at_idx on posts(published_at);
create index if not exists posts_reach_idx on posts(reach desc);

-- Row Level Security
alter table files enable row level security;
alter table posts enable row level security;

-- Endast inloggade användare kan läsa och skriva
create policy "authenticated read files" on files
  for select using (auth.role() = 'authenticated');

create policy "authenticated insert files" on files
  for insert with check (auth.role() = 'authenticated');

create policy "authenticated delete files" on files
  for delete using (auth.role() = 'authenticated');

create policy "authenticated read posts" on posts
  for select using (auth.role() = 'authenticated');

create policy "authenticated insert posts" on posts
  for insert with check (auth.role() = 'authenticated');

create policy "authenticated delete posts" on posts
  for delete using (auth.role() = 'authenticated');

-- -----------------------------------------------
-- Sidinställningar (t.ex. antal följare)
-- -----------------------------------------------

create table if not exists page_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Skrivs och läses enbart server-side via service role – ingen RLS behövs
-- (service role kringgår RLS automatiskt)

-- -----------------------------------------------
-- Whitelist-tabell för e-post-åtkomstkontroll
-- -----------------------------------------------

create table if not exists whitelist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  added_by text,
  added_at timestamptz not null default now()
);

-- Alla (även anon) kan läsa whitelist – används i layout-check
-- Skrivskydd hanteras av API-route som kräver admin-roll
alter table whitelist enable row level security;

create policy "anyone can read whitelist" on whitelist
  for select using (true);

-- Service role key (från backend) kan skriva – inga extra policies behövs
-- (service role kringgår RLS automatiskt)
