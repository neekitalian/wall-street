create extension if not exists pgcrypto;

create table if not exists public.cm_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) = 6),
  status text not null default 'lobby' check (status in ('lobby','active','finished')),
  turn integer not null default 1 check (turn between 1 and 13),
  version integer not null default 1,
  deadline timestamptz,
  state jsonb not null default '{"cash":20,"enterpriseValue":100,"debt":40,"control":50,"liquidity":50,"marketStress":20,"lastEvent":"The syndicate assembles."}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.cm_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.cm_rooms(id) on delete cascade,
  role text not null check (role in ('founder','pe','bank','hedge','creditor')),
  name text not null check (char_length(name) between 1 and 40),
  session_hash text not null unique,
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  unique(room_id, role)
);

create table if not exists public.cm_actions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.cm_rooms(id) on delete cascade,
  turn integer not null,
  player_id uuid not null references public.cm_players(id) on delete cascade,
  role text not null,
  choice text not null,
  created_at timestamptz not null default now(),
  unique(room_id, turn, role)
);

alter table public.cm_rooms enable row level security;
alter table public.cm_players enable row level security;
alter table public.cm_actions enable row level security;

create or replace function public.cm_resolve_turn(target_room uuid, target_turn integer)
returns void language plpgsql security definer set search_path = public as $$
declare
  current_room public.cm_rooms%rowtype;
  action_count integer;
  cash numeric; ev numeric; debt numeric; control_score numeric; liquidity numeric; stress numeric;
  choices text[];
  event_text text;
begin
  perform pg_advisory_xact_lock(hashtext(target_room::text));
  select * into current_room from public.cm_rooms where id = target_room for update;
  if current_room.status <> 'active' or current_room.turn <> target_turn then return; end if;
  select count(*), array_agg(choice) into action_count, choices from public.cm_actions where room_id = target_room and turn = target_turn;
  if action_count < 5 then return; end if;

  cash := (current_room.state->>'cash')::numeric;
  ev := (current_room.state->>'enterpriseValue')::numeric;
  debt := (current_room.state->>'debt')::numeric;
  control_score := (current_room.state->>'control')::numeric;
  liquidity := (current_room.state->>'liquidity')::numeric;
  stress := (current_room.state->>'marketStress')::numeric;

  if 'grow' = any(choices) then cash := cash - 4; ev := ev + 10; stress := stress + 3; end if;
  if 'restructure' = any(choices) then cash := cash - 2; debt := greatest(0, debt - 5); liquidity := liquidity + 4; end if;
  if 'protect' = any(choices) then liquidity := liquidity + 7; ev := ev - 2; end if;
  if 'acquire' = any(choices) then debt := debt + 9; ev := ev + 13; control_score := control_score + 8; stress := stress + 7; end if;
  if 'operate' = any(choices) then cash := cash + 3; ev := ev + 5; end if;
  if 'lend' = any(choices) then cash := cash + 5; debt := debt + 7; liquidity := liquidity + 4; end if;
  if 'tighten' = any(choices) then liquidity := liquidity - 8; stress := stress + 8; end if;
  if 'decline' = any(choices) then liquidity := liquidity - 2; debt := greatest(0, debt - 2); end if;
  if 'long' = any(choices) then ev := ev + 6; stress := stress + 4; end if;
  if 'short' = any(choices) then ev := ev - 5; liquidity := liquidity - 3; stress := stress + 6; end if;
  if 'hedge' = any(choices) then cash := cash - 1; stress := stress - 6; end if;
  if 'extend' = any(choices) then liquidity := liquidity + 5; stress := stress - 3; end if;
  if 'enforce' = any(choices) then cash := cash - 4; control_score := control_score - 9; stress := stress + 10; end if;
  if 'swap' = any(choices) then debt := greatest(0, debt - 8); control_score := control_score - 6; liquidity := liquidity + 2; end if;

  if stress >= 75 then cash := cash - 5; ev := ev * .9; event_text := 'A funding shock forces marks lower across the table.';
  elsif liquidity <= 20 then debt := debt + 4; event_text := 'Thin liquidity gives the bank and creditors new leverage.';
  elsif ev >= 150 then event_text := 'The company attracts strategic buyers, but every seat wants the upside.';
  else event_text := 'The quarter closes with the coalition intact—for now.'; end if;

  update public.cm_rooms set
    turn = least(13, target_turn + 1),
    status = case when target_turn >= 12 or cash <= 0 or ev <= debt then 'finished' else 'active' end,
    version = version + 1,
    deadline = case when target_turn >= 12 then null else now() + interval '90 seconds' end,
    state = jsonb_build_object('cash', round(greatest(0,cash),2), 'enterpriseValue', round(greatest(0,ev),2), 'debt', round(greatest(0,debt),2),
      'control', round(greatest(0,least(100,control_score)),2), 'liquidity', round(greatest(0,least(100,liquidity)),2),
      'marketStress', round(greatest(0,least(100,stress)),2), 'lastEvent', event_text)
  where id = target_room and turn = target_turn;
end;
$$;

revoke all on function public.cm_resolve_turn(uuid, integer) from public, anon, authenticated;
grant execute on function public.cm_resolve_turn(uuid, integer) to service_role;
grant select, insert, update, delete on public.cm_rooms, public.cm_players, public.cm_actions to service_role;

create or replace function public.cm_timeout_turn(target_room uuid, target_turn integer)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtext(target_room::text));
  if not exists(select 1 from public.cm_rooms where id = target_room and turn = target_turn and status = 'active' and deadline <= now()) then return; end if;
  insert into public.cm_actions(room_id, turn, player_id, role, choice)
  select p.room_id, target_turn, p.id, p.role,
    case p.role when 'founder' then 'protect' when 'pe' then 'pass' when 'bank' then 'decline' when 'hedge' then 'hedge' else 'extend' end
  from public.cm_players p where p.room_id = target_room
  on conflict(room_id, turn, role) do nothing;
  perform public.cm_resolve_turn(target_room, target_turn);
end;
$$;

revoke all on function public.cm_timeout_turn(uuid, integer) from public, anon, authenticated;
grant execute on function public.cm_timeout_turn(uuid, integer) to service_role;
