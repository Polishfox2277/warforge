-- Warforge Provinces — Supabase schema v3 custom countries
-- Uruchom w Supabase Dashboard → SQL Editor → New query → Run.

create extension if not exists pgcrypto;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  host_user uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Warforge room',
  status text not null default 'running' check (status in ('lobby', 'running', 'finished')),
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

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.games to authenticated;
grant select, insert, update, delete on table public.game_members to authenticated;
revoke all on table public.games from anon;
revoke all on table public.game_members from anon;

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
    where g.id = game_members.game_id and g.status in ('lobby', 'running')
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
    where g.id = game_members.game_id and g.status in ('lobby', 'running')
  )
);

create policy game_members_update_self
on public.game_members
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Atomiczne dołączanie: gracz dostaje pierwsze wolne państwo w JSON state.players.
-- Slot zostaje nadpisany własnym krajem gracza przesłanym z localStorage.
create or replace function public.join_game_room(
  p_code text,
  p_nickname text default 'Dowódca',
  p_country_name text default 'Nowe Państwo',
  p_color text default '#7b5cff',
  p_secondary_color text default '#f2b84b',
  p_ideology text default 'industrialist',
  p_government text default 'republic',
  p_doctrine text default 'balanced',
  p_trait text default 'engineers',
  p_flag jsonb default '{"pattern":"horizontal","emblem":"star","primary":"#7b5cff","secondary":"#f2b84b"}'::jsonb
)
returns public.games
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_game public.games;
  v_state jsonb;
  v_existing_faction text;
  v_index integer;
  v_player jsonb;
  v_slot_id text := null;
  v_nickname text := coalesce(nullif(trim(p_nickname), ''), 'Dowódca');
  v_country_name text := coalesce(nullif(trim(p_country_name), ''), 'Nowe Państwo');
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select * into v_game
  from public.games
  where code = upper(trim(p_code))
  for update;

  if not found then
    raise exception 'room not found';
  end if;

  if v_game.status = 'finished' then
    raise exception 'game is finished';
  end if;

  select faction_id into v_existing_faction
  from public.game_members
  where game_id = v_game.id and user_id = v_user;

  if v_existing_faction is not null and v_existing_faction <> 'spectator' then
    update public.game_members
    set nickname = v_nickname
    where game_id = v_game.id and user_id = v_user;
    return v_game;
  end if;

  v_state := v_game.state;

  for v_index in 0..jsonb_array_length(v_state->'players') - 1 loop
    v_player := v_state->'players'->v_index;
    if v_player->>'controller' = v_user::text then
      v_slot_id := v_player->>'id';
      exit;
    end if;
  end loop;

  if v_slot_id is null then
    for v_index in 0..jsonb_array_length(v_state->'players') - 1 loop
      v_player := v_state->'players'->v_index;
      if v_player->>'type' = 'open' then
        v_slot_id := v_player->>'id';
        v_player := v_player || jsonb_build_object(
          'type', 'human',
          'controller', v_user::text,
          'nickname', v_nickname,
          'name', v_country_name,
          'color', p_color,
          'secondaryColor', p_secondary_color,
          'ideology', p_ideology,
          'government', p_government,
          'doctrine', p_doctrine,
          'trait', p_trait,
          'flag', p_flag,
          'eliminated', false
        );
        v_state := jsonb_set(v_state, array['players', v_index::text], v_player, false);
        v_state := jsonb_set(
          v_state,
          '{log}',
          jsonb_build_array(v_nickname || ' dołącza jako ' || v_country_name || '.') || coalesce(v_state->'log', '[]'::jsonb),
          true
        );
        v_state := jsonb_set(v_state, '{updatedAt}', to_jsonb(now()::text), true);
        exit;
      end if;
    end loop;
  end if;

  if v_slot_id is null then
    v_slot_id := 'spectator';
  end if;

  insert into public.game_members (game_id, user_id, nickname, faction_id, is_host)
  values (v_game.id, v_user, v_nickname, v_slot_id, false)
  on conflict (game_id, user_id)
  do update set nickname = excluded.nickname, faction_id = excluded.faction_id;

  if v_slot_id <> 'spectator' then
    update public.games
    set state = v_state,
        version = version + 1,
        updated_at = now()
    where id = v_game.id
    returning * into v_game;
  else
    select * into v_game from public.games where id = v_game.id;
  end if;

  return v_game;
end;
$$;

grant execute on function public.join_game_room(text, text, text, text, text, text, text, text, text, jsonb) to authenticated;

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
