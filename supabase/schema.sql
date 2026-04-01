create extension if not exists pgcrypto;

create or replace function public.set_current_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.sync_auth_email()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  auth_email text;
begin
  select email into auth_email
  from auth.users
  where id = new.user_id;

  if auth_email is null then
    raise exception 'Authenticated email not found for user %', new.user_id;
  end if;

  new.email = auth_email;
  return new;
end;
$$;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  name text not null,
  company_name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  email text not null,
  score integer not null check (score >= 0 and score <= 1000),
  quiz_version text not null default 'v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists scores_user_version_unique
  on public.scores(user_id, quiz_version);

create index if not exists scores_score_desc_idx
  on public.scores(score desc);

create index if not exists scores_updated_at_asc_idx
  on public.scores(updated_at asc);

create index if not exists scores_user_id_idx
  on public.scores(user_id);

create index if not exists scores_quiz_version_idx
  on public.scores(quiz_version);

drop trigger if exists players_set_updated_at on public.players;
create trigger players_set_updated_at
before update on public.players
for each row
execute function public.set_current_timestamp();

drop trigger if exists scores_set_updated_at on public.scores;
create trigger scores_set_updated_at
before update on public.scores
for each row
execute function public.set_current_timestamp();

drop trigger if exists players_sync_auth_email on public.players;
create trigger players_sync_auth_email
before insert or update on public.players
for each row
execute function public.sync_auth_email();

drop trigger if exists scores_sync_auth_email on public.scores;
create trigger scores_sync_auth_email
before insert or update on public.scores
for each row
execute function public.sync_auth_email();

alter table public.players enable row level security;
alter table public.scores enable row level security;

drop policy if exists "Players can view own row" on public.players;
create policy "Players can view own row"
on public.players
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Players can insert own row" on public.players;
create policy "Players can insert own row"
on public.players
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Players can update own row" on public.players;
create policy "Players can update own row"
on public.players
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Authenticated users can read scores" on public.scores;
create policy "Authenticated users can read scores"
on public.scores
for select
to authenticated
using (true);

drop policy if exists "Players can insert own score" on public.scores;
create policy "Players can insert own score"
on public.scores
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Players can update own score" on public.scores;
create policy "Players can update own score"
on public.scores
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace view public.leaderboard_entries
as
select
  s.user_id,
  s.player_id,
  p.name,
  p.company_name,
  s.score,
  s.updated_at,
  s.quiz_version
from public.scores s
join public.players p on p.id = s.player_id;

grant select on public.leaderboard_entries to authenticated, anon;

do $$
begin
  alter publication supabase_realtime add table public.scores;
exception
  when duplicate_object then
    null;
end;
$$;
