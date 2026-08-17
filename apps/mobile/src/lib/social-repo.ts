/**
 * The follow graph and the notification inbox.
 *
 * Notifications are never written from here: the triggers in
 * 0011_notifications.sql write them, so a client cannot put a line into
 * someone else's inbox. All this does is read them and mark them read.
 */

import { supabase } from '@/lib/supabase';

export interface FollowPerson {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  location: string;
  verified: boolean;
  host: boolean;
}

const PERSON_SELECT = 'id, name, bio, avatar_url, location, is_verified, is_host, community_approved, show_location';

interface PersonRow {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  is_verified: boolean;
  is_host: boolean;
  community_approved: boolean;
  show_location: boolean;
}

function toPerson(row: PersonRow): FollowPerson {
  return {
    id: row.id,
    name: row.name,
    bio: row.bio ?? '',
    avatarUrl: row.avatar_url,
    location: row.show_location ? (row.location ?? '') : '',
    verified: row.is_verified,
    host: row.is_host && row.community_approved,
  };
}

async function peopleByIds(ids: string[]): Promise<FollowPerson[]> {
  if (ids.length === 0) return [];

  const { data } = await supabase.from('profiles').select(PERSON_SELECT).in('id', ids);

  return ((data ?? []) as PersonRow[]).map(toPerson);
}

export async function fetchFollowing(profileId: string): Promise<FollowPerson[]> {
  const { data } = await supabase
    .from('follows')
    .select('followee_id')
    .eq('follower_id', profileId);

  return peopleByIds((data ?? []).map((row) => row.followee_id));
}

export async function fetchFollowers(profileId: string): Promise<FollowPerson[]> {
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('followee_id', profileId);

  return peopleByIds((data ?? []).map((row) => row.follower_id));
}

/**
 * Women she is not following yet.
 *
 * `discoverable` is the setting that keeps someone out of suggestions
 * without hiding her profile from anyone who already knows her.
 */
export async function fetchSuggested(
  profileId: string,
  alreadyFollowing: string[],
): Promise<FollowPerson[]> {
  const { data } = await supabase
    .from('profiles')
    .select(PERSON_SELECT)
    .eq('discoverable', true)
    .neq('id', profileId)
    .limit(40);

  const skip = new Set(alreadyFollowing);

  return ((data ?? []) as PersonRow[]).filter((row) => !skip.has(row.id)).map(toPerson);
}

export async function setFollowing(
  followerId: string,
  followeeId: string,
  following: boolean,
): Promise<void> {
  if (following) {
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, followee_id: followeeId });

    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId);

  if (error) throw error;
}

export async function fetchFollowCounts(
  profileId: string,
): Promise<{ followers: number; following: number }> {
  const [followers, following] = await Promise.all([
    supabase
      .from('follows')
      .select('follower_id', { count: 'exact', head: true })
      .eq('followee_id', profileId),
    supabase
      .from('follows')
      .select('followee_id', { count: 'exact', head: true })
      .eq('follower_id', profileId),
  ]);

  return { followers: followers.count ?? 0, following: following.count ?? 0 };
}

// ---------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------

export type NotificationKind = 'reply' | 'like' | 'follow' | 'event' | 'order' | 'system';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  /** Who caused it. Empty for system notices. */
  actor: string;
  actorAvatarUrl: string | null;
  /** Greek copy, built from the kind and whatever detail came with it. */
  body: string;
  createdAt: string;
  read: boolean;
  target:
    | { screen: 'thread' | 'event' | 'post' | 'chat' | 'community' | 'shop'; id: string }
    | null;
}

interface NotificationRowJoined {
  id: string;
  kind: NotificationKind;
  actor_id: string | null;
  target_kind: 'thread' | 'event' | 'post' | 'chat' | 'community' | 'shop' | null;
  target_id: string | null;
  detail: string;
  read_at: string | null;
  created_at: string;
  actor: { name: string; avatar_url: string | null } | null;
}

/** The sentence under the actor's name. */
function bodyFor(row: NotificationRowJoined): string {
  const quoted = row.detail.trim().length > 0 ? `«${row.detail.trim()}»` : '';

  switch (row.kind) {
    case 'like':
      return 'έκανε like στη δημοσίευσή σου';
    case 'reply':
      return row.target_kind === 'thread'
        ? `απάντησε στη συζήτηση ${quoted}`.trim()
        : 'σχολίασε τη δημοσίευσή σου';
    case 'follow':
      return 'σε ακολούθησε';
    case 'event':
      return `δήλωσε συμμετοχή στο event ${quoted}`.trim();
    case 'order':
      return 'έκανε παραγγελία από το μαγαζί σου';
    default:
      return row.detail;
  }
}

export async function fetchNotifications(profileId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(
      'id, kind, actor_id, target_kind, target_id, detail, read_at, created_at, actor:profiles!notifications_actor_id_fkey (name, avatar_url)',
    )
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(60);

  if (error || !data) throw error ?? new Error('notifications unavailable');

  return (data as unknown as NotificationRowJoined[]).map((row) => ({
    id: row.id,
    kind: row.kind,
    actor: row.actor?.name ?? '',
    actorAvatarUrl: row.actor?.avatar_url ?? null,
    body: bodyFor(row),
    createdAt: row.created_at,
    read: row.read_at !== null,
    target:
      row.target_kind && row.target_id
        ? { screen: row.target_kind, id: row.target_id }
        : null,
  }));
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);
}

export async function markAllNotificationsRead(profileId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('profile_id', profileId)
    .is('read_at', null);
}
