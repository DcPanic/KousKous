-- Subcategories.
--
-- The 14 forum categories stay as they are (§4). This only records the
-- narrower choice a woman makes when posting — Beauty · Μαλλιά rather
-- than just Beauty — so the feed can be filtered more precisely without
-- splitting the communities themselves.
--
-- Stored as text, like category_id: the list ships with the app, so a
-- foreign key would mean a migration every time a subcategory is added.

alter table public.posts
  add column if not exists subcategory_id text;

alter table public.events
  add column if not exists subcategory_id text;

alter table public.threads
  add column if not exists subcategory_id text;

create index if not exists posts_subcategory_idx on public.posts (subcategory_id);
create index if not exists events_subcategory_idx on public.events (subcategory_id);
create index if not exists threads_subcategory_idx on public.threads (subcategory_id);
