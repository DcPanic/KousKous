-- A readable shape for the events list.
--
-- Two things the app needs are not reachable through the base tables:
--
--   * How many women have joined. `attendees_select` deliberately shows a
--     woman only her own row, and the host the whole door list — so a
--     count over event_attendees would come back as 0 or 1 for everyone
--     else. "18/24 θέσεις" needs the real number without exposing who.
--
--   * The host's name and badge, which would otherwise be a second query
--     per event.
--
-- A view with security_invoker off runs as its owner and so can count the
-- rows the caller cannot see. It exposes the count only — never a name,
-- never an id of anyone attending. The block rule is re-applied here by
-- hand, because bypassing RLS also bypasses `profiles_select`.

create or replace view public.events_public
with (security_invoker = off) as
select
  e.id,
  e.host_id,
  e.title,
  e.description,
  e.category_id,
  e.subcategory_id,
  e.location,
  e.venue,
  e.starts_at,
  e.price_cents,
  e.spots_total,
  e.members_only,
  e.cover_path,
  e.is_official,
  e.created_at,
  p.name as host_name,
  p.is_verified as host_verified,
  p.avatar_url as host_avatar_url,
  (select count(*) from public.event_attendees a where a.event_id = e.id)::int as spots_taken
from public.events e
join public.profiles p on p.id = e.host_id
where not public.is_blocked_pair(auth.uid(), e.host_id);

-- Signed-in only; the anon role gets nothing.
revoke all on public.events_public from anon;
grant select on public.events_public to authenticated;
