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

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 1000),
  quiz_version text not null default 'v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);



create index if not exists scores_score_desc_idx
  on public.scores(score desc);

create index if not exists scores_updated_at_asc_idx
  on public.scores(updated_at asc);

create index if not exists scores_player_id_idx
  on public.scores(player_id);

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

alter table public.players enable row level security;
alter table public.scores enable row level security;

drop policy if exists "Players can view own row" on public.players;
drop policy if exists "Players can insert own row" on public.players;
drop policy if exists "Players can update own row" on public.players;
create policy "Anyone can read players"
on public.players for select using (true);

drop policy if exists "Authenticated users can read scores" on public.scores;
drop policy if exists "Players can insert own score" on public.scores;
drop policy if exists "Players can update own score" on public.scores;
create policy "Anyone can read scores"
on public.scores for select using (true);

create or replace view public.leaderboard_entries
as
select
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
