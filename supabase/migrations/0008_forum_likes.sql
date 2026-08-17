-- Likes on forum threads and replies, and a count per community.
--
-- The forum screens have always shown a heart with a number. Nothing
-- stored it, so this adds the two tables that back it — mirroring
-- post_likes rather than inventing a second shape.
--
-- Visibility follows the forum itself (§3): reading a thread is a
-- members' benefit, so reading its likes is too. That keeps the count a
-- paid member sees consistent with the threads she can see.

create table if not exists public.thread_likes (
  thread_id uuid not null references public.threads (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (thread_id, profile_id)
);

create table if not exists public.reply_likes (
  reply_id uuid not null references public.thread_replies (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (reply_id, profile_id)
);

alter table public.thread_likes enable row level security;
alter table public.reply_likes enable row level security;

drop policy if exists thread_likes_select on public.thread_likes;
create policy thread_likes_select on public.thread_likes
  for select to authenticated using (public.is_paid_member(auth.uid()));

drop policy if exists thread_likes_own on public.thread_likes;
create policy thread_likes_own on public.thread_likes
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and public.is_paid_member(auth.uid()));

drop policy if exists reply_likes_select on public.reply_likes;
create policy reply_likes_select on public.reply_likes
  for select to authenticated using (public.is_paid_member(auth.uid()));

drop policy if exists reply_likes_own on public.reply_likes;
create policy reply_likes_own on public.reply_likes
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and public.is_paid_member(auth.uid()));

-- ---------------------------------------------------------------------
-- How busy each community is
-- ---------------------------------------------------------------------

-- The communities grid shows a count under every category, and it has to
-- show one to free accounts too — that number is the reason to subscribe.
-- The threads themselves stay unreadable to them; this view exposes
-- totals only, never a title, an author or a word of any thread.
create or replace view public.forum_stats
with (security_invoker = off) as
select
  t.category_id,
  count(distinct t.id)::int as thread_count,
  count(r.id)::int as reply_count
from public.threads t
left join public.thread_replies r on r.thread_id = t.id
group by t.category_id;

revoke all on public.forum_stats from anon;
grant select on public.forum_stats to authenticated;
