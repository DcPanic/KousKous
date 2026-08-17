/**
 * Reading and writing direct messages.
 *
 * Open to every account (0005_open_messages.sql): messaging is how women
 * who met at an event stay in touch, so it is not behind the
 * subscription. Only the two women in a conversation can read it, which
 * the policies enforce rather than these queries.
 */

import type { Attachment } from '@/data/forum';
import { signedMediaUrls, toUploadable } from '@/lib/storage-media';
import { supabase } from '@/lib/supabase';

export interface ChatMessage {
  id: string;
  /** True when the signed-in woman wrote it. */
  mine: boolean;
  body: string;
  /** HH:MM, which is all a bubble shows. */
  time: string;
  createdAt: string;
  attachments: Attachment[];
}

export interface Conversation {
  id: string;
  /** The other woman. A conversation is always one-to-one. */
  personId: string;
  name: string;
  verified: boolean;
  avatarUrl: string | null;
  location: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

function clock(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

interface MemberRow {
  conversation_id: string;
  last_read_at: string | null;
}

interface OtherMemberRow {
  conversation_id: string;
  profile_id: string;
  profile: {
    name: string;
    is_verified: boolean;
    avatar_url: string | null;
    location: string | null;
  } | null;
}

interface MessageRowJoined {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  media_path: string | null;
  created_at: string;
}

/**
 * Every conversation the signed-in woman is in, newest activity first.
 *
 * Built from three reads rather than one nested query: PostgREST cannot
 * express "the other member" as an embed, and the unread count needs the
 * messages anyway.
 */
export async function fetchConversations(profileId: string): Promise<Conversation[]> {
  const { data: mine, error } = await supabase
    .from('conversation_members')
    .select('conversation_id, last_read_at')
    .eq('profile_id', profileId);

  if (error || !mine || mine.length === 0) {
    if (error) throw error;
    return [];
  }

  const members = mine as MemberRow[];
  const ids = members.map((row) => row.conversation_id);

  const [others, messages] = await Promise.all([
    supabase
      .from('conversation_members')
      .select(
        'conversation_id, profile_id, profile:profiles!conversation_members_profile_id_fkey (name, is_verified, avatar_url, location)',
      )
      .in('conversation_id', ids)
      .neq('profile_id', profileId),
    supabase
      .from('messages')
      .select('id, conversation_id, sender_id, body, media_path, created_at')
      .in('conversation_id', ids)
      .order('created_at', { ascending: false }),
  ]);

  const otherRows = (others.data ?? []) as unknown as OtherMemberRow[];
  const messageRows = (messages.data ?? []) as unknown as MessageRowJoined[];

  const conversations = members.map((member) => {
    const other = otherRows.find((row) => row.conversation_id === member.conversation_id);
    const thread = messageRows.filter((row) => row.conversation_id === member.conversation_id);
    const last = thread[0];

    // Her own messages never count as unread, however long she was away.
    const unread = thread.filter(
      (row) =>
        row.sender_id !== profileId &&
        (!member.last_read_at || row.created_at > member.last_read_at),
    ).length;

    return {
      id: member.conversation_id,
      personId: other?.profile_id ?? '',
      name: other?.profile?.name ?? 'Μέλος',
      verified: other?.profile?.is_verified ?? false,
      avatarUrl: other?.profile?.avatar_url ?? null,
      location: other?.profile?.location ?? '',
      lastMessage: last?.body ?? (last?.media_path ? 'Φωτογραφία' : ''),
      lastTime: last ? clock(last.created_at) : '',
      unread,
      // Kept only for the sort below.
      lastAt: last?.created_at ?? '',
    };
  });

  return conversations
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt))
    .map(({ lastAt: _lastAt, ...conversation }) => conversation);
}

export async function fetchMessages(
  conversationId: string,
  profileId: string,
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, body, media_path, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error || !data) throw error ?? new Error('messages unavailable');

  const rows = data as MessageRowJoined[];
  const urls = await signedMediaUrls(
    rows.map((row) => row.media_path).filter((path): path is string => Boolean(path)),
  );

  return rows.map((row) => ({
    id: row.id,
    mine: row.sender_id === profileId,
    body: row.body,
    time: clock(row.created_at),
    createdAt: row.created_at,
    attachments: row.media_path
      ? [{ id: `${row.id}-media`, kind: 'image' as const, uri: urls.get(row.media_path) }]
      : [],
  }));
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
  attachment?: Attachment,
): Promise<void> {
  let mediaPath: string | null = null;

  if (attachment?.uri) {
    // Named after the sender, which is what the storage policy checks.
    const path = `${senderId}/chat/${conversationId}/${Date.now()}`;
    const blob = await toUploadable(attachment.uri);

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, blob, { contentType: blob.type || undefined, upsert: true });

    if (!uploadError) mediaPath = path;
  }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    body,
    media_path: mediaPath,
  });

  if (error) throw error;
}

/**
 * The conversation with one other woman, creating it the first time.
 *
 * Reuses an existing thread rather than opening a second one, so a
 * profile's message button always lands in the same place.
 */
export async function openConversationWith(
  profileId: string,
  otherId: string,
): Promise<string | null> {
  const [mine, theirs] = await Promise.all([
    supabase.from('conversation_members').select('conversation_id').eq('profile_id', profileId),
    supabase.from('conversation_members').select('conversation_id').eq('profile_id', otherId),
  ]);

  const hers = new Set((theirs.data ?? []).map((row) => row.conversation_id));
  const shared = (mine.data ?? []).find((row) => hers.has(row.conversation_id));

  if (shared) return shared.conversation_id;

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({})
    .select('id')
    .single();

  if (error || !created) return null;

  const { error: membersError } = await supabase.from('conversation_members').insert([
    { conversation_id: created.id, profile_id: profileId },
    { conversation_id: created.id, profile_id: otherId },
  ]);

  // Blocked in either direction: the policy refuses the other woman's
  // row, and a conversation with only one member is no conversation.
  if (membersError) return null;

  return created.id;
}

/** Moves her own read mark to now. */
export async function markRead(conversationId: string, profileId: string): Promise<void> {
  await supabase
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('profile_id', profileId);
}
