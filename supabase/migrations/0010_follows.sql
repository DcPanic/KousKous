-- Following other women.
--
-- The Φίλες screen and the two counts on a profile have had nothing
-- behind them; this is the graph. One direction only — following is not
-- a mutual friendship, so no acceptance step and no pending state.

create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  -- Following yourself is a bug, not a feature.
  constraint follows_not_self check (follower_id <> followee_id)
);

create index if not exists follows_followee_idx on public.follows (followee_id);

alter table public.follows enable row level security;

-- Who follows whom is public inside the community, which is what makes
-- the counts and the Φίλες lists work — except across a block.
drop policy if exists follows_select on public.follows;
create policy follows_select on public.follows
  for select to authenticated
  using (
    not public.is_blocked_pair(auth.uid(), follower_id)
    and not public.is_blocked_pair(auth.uid(), followee_id)
  );

drop policy if exists follows_own on public.follows;
create policy follows_own on public.follows
  for all to authenticated
  using (follower_id = auth.uid())
  with check (
    follower_id = auth.uid()
    and not public.is_blocked_pair(auth.uid(), followee_id)
  );
