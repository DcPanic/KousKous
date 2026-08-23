/**
 * Reading and writing the forums.
 *
 * Rows are mapped into the same `ForumThread` shape the seeded content
 * uses, so the screens do not need to know where a thread came from.
 *
 * Everything here is members-only by policy, not by check: a free account
 * simply gets no rows back (see `threads_select` in 0001_init.sql). The
 * counts under each community are the exception — they come from the
 * `forum_stats` view, which every signed-in woman can read because that
 * number is what makes a subscription worth buying.
 */

import type { Attachment, ForumReply, ForumThread } from '@/data/forum';
import { relativeTime } from '@/lib/relative-time';
import { signedMediaUrls, toUploadable } from '@/lib/storage-media';
import { supabase } from '@/lib/supabase';

const THREAD_SELECT = `
  id, category_id, subcategory_id, author_id, title, body, location, pinned, created_at,
  author:profiles!threads_author_id_fkey (name, is_verified),
  media:thread_media (id, kind, storage_path, position),
  likes:thread_likes (count),
  replies:thread_replies (count)
`;

const REPLY_SELECT = `
  id, thread_id, author_id, body, created_at,
  author:profiles!thread_replies_author_id_fkey (name, is_verified),
  media:thread_media (id, kind, storage_path, position),
  likes:reply_likes (count)
`;

interface JoinedAuthor {
  name: string;
  is_verified: boolean;
}

interface JoinedMedia {
  id: string;
  kind: 'image' | 'video';
  storage_path: string;
  position: number;
}

interface ThreadRowJoined {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  body: string;
  location: string | null;
  pinned: boolean;
  created_at: string;
  author: JoinedAuthor | null;
  media: JoinedMedia[] | null;
  likes: { count: number }[] | null;
  replies: { count: number }[] | null;
}

interface ReplyRowJoined {
  id: string;
  thread_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author: JoinedAuthor | null;
  media: JoinedMedia[] | null;
  likes: { count: number }[] | null;
}

function countOf(rows: { count: number }[] | null): number {
  return rows?.[0]?.count ?? 0;
}

function toAttachments(media: JoinedMedia[] | null, urls: Map<string, string>): Attachment[] {
  return (media ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((item) => ({ id: item.id, kind: item.kind, uri: urls.get(item.storage_path) }));
}

/** The first line or two, which is all the list shows. */
function excerptOf(body: string): string {
  const firstParagraph = body.split('\n').find((line) => line.trim().length > 0) ?? '';
  return firstParagraph.length > 140 ? `${firstParagraph.slice(0, 137)}…` : firstParagraph;
}

function toThread(row: ThreadRowJoined, urls: Map<string, string>): ForumThread {
  return {
    id: row.id,
    categoryId: row.category_id,
    authorId: row.author_id,
    author: row.author?.name ?? 'Μέλος',
    verified: row.author?.is_verified ?? false,
    timeAgo: relativeTime(row.created_at),
    title: row.title,
    excerpt: excerptOf(row.body),
    body: row.body,
    attachments: toAttachments(row.media, urls),
    // The list needs the number, not the replies; the thread screen
    // fetches those when it opens.
    replies: [],
    replyCount: countOf(row.replies),
    likes: countOf(row.likes),
    location: row.location ?? '',
    pinned: row.pinned,
  };
}

function toReply(row: ReplyRowJoined, urls: Map<string, string>): ForumReply {
  return {
    id: row.id,
    authorId: row.author_id,
    author: row.author?.name ?? 'Μέλος',
    verified: row.author?.is_verified ?? false,
    timeAgo: relativeTime(row.created_at),
    body: row.body,
    likes: countOf(row.likes),
    attachments: toAttachments(row.media, urls),
  };
}

async function urlsFor(rows: { media: JoinedMedia[] | null }[]): Promise<Map<string, string>> {
  return signedMediaUrls(rows.flatMap((row) => (row.media ?? []).map((m) => m.storage_path)));
}

/** Every thread in one community, newest first. */
export async function fetchThreads(categoryId: string): Promise<ForumThread[]> {
  const { data, error } = await supabase
    .from('threads')
    .select(THREAD_SELECT)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) throw error ?? new Error('forum unavailable');

  const rows = data as unknown as ThreadRowJoined[];
  const urls = await urlsFor(rows);

  return rows.map((row) => toThread(row, urls));
}

/** Named threads, for the saved list. */
export async function fetchThreadsByIds(ids: string[]): Promise<ForumThread[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase.from('threads').select(THREAD_SELECT).in('id', ids);

  if (error || !data) return [];

  const rows = data as unknown as ThreadRowJoined[];
  const urls = await urlsFor(rows);

  return rows.map((row) => toThread(row, urls));
}

