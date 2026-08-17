-- Where each woman has read up to in a conversation.
--
-- The unread badge was device-local, so reading a conversation on a phone
-- left it bold on a tablet. Storing the mark against the membership row
-- makes it follow the account instead.
--
-- Null means she has never opened it, which is what a brand new
-- conversation should look like.

alter table public.conversation_members
  add column if not exists last_read_at timestamptz;

-- 0001 gave conversation_members select and insert but no update, so the
-- mark could never be written. Each woman may move her own, and nobody
-- else's.
drop policy if exists conversation_members_update_own on public.conversation_members;
create policy conversation_members_update_own on public.conversation_members
  for update to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
