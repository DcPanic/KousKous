-- Notifications.
--
-- Written by triggers rather than by the app: the client that likes a
-- post has no business writing a row into someone else's inbox, and half
-- the events (an order, a new attendee) come from a different screen than
-- the one that should be notified.
--
-- `kind` matches what the notifications screen already renders, so a row
-- arrives ready to display.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  -- Who is being told.
  profile_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('reply', 'like', 'follow', 'event', 'order', 'system')),
  -- Who caused it. Null for system notices.
  actor_id uuid references public.profiles (id) on delete cascade,
  /**
   * What to open, as the screen's own target shape: a thread id, an
   * event id, a post id. Null when there is nothing to open.
   */
  target_kind text check (target_kind in ('thread', 'event', 'post', 'chat', 'community', 'shop')),
  target_id text,
  /** Extra words for the line, when the kind alone is not enough. */
  detail text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_profile_idx
  on public.notifications (profile_id, created_at desc);

alter table public.notifications enable row level security;

-- Hers alone, and she may only mark them read.
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select to authenticated using (profile_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

drop policy if exists notifications_delete_own on public.notifications;
create policy notifications_delete_own on public.notifications
  for delete to authenticated using (profile_id = auth.uid());

-- No insert policy at all: rows come from the triggers below, which run
-- as the definer and bypass RLS. Nobody can write into another woman's
-- inbox by hand.

-- ---------------------------------------------------------------------
-- The writer
-- ---------------------------------------------------------------------

create or replace function public.notify(
  recipient uuid,
  kind text,
  actor uuid,
  target_kind text default null,
  target_id text default null,
  detail text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Nobody needs telling about their own actions.
  if recipient is null or recipient = actor then
    return;
  end if;

  -- And nobody hears from someone they blocked.
  if actor is not null and public.is_blocked_pair(recipient, actor) then
    return;
  end if;

  insert into public.notifications (profile_id, kind, actor_id, target_kind, target_id, detail)
  values (recipient, kind, actor, target_kind, target_id, detail);
end;
$$;

-- ---------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------

create or replace function public.on_post_liked()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  author uuid;
begin
  select author_id into author from public.posts where id = new.post_id;
  perform public.notify(author, 'like', new.profile_id, 'post', new.post_id::text);
  return new;
end;
$$;

drop trigger if exists post_liked_notify on public.post_likes;
create trigger post_liked_notify
  after insert on public.post_likes
  for each row execute function public.on_post_liked();

create or replace function public.on_comment_added()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  author uuid;
begin
  select author_id into author from public.posts where id = new.post_id;
  perform public.notify(author, 'reply', new.author_id, 'post', new.post_id::text, new.body);
  return new;
end;
$$;

drop trigger if exists comment_added_notify on public.comments;
create trigger comment_added_notify
  after insert on public.comments
  for each row execute function public.on_comment_added();

create or replace function public.on_thread_replied()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  author uuid;
  thread_title text;
begin
  select t.author_id, t.title into author, thread_title
  from public.threads t where t.id = new.thread_id;

  perform public.notify(
    author, 'reply', new.author_id, 'thread', new.thread_id::text, thread_title
  );
  return new;
end;
$$;

drop trigger if exists thread_replied_notify on public.thread_replies;
create trigger thread_replied_notify
  after insert on public.thread_replies
  for each row execute function public.on_thread_replied();

create or replace function public.on_followed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify(new.followee_id, 'follow', new.follower_id, null, null);
  return new;
end;
$$;

drop trigger if exists followed_notify on public.follows;
create trigger followed_notify
  after insert on public.follows
  for each row execute function public.on_followed();

create or replace function public.on_event_joined()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  host uuid;
  event_title text;
begin
  select e.host_id, e.title into host, event_title
  from public.events e where e.id = new.event_id;

  perform public.notify(
    host, 'event', new.profile_id, 'event', new.event_id::text, event_title
  );
  return new;
end;
$$;

drop trigger if exists event_joined_notify on public.event_attendees;
create trigger event_joined_notify
  after insert on public.event_attendees
  for each row execute function public.on_event_joined();

create or replace function public.on_order_placed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner uuid;
begin
  select s.host_id into owner from public.shops s where s.id = new.shop_id;
  perform public.notify(owner, 'order', new.buyer_id, 'shop', new.shop_id::text);
  return new;
end;
$$;

drop trigger if exists order_placed_notify on public.orders;
create trigger order_placed_notify
  after insert on public.orders
  for each row execute function public.on_order_placed();
