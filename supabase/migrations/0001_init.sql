-- KousKous — initial schema and Row Level Security.
--
-- Run this once in the Supabase SQL Editor.
--
-- Two rules shape everything below:
--   1. The anon key is public, so nothing may be readable or writable
--      without an explicit policy. RLS is enabled on every table.
--   2. KousKous never holds event money (spec §9). There is no wallet,
--      no balance and no payout table — only a reference to the host's
--      own Stripe account.

-- ---------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  bio text,
  avatar_url text,
  -- Place id from the shared locations list (e.g. 'athens'), not free text.
  location text,
  is_paid_member boolean not null default false,
  paid_until timestamptz,
  is_host boolean not null default false,
  community_approved boolean not null default false,
  payment_verified boolean not null default false,
  payment_provider_account_id text,
  is_official boolean not null default false,
  is_verified boolean not null default false,
  -- Hidden from other members when false (Settings → privacy).
  show_location boolean not null default true,
  discoverable boolean not null default true,
  points integer not null default 0,
  created_at timestamptz not null default now()
);

-- Interests are a small fixed set of category ids, so a join table keeps
-- them queryable without a second lookup service.
create table if not exists public.profile_interests (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  category_id text not null,
  primary key (profile_id, category_id)
);

-- ---------------------------------------------------------------------
-- Blocking — consulted by almost every other policy, so it comes first.
-- ---------------------------------------------------------------------

create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_not_self check (blocker_id <> blocked_id)
);

-- True when either woman has blocked the other. Blocking is symmetric in
-- effect: neither sees the other's content afterwards.
create or replace function public.is_blocked_pair(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b)
       or (blocker_id = b and blocked_id = a)
  );
$$;

-- ---------------------------------------------------------------------
-- Membership helpers
-- ---------------------------------------------------------------------

create or replace function public.is_paid_member(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_paid_member or is_host or is_official from public.profiles where id = uid),
    false
  );
$$;

create or replace function public.is_official(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_official from public.profiles where id = uid), false);
$$;

-- A host may publish paid events only when both gates are open (spec §2.3).
create or replace function public.can_create_paid_events(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select (is_host and community_approved and payment_verified) or is_official
     from public.profiles where id = uid),
    false
  );
$$;

-- ---------------------------------------------------------------------
-- Feed
-- ---------------------------------------------------------------------

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  caption text not null default '',
  hashtags text not null default '',
  location text,
  -- Optional community the post belongs to.
  category_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  storage_path text not null,
  position integer not null default 0
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table if not exists public.post_saves (
  post_id uuid not null references public.posts (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, profile_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Communities (forums). Categories themselves are a fixed list shipped in
-- the app, so only follows and content live here.
-- ---------------------------------------------------------------------

create table if not exists public.category_follows (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  category_id text not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, category_id)
);

create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  category_id text not null,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null default '',
  location text,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.thread_replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.thread_media (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.threads (id) on delete cascade,
  reply_id uuid references public.thread_replies (id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  storage_path text not null,
  position integer not null default 0,
  -- Media hangs off exactly one of the two.
  constraint thread_media_one_parent check (num_nonnulls(thread_id, reply_id) = 1)
);

create table if not exists public.thread_saves (
  thread_id uuid not null references public.threads (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (thread_id, profile_id)
);

-- ---------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  category_id text,
  location text not null,
  venue text,
  starts_at timestamptz not null,
  -- Cents, so no floating point money. Zero means a free event.
  price_cents integer not null default 0 check (price_cents >= 0),
  spots_total integer not null check (spots_total > 0),
  members_only boolean not null default true,
  cover_path text,
  is_official boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.event_attendees (
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

-- ---------------------------------------------------------------------
-- Direct messages
-- ---------------------------------------------------------------------

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  primary key (conversation_id, profile_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null default '',
  media_path text,
  created_at timestamptz not null default now()
);

create or replace function public.is_conversation_member(cid uuid, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_members
    where conversation_id = cid and profile_id = uid
  );
$$;

-- ---------------------------------------------------------------------
-- Rewards
-- ---------------------------------------------------------------------

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  partner text not null,
  cost_points integer not null default 0 check (cost_points >= 0),
  min_level text not null default 'rose',
  ends_at timestamptz,
  members_only boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reward_entries (
  reward_id uuid not null references public.rewards (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reward_id, profile_id)
);

create table if not exists public.point_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  points integer not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Moderation
-- ---------------------------------------------------------------------

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  post_id uuid references public.posts (id) on delete cascade,
  thread_id uuid references public.threads (id) on delete cascade,
  reply_id uuid references public.thread_replies (id) on delete cascade,
  reported_profile_id uuid references public.profiles (id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'reviewed', 'actioned')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- New sign-ups get a profile automatically, so the app never has to
-- create one and no account can exist without it.
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, location)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'Νέο μέλος'),
    new.raw_user_meta_data ->> 'location'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Indexes for the queries the app actually makes
-- ---------------------------------------------------------------------

create index if not exists posts_created_idx on public.posts (created_at desc);
create index if not exists posts_category_idx on public.posts (category_id);
create index if not exists posts_location_idx on public.posts (location);
create index if not exists comments_post_idx on public.comments (post_id, created_at);
create index if not exists threads_category_idx on public.threads (category_id, created_at desc);
create index if not exists replies_thread_idx on public.thread_replies (thread_id, created_at);
create index if not exists events_starts_idx on public.events (starts_at);
create index if not exists events_location_idx on public.events (location);
create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.profile_interests enable row level security;
alter table public.blocks enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_saves enable row level security;
alter table public.comments enable row level security;
alter table public.category_follows enable row level security;
alter table public.threads enable row level security;
alter table public.thread_replies enable row level security;
alter table public.thread_media enable row level security;
alter table public.thread_saves enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_entries enable row level security;
alter table public.point_entries enable row level security;
alter table public.reports enable row level security;

-- Profiles: every signed-in member sees other members, except the ones
-- either of them blocked. Only the owner can change her own row.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or not public.is_blocked_pair(auth.uid(), id));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists interests_select on public.profile_interests;
create policy interests_select on public.profile_interests
  for select to authenticated using (true);

drop policy if exists interests_write_own on public.profile_interests;
create policy interests_write_own on public.profile_interests
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Blocks are private to the woman who made them.
drop policy if exists blocks_own on public.blocks;
create policy blocks_own on public.blocks
  for all to authenticated
  using (blocker_id = auth.uid())
  with check (blocker_id = auth.uid());

-- Feed: readable by any signed-in member who has not blocked the author.
drop policy if exists posts_select on public.posts;
create policy posts_select on public.posts
  for select to authenticated
  using (not public.is_blocked_pair(auth.uid(), author_id));

drop policy if exists posts_write_own on public.posts;
create policy posts_write_own on public.posts
  for all to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists post_media_select on public.post_media;
create policy post_media_select on public.post_media
  for select to authenticated
  using (exists (select 1 from public.posts p where p.id = post_id));

drop policy if exists post_media_write_own on public.post_media;
create policy post_media_write_own on public.post_media
  for all to authenticated
  using (exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()))
  with check (exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()));

