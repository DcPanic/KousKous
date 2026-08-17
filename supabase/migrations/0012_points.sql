-- Points, and what spends them.
--
-- 0001 said points are awarded server-side and gave members read access
-- only — but nothing was awarding them, so every balance was zero and the
-- Rewards Club had nothing behind it. These triggers are the awarding.
--
-- `profiles.points` stays the running total so a balance is one column
-- read rather than a sum over the whole history; point_entries stays the
-- ledger that explains it.

-- ---------------------------------------------------------------------
-- The ledger keeps the balance honest
-- ---------------------------------------------------------------------

create or replace function public.apply_point_entry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set points = greatest(0, points + new.points)
  where id = new.profile_id;

  return new;
end;
$$;

drop trigger if exists point_entry_applied on public.point_entries;
create trigger point_entry_applied
  after insert on public.point_entries
  for each row execute function public.apply_point_entry();

/**
 * Awards points. Security definer, because point_entries has no insert
 * policy — nobody hands themselves points by hand.
 */
create or replace function public.award(
  recipient uuid,
  label text,
  amount integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if recipient is null or amount = 0 then
    return;
  end if;

  insert into public.point_entries (profile_id, label, points)
  values (recipient, label, amount);
end;
$$;

-- ---------------------------------------------------------------------
-- What earns them
-- ---------------------------------------------------------------------

create or replace function public.on_post_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.award(new.author_id, 'Νέα δημοσίευση', 10);
  return new;
end;
$$;

drop trigger if exists post_created_award on public.posts;
create trigger post_created_award
  after insert on public.posts
  for each row execute function public.on_post_created();

create or replace function public.on_thread_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.award(new.author_id, 'Νέο θέμα σε κοινότητα', 30);
  return new;
end;
$$;

drop trigger if exists thread_created_award on public.threads;
create trigger thread_created_award
  after insert on public.threads
  for each row execute function public.on_thread_created();

create or replace function public.on_reply_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.award(new.author_id, 'Απάντηση σε συζήτηση', 15);
  return new;
end;
$$;

drop trigger if exists reply_created_award on public.thread_replies;
create trigger reply_created_award
  after insert on public.thread_replies
  for each row execute function public.on_reply_created();

-- Turning up is worth more than posting about it, so the points land on
-- check-in rather than on signing up.
create or replace function public.on_checked_in()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_title text;
begin
  if new.checked_in_at is null or old.checked_in_at is not null then
    return new;
  end if;

  select title into event_title from public.events where id = new.event_id;
  perform public.award(new.profile_id, format('Συμμετοχή στο «%s»', event_title), 120);

  return new;
end;
$$;

drop trigger if exists checked_in_award on public.event_attendees;
create trigger checked_in_award
  after update on public.event_attendees
  for each row execute function public.on_checked_in();

-- ---------------------------------------------------------------------
-- What spends them
-- ---------------------------------------------------------------------

/**
 * Entering a giveaway costs what the reward says. The check runs before
 * the row exists, so a member cannot enter on credit — and the deduction
 * is written by the same trigger, so an entry and its cost can never
 * disagree.
 */
create or replace function public.on_reward_entered()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cost integer;
  reward_title text;
  balance integer;
begin
  select r.cost_points, r.title into cost, reward_title
  from public.rewards r where r.id = new.reward_id;

  if cost is null then
    raise exception 'reward not found';
  end if;

  if cost > 0 then
    select p.points into balance from public.profiles p where p.id = new.profile_id;

    if coalesce(balance, 0) < cost then
      raise exception 'not enough points';
    end if;

    insert into public.point_entries (profile_id, label, points)
    values (new.profile_id, format('Συμμετοχή σε «%s»', reward_title), -cost);
  end if;

  return new;
end;
$$;

drop trigger if exists reward_entered_spend on public.reward_entries;
create trigger reward_entered_spend
  before insert on public.reward_entries
  for each row execute function public.on_reward_entered();

-- ---------------------------------------------------------------------
-- Rewards get an end date and a picture
-- ---------------------------------------------------------------------

alter table public.rewards
  add column if not exists description text not null default '';

-- Entries are counted for the Official dashboard, and a member should
-- see how many others are in — but never who. A view of counts only.
create or replace view public.reward_stats
with (security_invoker = off) as
select
  r.id as reward_id,
  count(e.profile_id)::int as entry_count
from public.rewards r
left join public.reward_entries e on e.reward_id = r.id
group by r.id;

revoke all on public.reward_stats from anon;
grant select on public.reward_stats to authenticated;
