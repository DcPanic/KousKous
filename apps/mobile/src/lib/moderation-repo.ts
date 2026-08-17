/**
 * Blocking and reporting.
 *
 * Both were device-local until now, which meant a block did not survive a
 * new phone and a report reached nobody. The tables and policies have
 * been in the schema since the start — this is what finally uses them.
 *
 * Blocking is keyed by profile id, not by name: two women can share a
 * name, and a woman can change hers.
 */

import { supabase } from '@/lib/supabase';

export interface BlockedPerson {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/**
 * Everyone she has blocked.
 *
 * `profiles_select` hides a blocked woman from her, so the names cannot
 * be read back through a join — the ids are fetched first and the names
 * separately, which the block policy does allow through the security
 * definer function it uses.
 */
export async function fetchBlocked(profileId: string): Promise<BlockedPerson[]> {
  const { data } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', profileId);

  const ids = (data ?? []).map((row) => row.blocked_id);
  if (ids.length === 0) return [];

  const { data: people } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', ids);

  const named = new Map((people ?? []).map((row) => [row.id, row]));

  return ids.map((id) => ({
    id,
    // A blocked profile is hidden from her, so the name may not come
    // back. The row still has to be listed, or she could never unblock.
    name: named.get(id)?.name ?? 'Αποκλεισμένος λογαριασμός',
    avatarUrl: named.get(id)?.avatar_url ?? null,
  }));
}

export async function setBlocked(
  blockerId: string,
  blockedId: string,
  blocked: boolean,
): Promise<void> {
  if (blocked) {
    const { error } = await supabase
      .from('blocks')
      .insert({ blocker_id: blockerId, blocked_id: blockedId });

    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);

  if (error) throw error;
}

export interface ReportTarget {
  postId?: string;
  threadId?: string;
  replyId?: string;
  profileId?: string;
}

/**
 * Files a report for the Official account to review.
 *
 * `reports_select` lets a woman read only her own and the Official
 * account read all of them, so filing one is not a message into the void.
 */
export async function reportContent(
  reporterId: string,
  reason: string,
  target: ReportTarget,
): Promise<void> {
  const { error } = await supabase.from('reports').insert({
    reporter_id: reporterId,
    reason,
    post_id: target.postId ?? null,
    thread_id: target.threadId ?? null,
    reply_id: target.replyId ?? null,
    reported_profile_id: target.profileId ?? null,
  });

  if (error) throw error;
}

/** Post ids she has already reported, so the sheet can say so. */
export async function fetchMyReportedPosts(reporterId: string): Promise<string[]> {
  const { data } = await supabase
    .from('reports')
    .select('post_id')
    .eq('reporter_id', reporterId)
    .not('post_id', 'is', null);

  return (data ?? []).map((row) => row.post_id).filter((id): id is string => id !== null);
}
