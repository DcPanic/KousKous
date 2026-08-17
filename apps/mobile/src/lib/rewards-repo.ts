/**
 * Rewards Club: the giveaways, and the points that open them.
 *
 * Points are never written from here. `point_entries` has no insert
 * policy at all — the triggers in 0012_points.sql award and spend them,
 * so a balance is something the app reads, never something it decides.
 */

import { relativeTime } from '@/lib/relative-time';
import { supabase } from '@/lib/supabase';

export interface Reward {
  id: string;
  title: string;
  partner: string;
  description: string;
  /** Points spent to enter; zero for a free giveaway. */
  cost: number;
  minLevel: string;
  /** Already-written Greek, e.g. "Λήγει σε 2 μέρες". Empty when open-ended. */
  ends: string;
  entryCount: number;
  membersOnly: boolean;
}

export interface PointsEntry {
  id: string;
  label: string;
  points: number;
  timeAgo: string;
}

/**
 * "Λήγει σε 2 μέρες" while it is close, a date when it is not — which is
 * the difference between urgency and a diary note.
 */
function endsLabel(endsAt: string | null): string {
  if (!endsAt) return '';

  const days = Math.ceil((new Date(endsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000));

  if (days < 0) return 'Έληξε';
  if (days === 0) return 'Λήγει σήμερα';
  if (days === 1) return 'Λήγει αύριο';
  if (days <= 7) return `Λήγει σε ${days} μέρες`;

  const date = new Date(endsAt);
  const months = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαΐ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];
  return `Έως ${date.getDate()} ${months[date.getMonth()]}`;
}

interface RewardRowJoined {
  id: string;
  title: string;
  partner: string;
  description: string;
  cost_points: number;
  min_level: string;
  ends_at: string | null;
  members_only: boolean;
}

export async function fetchRewards(): Promise<Reward[]> {
  const [rewards, stats] = await Promise.all([
    supabase
      .from('rewards')
      .select('id, title, partner, description, cost_points, min_level, ends_at, members_only')
      .order('created_at', { ascending: false }),
    supabase.from('reward_stats').select('reward_id, entry_count'),
  ]);

  if (rewards.error || !rewards.data) throw rewards.error ?? new Error('rewards unavailable');

  const counts = new Map((stats.data ?? []).map((row) => [row.reward_id, row.entry_count]));

  return (rewards.data as RewardRowJoined[]).map((row) => ({
    id: row.id,
    title: row.title,
    partner: row.partner,
    description: row.description,
    cost: row.cost_points,
    minLevel: row.min_level,
    ends: endsLabel(row.ends_at),
    entryCount: counts.get(row.id) ?? 0,
    membersOnly: row.members_only,
  }));
}

/** Reward ids she has already entered. */
export async function fetchMyEntries(profileId: string): Promise<string[]> {
  const { data } = await supabase
    .from('reward_entries')
    .select('reward_id')
    .eq('profile_id', profileId);

  return (data ?? []).map((row) => row.reward_id);
}

/**
 * Enter a giveaway.
 *
 * The cost is checked and deducted by a trigger, so a refusal here means
 * she genuinely could not afford it — not that the screen guessed wrong.
 */
export async function enterReward(rewardId: string, profileId: string): Promise<void> {
  const { error } = await supabase
    .from('reward_entries')
    .insert({ reward_id: rewardId, profile_id: profileId });

  if (error) throw error;
}

export async function fetchPointsHistory(profileId: string): Promise<PointsEntry[]> {
  const { data, error } = await supabase
    .from('point_entries')
    .select('id, label, points, created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(40);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    label: row.label,
    points: row.points,
    timeAgo: relativeTime(row.created_at),
  }));
}

export interface NewReward {
  title: string;
  partner: string;
  description: string;
  costPoints: number;
  minLevel: string;
  /** ISO instant, or null for an open-ended offer. */
  endsAt: string | null;
  membersOnly: boolean;
}

/** Only the Official account may publish; the policy enforces it. */
export async function createReward(input: NewReward): Promise<string | null> {
  const { data, error } = await supabase
    .from('rewards')
    .insert({
      title: input.title,
      partner: input.partner,
      description: input.description,
      cost_points: input.costPoints,
      min_level: input.minLevel,
      ends_at: input.endsAt,
      members_only: input.membersOnly,
    })
    .select('id')
    .single();

  if (error || !data) return null;

  return data.id;
}
