-- Messages are open to every account.
--
-- Revises 0001, where starting a conversation and sending a message both
-- required a paid membership. Messaging is how women who met at an event
-- stay in touch; charging for it cuts the community at exactly the point
-- it forms. A subscription now buys the forums, the KousKous events and
-- the rewards.
--
-- Blocking still applies: a woman who blocked someone cannot be added to
-- a conversation with her.

drop policy if exists conversations_insert on public.conversations;
create policy conversations_insert on public.conversations
  for insert to authenticated with check (true);

drop policy if exists conversation_members_insert on public.conversation_members;
create policy conversation_members_insert on public.conversation_members
  for insert to authenticated
  with check (not public.is_blocked_pair(auth.uid(), profile_id));

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_conversation_member(conversation_id, auth.uid())
  );
