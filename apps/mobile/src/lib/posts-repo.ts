/**
 * Reading and writing the feed.
 *
 * Rows come back joined with their author and media, and are mapped into
 * the same shape the seeded content uses, so the card does not need to
 * know where a post came from.
 */

import { findPlace } from '@kouskous/shared';
import type { Attachment } from '@/data/forum';
import type { MockComment, MockPost } from '@/data/mock';
import { relativeTime } from '@/lib/relative-time';
import { supabase } from '@/lib/supabase';

/** What the feed query selects, joins included. */
const FEED_SELECT = `
  id, caption, hashtags, location, category_id, created_at, author_id,
  author:profiles!posts_author_id_fkey (name, is_verified, avatar_url),
  media:post_media (id, kind, storage_path, position),
  likes:post_likes (count),
  comments:comments (count)
`;

interface JoinedAuthor {
  name: string;
  is_verified: boolean;
  avatar_url: string | null;
}

interface JoinedMedia {
  id: string;
  kind: 'image' | 'video';
  storage_path: string;
  position: number;
}

interface FeedRow {
  id: string;
  caption: string;
  hashtags: string;
  location: string | null;
  category_id: string | null;
  created_at: string;
  author_id: string;
  author: JoinedAuthor | null;
  media: JoinedMedia[] | null;
  likes: { count: number }[] | null;
  comments: { count: number }[] | null;
}

/** Signed URLs are per-request; the bucket path is enough to build one. */
export function mediaUrl(storagePath: string): string {
  const { data } = supabase.storage.from('media').getPublicUrl(storagePath);
  return data.publicUrl;
}

function toAttachment(media: JoinedMedia): Attachment {
  return { id: media.id, kind: media.kind, uri: mediaUrl(media.storage_path) };
}

function countOf(rows: { count: number }[] | null): number {
  return rows?.[0]?.count ?? 0;
}

function toPost(row: FeedRow): MockPost {
  const place = row.location ? findPlace(row.location) : undefined;
  const attachments = (row.media ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map(toAttachment);

  return {
    id: row.id,
    authorId: row.author_id,
    author: row.author?.name ?? 'Μέλος',
    verified: row.author?.is_verified ?? false,
    location: row.location ?? '',
    locationLabel: place
      ? `${place.name}, ${place.country === 'CY' ? 'Κύπρος' : 'Ελλάδα'}`
      : '',
    timeAgo: relativeTime(row.created_at),
    caption: row.caption,
    hashtags: row.hashtags,
    mediaCount: attachments.length,
    likes: countOf(row.likes),
    comments: countOf(row.comments),
    shares: 0,
    likedByLabel: '',
    commentPreviews: [],
    totalComments: countOf(row.comments),
    categoryId: row.category_id,
    attachments,
  };
}

export async function fetchPosts(): Promise<MockPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(FEED_SELECT)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) throw error ?? new Error('feed unavailable');
  return (data as unknown as FeedRow[]).map(toPost);
}

export interface NewPost {
  caption: string;
  hashtags: string;
  location: string | null;
  categoryId: string | null;
  attachments: Attachment[];
}

/**
 * Insert a post and its media.
 *
 * Media is uploaded under a folder named after the author, which is what
 * the storage policy checks.
 */
export async function createPost(authorId: string, input: NewPost): Promise<string> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: authorId,
      caption: input.caption,
      hashtags: input.hashtags,
      location: input.location,
      category_id: input.categoryId,
    })
    .select('id')
    .single();

  if (error || !data) throw error ?? new Error('post not created');

  const postId = data.id;
  const uploads = input.attachments.filter((attachment) => attachment.uri);

  for (const [index, attachment] of uploads.entries()) {
    const path = `${authorId}/${postId}/${index}`;
    const response = await fetch(attachment.uri as string);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, blob, { contentType: blob.type, upsert: true });

    // One failed photo should not throw away the whole post.
    if (uploadError) continue;

    await supabase
      .from('post_media')
      .insert({ post_id: postId, kind: attachment.kind, storage_path: path, position: index });
  }

  return postId;
}

export async function setLike(postId: string, profileId: string, liked: boolean): Promise<void> {
  if (liked) {
    await supabase.from('post_likes').insert({ post_id: postId, profile_id: profileId });
  } else {
    await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('profile_id', profileId);
  }
}

export async function setSaved(postId: string, profileId: string, saved: boolean): Promise<void> {
  if (saved) {
    await supabase.from('post_saves').insert({ post_id: postId, profile_id: profileId });
  } else {
    await supabase
      .from('post_saves')
      .delete()
      .eq('post_id', postId)
      .eq('profile_id', profileId);
  }
}

/** Post ids the signed-in woman has liked and saved. */
export async function fetchMyReactions(
  profileId: string,
): Promise<{ liked: string[]; saved: string[] }> {
  const [likes, saves] = await Promise.all([
    supabase.from('post_likes').select('post_id').eq('profile_id', profileId),
    supabase.from('post_saves').select('post_id').eq('profile_id', profileId),
  ]);

  return {
    liked: (likes.data ?? []).map((row) => row.post_id),
    saved: (saves.data ?? []).map((row) => row.post_id),
  };
}

export async function fetchComments(postId: string): Promise<MockComment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('id, body, created_at, author:profiles!comments_author_id_fkey (name)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error || !data) throw error ?? new Error('comments unavailable');

  return (data as unknown as { body: string; author: { name: string } | null }[]).map((row) => ({
    author: row.author?.name ?? 'Μέλος',
    text: row.body,
  }));
}

export async function createComment(
  postId: string,
  authorId: string,
  body: string,
): Promise<void> {
  const { error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: authorId, body });

  if (error) throw error;
}
