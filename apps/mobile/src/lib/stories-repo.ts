/**
 * Stories that expire after 24 hours.
 *
 * A row is one frame. Frames by the same woman inside the window are
 * grouped into a single story, so the rail shows one ring per person and
 * the viewer pages through her frames.
 *
 * Expiry is enforced by the select policy in the database; the window
 * here only drives the countdown label.
 */

import { signedMediaUrls, toUploadable } from '@/lib/storage-media';
import { supabase } from '@/lib/supabase';
import type { MockStory, StoryFrame } from '@/data/mock';

const WINDOW_HOURS = 24;

interface StoryRow {
  id: string;
  author_id: string;
  kind: 'image' | 'video';
  storage_path: string;
  caption: string;
  created_at: string;
  author: { name: string; avatar_url: string | null } | null;
}

/** "3 ώρες ακόμα" — what is left of the window, not how old it is. */
function remainingLabel(createdAt: string): string {
  const expiresAt = new Date(createdAt).getTime() + WINDOW_HOURS * 3600 * 1000;
  const minutes = Math.max(0, Math.round((expiresAt - Date.now()) / 60000));

  if (minutes < 60) return `${minutes} λεπτά ακόμα`;

  const hours = Math.round(minutes / 60);
  return hours === 1 ? '1 ώρα ακόμα' : `${hours} ώρες ακόμα`;
}

export async function fetchStories(): Promise<MockStory[]> {
  const { data, error } = await supabase
    .from('stories')
    .select(
      'id, author_id, kind, storage_path, caption, created_at, author:profiles!stories_author_id_fkey (name, avatar_url)',
    )
    .order('created_at', { ascending: true });

  if (error || !data) throw error ?? new Error('stories unavailable');

  const rows = data as unknown as StoryRow[];
  const urls = await signedMediaUrls(rows.map((row) => row.storage_path));

  // Group by author, keeping the order the frames were posted in.
  const byAuthor = new Map<string, MockStory>();

  for (const row of rows) {
    const frame: StoryFrame = {
      id: row.id,
      tint: '#FBE1E9',
      caption: row.caption,
      uri: urls.get(row.storage_path),
      kind: row.kind,
    };

    const existing = byAuthor.get(row.author_id);

    if (existing) {
      existing.frames.push(frame);
      // The newest frame decides how long the ring stays up.
      existing.timeAgo = remainingLabel(row.created_at);
    } else {
      byAuthor.set(row.author_id, {
        id: row.author_id,
        authorId: row.author_id,
        name: row.author?.name ?? 'Μέλος',
        avatarUrl: row.author?.avatar_url ?? null,
        live: false,
        timeAgo: remainingLabel(row.created_at),
        frames: [frame],
      });
    }
  }

  return [...byAuthor.values()];
}

export interface NewStory {
  kind: 'image' | 'video';
  uri: string;
  caption: string;
}

export async function createStory(authorId: string, input: NewStory): Promise<void> {
  const path = `${authorId}/stories/${Date.now()}`;
  const blob = await toUploadable(input.uri);

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(path, blob, { contentType: blob.type || undefined, upsert: true });

  if (uploadError) throw uploadError;

  const { error } = await supabase.from('stories').insert({
    author_id: authorId,
    kind: input.kind,
    storage_path: path,
    caption: input.caption,
  });

  if (error) throw error;
}

/** Records that the signed-in woman saw a frame. Failure is not worth reporting. */
export async function markStorySeen(storyId: string, viewerId: string): Promise<void> {
  await supabase
    .from('story_views')
    .insert({ story_id: storyId, viewer_id: viewerId })
    .then(undefined, () => undefined);
}