export async function fetchThread(threadId: string): Promise<ForumThread | null> {
  const { data, error } = await supabase
    .from('threads')
    .select(THREAD_SELECT)
    .eq('id', threadId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as ThreadRowJoined;
  return toThread(row, await urlsFor([row]));
}

export async function fetchReplies(threadId: string): Promise<ForumReply[]> {
  const { data, error } = await supabase
    .from('thread_replies')
    .select(REPLY_SELECT)
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error || !data) throw error ?? new Error('replies unavailable');

  const rows = data as unknown as ReplyRowJoined[];
  const urls = await urlsFor(rows);

  return rows.map((row) => toReply(row, urls));
}

export interface NewThread {
  categoryId: string;
  subcategoryId: string | null;
  title: string;
  body: string;
  location: string | null;
  attachments: Attachment[];
}

export async function createThread(authorId: string, input: NewThread): Promise<string> {
  const { data, error } = await supabase
    .from('threads')
    .insert({
      category_id: input.categoryId,
      subcategory_id: input.subcategoryId,
      author_id: authorId,
      title: input.title,
      body: input.body,
      location: input.location,
    })
    .select('id')
    .single();

  if (error || !data) throw error ?? new Error('thread not created');

  await uploadMedia(authorId, input.attachments, { thread_id: data.id });

  return data.id;
}

export async function createReply(
  threadId: string,
  authorId: string,
  body: string,
  attachments: Attachment[] = [],
): Promise<void> {
  const { data, error } = await supabase
    .from('thread_replies')
    .insert({ thread_id: threadId, author_id: authorId, body })
    .select('id')
    .single();

  if (error || !data) throw error ?? new Error('reply not created');

  await uploadMedia(authorId, attachments, { reply_id: data.id });
}

/**
 * Uploads pictures and links them to a thread or a reply.
 *
 * The folder is named after the author, which is what the storage policy
 * checks. A photo that fails to upload is skipped rather than discarding
 * the words that were already saved.
 */
async function uploadMedia(
  authorId: string,
  attachments: Attachment[],
  parent: { thread_id: string } | { reply_id: string },
): Promise<void> {
  const uploads = attachments.filter((attachment) => attachment.uri);
  const parentId = 'thread_id' in parent ? parent.thread_id : parent.reply_id;

  for (const [index, attachment] of uploads.entries()) {
    const path = `${authorId}/forum/${parentId}/${index}`;
    const blob = await toUploadable(attachment.uri as string);

    const { error } = await supabase.storage
      .from('media')
      .upload(path, blob, { contentType: blob.type || undefined, upsert: true });

    if (error) continue;

    await supabase.from('thread_media').insert({
      ...parent,
      kind: attachment.kind,
      storage_path: path,
      position: index,
    });
  }
}

export async function setThreadLike(
  threadId: string,
  profileId: string,
  liked: boolean,
): Promise<void> {
  if (liked) {
    await supabase.from('thread_likes').insert({ thread_id: threadId, profile_id: profileId });
  } else {
    await supabase
      .from('thread_likes')
      .delete()
      .eq('thread_id', threadId)
      .eq('profile_id', profileId);
  }
}

export async function setReplyLike(
  replyId: string,
  profileId: string,
  liked: boolean,
): Promise<void> {
  if (liked) {
    await supabase.from('reply_likes').insert({ reply_id: replyId, profile_id: profileId });
  } else {
    await supabase
      .from('reply_likes')
      .delete()
      .eq('reply_id', replyId)
      .eq('profile_id', profileId);
  }
}

export async function setThreadSaved(
  threadId: string,
  profileId: string,
  saved: boolean,
): Promise<void> {
  if (saved) {
    await supabase.from('thread_saves').insert({ thread_id: threadId, profile_id: profileId });
  } else {
    await supabase
      .from('thread_saves')
      .delete()
      .eq('thread_id', threadId)
      .eq('profile_id', profileId);
  }
}

/** Thread ids the signed-in woman saved, and the ones she liked. */
export async function fetchMyThreadState(
  profileId: string,
): Promise<{ saved: string[]; liked: string[] }> {
  const [saves, likes] = await Promise.all([
    supabase.from('thread_saves').select('thread_id').eq('profile_id', profileId),
    supabase.from('thread_likes').select('thread_id').eq('profile_id', profileId),
  ]);

  return {
    saved: (saves.data ?? []).map((row) => row.thread_id),
    liked: (likes.data ?? []).map((row) => row.thread_id),
  };
}

/** How busy each community is. Readable by free accounts too. */
export async function fetchForumStats(): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from('forum_stats')
    .select('category_id, thread_count, reply_count');

  if (error || !data) return new Map();

  return new Map(data.map((row) => [row.category_id, row.thread_count + row.reply_count]));
}
