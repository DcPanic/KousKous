-- Events are open; only the KousKous ones are a members' benefit.
--
-- Revises the rule in 0001: joining an event no longer requires a paid
-- membership across the board. Events run by hosts are open to every
-- account, free ones included — they are the hosts' livelihood and the
-- reason many women arrive. A subscription buys the forums, the events
-- KousKous itself runs, and the rewards.
--
-- Safe to run on top of 0001; it only replaces one policy.

drop policy if exists attendees_join on public.event_attendees;
create policy attendees_join on public.event_attendees
  for insert to authenticated
  with check (
    profile_id = auth.uid()
    and (
      -- A host's event: anyone signed in may join.
      exists (
        select 1 from public.events e
        where e.id = event_id and not e.is_official
      )
      -- A KousKous event: members only.
      or (
        public.is_paid_member(auth.uid())
        and exists (select 1 from public.events e where e.id = event_id)
      )
    )
  );
