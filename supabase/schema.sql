-- Warforge Provinces — Supabase schema
-- Uruchom w Supabase Dashboard → SQL Editor → New query → Run.

create extension if not exists pgcrypto;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  host_user uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Warforge room',
  status text not null default 'lobby' check (status in ('lobby', 'running', 'finished')),
  state jsonb not null,
  version integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_members (
  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null default 'Dowódca',
  faction_id text not null default 'spectator',
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (game_id, user_id)
);

create index if not exists games_code_idx on public.games (code);
create index if not exists games_updated_at_idx on public.games (updated_at desc);
create index if not exists game_members_user_idx on public.game_members (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
before update on public.games
for each row execute function public.set_updated_at();


create or replace function public.is_game_member(p_game_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.game_members gm
    where gm.game_id = p_game_id and gm.user_id = (select auth.uid())
  );
$$;

grant execute on function public.is_game_member(uuid) to authenticated;

alter table public.games enable row level security;
alter table public.game_members enable row level security;

-- Projekty Supabase utworzone po zmianach Data API wymagają jawnych grantów.
grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.games to authenticated;
grant select, insert, update, delete on table public.game_members to authenticated;
revoke all on table public.games from anon;
revoke all on table public.game_members from anon;

-- Reset polityk, żeby wielokrotne uruchomienie pliku było bezpieczne.
drop policy if exists games_select_joinable_or_member on public.games;
drop policy if exists games_insert_own on public.games;
drop policy if exists game_members_select_related on public.game_members;
drop policy if exists game_members_insert_self on public.game_members;
drop policy if exists game_members_update_self on public.game_members;

create policy games_select_joinable_or_member
on public.games
for select
to authenticated
using (
  status = 'lobby'
  or host_user = (select auth.uid())
  or public.is_game_member(games.id)
);

create policy games_insert_own
on public.games
for insert
to authenticated
with check (host_user = (select auth.uid()));

create policy game_members_select_related
on public.game_members
for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_game_member(game_members.game_id)
  or exists (
    select 1 from public.games g
    where g.id = game_members.game_id and g.status = 'lobby'
  )
);

create policy game_members_insert_self
on public.game_members
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.games g
    where g.id = game_members.game_id and g.status = 'lobby'
  )
);

create policy game_members_update_self
on public.game_members
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create or replace function public.submit_game_state(
  p_game_id uuid,
  p_state jsonb,
  p_expected_version integer
)
returns public.games
language plpgsql
security definer
set search_path = public
as $$
declare
  v_game public.games;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1 from public.game_members gm
    where gm.game_id = p_game_id and gm.user_id = (select auth.uid())
  ) then
    raise exception 'not a member of this game';
  end if;

  update public.games
  set state = p_state,
      version = version + 1,
      updated_at = now()
  where id = p_game_id
    and version = p_expected_version
  returning * into v_game;

  if not found then
    raise exception 'game version conflict; reload the room';
  end if;

  return v_game;
end;
$$;

grant execute on function public.submit_game_state(uuid, jsonb, integer) to authenticated;

-- Realtime: dodaj tabelę games do publikacji, jeśli jeszcze jej tam nie ma.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'games'
  ) then
    alter publication supabase_realtime add table public.games;
  end if;
end;
$$;