drop policy if exists post_likes_select on public.post_likes;
create policy post_likes_select on public.post_likes
  for select to authenticated using (true);

drop policy if exists post_likes_write_own on public.post_likes;
create policy post_likes_write_own on public.post_likes
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Saves are nobody else's business.
drop policy if exists post_saves_own on public.post_saves;
create policy post_saves_own on public.post_saves
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists comments_select on public.comments;
create policy comments_select on public.comments
  for select to authenticated
  using (not public.is_blocked_pair(auth.uid(), author_id));

drop policy if exists comments_write_own on public.comments;
create policy comments_write_own on public.comments
  for all to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists follows_own on public.category_follows;
create policy follows_own on public.category_follows
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Forums: viewing is for members only (spec §3), so free accounts get the
-- blurred preview from seeded content rather than real threads.
drop policy if exists threads_select on public.threads;
create policy threads_select on public.threads
  for select to authenticated
  using (
    public.is_paid_member(auth.uid())
    and not public.is_blocked_pair(auth.uid(), author_id)
  );

drop policy if exists threads_write_own on public.threads;
create policy threads_write_own on public.threads
  for all to authenticated
  using (author_id = auth.uid() and public.is_paid_member(auth.uid()))
  with check (author_id = auth.uid() and public.is_paid_member(auth.uid()));

drop policy if exists replies_select on public.thread_replies;
create policy replies_select on public.thread_replies
  for select to authenticated
  using (
    public.is_paid_member(auth.uid())
    and not public.is_blocked_pair(auth.uid(), author_id)
  );

drop policy if exists replies_write_own on public.thread_replies;
create policy replies_write_own on public.thread_replies
  for all to authenticated
  using (author_id = auth.uid() and public.is_paid_member(auth.uid()))
  with check (author_id = auth.uid() and public.is_paid_member(auth.uid()));

drop policy if exists thread_media_select on public.thread_media;
create policy thread_media_select on public.thread_media
  for select to authenticated using (public.is_paid_member(auth.uid()));

drop policy if exists thread_media_write_own on public.thread_media;
create policy thread_media_write_own on public.thread_media
  for all to authenticated
  using (
    exists (select 1 from public.threads t where t.id = thread_id and t.author_id = auth.uid())
    or exists (select 1 from public.thread_replies r where r.id = reply_id and r.author_id = auth.uid())
  )
  with check (
    exists (select 1 from public.threads t where t.id = thread_id and t.author_id = auth.uid())
    or exists (select 1 from public.thread_replies r where r.id = reply_id and r.author_id = auth.uid())
  );

