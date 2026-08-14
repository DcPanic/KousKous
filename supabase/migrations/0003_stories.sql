-- Stories: a photo or a short video that disappears after 24 hours.
--
-- One row is one frame. Several frames by the same woman inside the
-- window read as one story, which is how the viewer already groups them.
--
-- "Disappears" is enforced on read, not by hoping a cleanup job ran: the
-- select policy itself excludes anything older than the window, so an
-- expired frame is invisible even if its row is still there. The delete
-- function below reclaims the storage afterwards.

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('image', 'video')),
  storage_path text not null,
  caption text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists stories_recent_idx on public.stories (created_at desc);
create index if not exists stories_author_idx on public.stories (author_id, created_at desc);

alter table public.stories enable row level security;

-- Visible for 24 hours, and never from someone either woman has blocked.
drop policy if exists stories_select on public.stories;
create policy stories_select on public.stories
  for select to authenticated
  using (
    created_at > now() - interval '24 hours'
    and not public.is_blocked_pair(auth.uid(), author_id)
  );

drop policy if exists stories_write_own on public.stories;
create policy stories_write_own on public.stories
  for all to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- Who has seen a frame. Only the author is told.
create table if not exists public.story_views (
  story_id uuid not null references public.stories (id) on delete cascade,
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, viewer_id)
);

alter table public.story_views enable row level security;

drop policy if exists story_views_insert on public.story_views;
create policy story_views_insert on public.story_views
  for insert to authenticated with check (viewer_id = auth.uid());

drop policy if exists story_views_select on public.story_views;
create policy story_views_select on public.story_views
  for select to authenticated
  using (
    viewer_id = auth.uid()
    or exists (
      select 1 from public.stories s
      where s.id = story_id and s.author_id = auth.uid()
    )
  );

-- Reclaims rows and their files once they are past the window. Safe to
-- call repeatedly; it is a no-op when there is nothing expired.
create or replace function public.delete_expired_stories()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  with gone as (
    delete from public.stories
    where created_at <= now() - interval '24 hours'
    returning storage_path
  )
  delete from storage.objects
  where bucket_id = 'media' and name in (select storage_path from gone);

  get diagnostics removed = row_count;
  return removed;
end;
$$;

-- Run it hourly when pg_cron is available. Without the extension the
-- stories still expire on read; only the cleanup waits.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'kouskous-expire-stories',
      '0 * * * *',
      $cron$select public.delete_expired_stories();$cron$
    );
  end if;
end;
$$;