drop policy if exists thread_saves_own on public.thread_saves;
create policy thread_saves_own on public.thread_saves
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Events are visible to everyone signed in; joining is members-only and
-- publishing a paid event needs both host gates.
drop policy if exists events_select on public.events;
create policy events_select on public.events
  for select to authenticated using (true);

drop policy if exists events_insert_host on public.events;
create policy events_insert_host on public.events
  for insert to authenticated
  with check (
    host_id = auth.uid()
    and (price_cents = 0 or public.can_create_paid_events(auth.uid()))
  );

drop policy if exists events_update_host on public.events;
create policy events_update_host on public.events
  for update to authenticated
  using (host_id = auth.uid())
  with check (
    host_id = auth.uid()
    and (price_cents = 0 or public.can_create_paid_events(auth.uid()))
  );

drop policy if exists events_delete_host on public.events;
create policy events_delete_host on public.events
  for delete to authenticated using (host_id = auth.uid());

-- The host sees her own door list; everyone else sees only her own row.
drop policy if exists attendees_select on public.event_attendees;
create policy attendees_select on public.event_attendees
  for select to authenticated
  using (
    profile_id = auth.uid()
    or exists (select 1 from public.events e where e.id = event_id and e.host_id = auth.uid())
  );

drop policy if exists attendees_join on public.event_attendees;
create policy attendees_join on public.event_attendees
  for insert to authenticated
  with check (profile_id = auth.uid() and public.is_paid_member(auth.uid()));

drop policy if exists attendees_leave on public.event_attendees;
create policy attendees_leave on public.event_attendees
  for delete to authenticated using (profile_id = auth.uid());

-- Only the host may mark someone as checked in.
drop policy if exists attendees_check_in on public.event_attendees;
create policy attendees_check_in on public.event_attendees
  for update to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.host_id = auth.uid()))
  with check (exists (select 1 from public.events e where e.id = event_id and e.host_id = auth.uid()));

-- Messages: only the two women in a conversation, ever.
drop policy if exists conversations_select on public.conversations;
create policy conversations_select on public.conversations
  for select to authenticated using (public.is_conversation_member(id, auth.uid()));

drop policy if exists conversations_insert on public.conversations;
create policy conversations_insert on public.conversations
  for insert to authenticated with check (public.is_paid_member(auth.uid()));

drop policy if exists conversation_members_select on public.conversation_members;
create policy conversation_members_select on public.conversation_members
  for select to authenticated
  using (public.is_conversation_member(conversation_id, auth.uid()));

drop policy if exists conversation_members_insert on public.conversation_members;
create policy conversation_members_insert on public.conversation_members
  for insert to authenticated
  with check (
    public.is_paid_member(auth.uid())
    and not public.is_blocked_pair(auth.uid(), profile_id)
  );

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select to authenticated
  using (public.is_conversation_member(conversation_id, auth.uid()));

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_paid_member(auth.uid())
    and public.is_conversation_member(conversation_id, auth.uid())
  );

drop policy if exists messages_delete_own on public.messages;
create policy messages_delete_own on public.messages
  for delete to authenticated using (sender_id = auth.uid());

-- Rewards are published by the Official account and read by members.
drop policy if exists rewards_select on public.rewards;
create policy rewards_select on public.rewards
  for select to authenticated using (true);

drop policy if exists rewards_write_official on public.rewards;
create policy rewards_write_official on public.rewards
  for all to authenticated
  using (public.is_official(auth.uid()))
  with check (public.is_official(auth.uid()));

drop policy if exists reward_entries_own on public.reward_entries;
create policy reward_entries_own on public.reward_entries
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and public.is_paid_member(auth.uid()));

-- Points are awarded server-side; a member may read hers but not write.
drop policy if exists point_entries_select_own on public.point_entries;
create policy point_entries_select_own on public.point_entries
  for select to authenticated using (profile_id = auth.uid());

-- Reports are write-only for members: file it, never read anyone else's.
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());

drop policy if exists reports_select on public.reports;
create policy reports_select on public.reports
  for select to authenticated
  using (reporter_id = auth.uid() or public.is_official(auth.uid()));

-- ---------------------------------------------------------------------
-- Storage: avatars are public-read, everything else members-only. Each
-- woman may only write inside a folder named after her own user id.
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

drop policy if exists avatars_read on storage.objects;
create policy avatars_read on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists avatars_write_own on storage.objects;
create policy avatars_write_own on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists media_read_members on storage.objects;
create policy media_read_members on storage.objects
  for select to authenticated using (bucket_id = 'media');

drop policy if exists media_write_own on storage.objects;
create policy media_write_own on storage.objects
  for all to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
