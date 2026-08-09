/**
 * Rewards Club (spec §7 screen 13).
 *
 * Points are earned by taking part — posting, replying, attending events.
 * Rewards are giveaways and partner offers published by the official
 * account; KousKous never handles money for them, it only hands over a
 * code (spec §9).
 */

export interface RewardsLevel {
  id: string;
  name: string;
  /** Points needed to reach it. */
  threshold: number;
  perk: string;
}

/** Ordered from lowest to highest; the screen derives progress from this. */
export const rewardsLevels: RewardsLevel[] = [
  { id: 'rose', name: 'Rose', threshold: 0, perk: 'Πρόσβαση σε μηνιαία giveaways' },
  { id: 'gold', name: 'Gold', threshold: 500, perk: 'Προτεραιότητα σε sold-out events' },
  { id: 'diamond', name: 'Diamond', threshold: 1500, perk: 'Προσκλήσεις σε κλειστά events' },
];

export interface PointsEntry {
  id: string;
  label: string;
  points: number;
  timeAgo: string;
}

export const pointsHistory: PointsEntry[] = [
  { id: 'p1', label: 'Συμμετοχή στο «Wine & Talk Night»', points: 120, timeAgo: '3 ημέρες' },
  { id: 'p2', label: 'Απάντηση σε συζήτηση', points: 15, timeAgo: '4 ημέρες' },
  { id: 'p3', label: 'Νέο θέμα στο Beauty', points: 30, timeAgo: '1 εβδομάδα' },
  { id: 'p4', label: 'Συνδρομή μέλους', points: 200, timeAgo: '2 εβδομάδες' },
];

export type RewardStatus = 'available' | 'entered' | 'locked';

export interface Reward {
  id: string;
  title: string;
  partner: string;
  /** Points spent to enter, or 0 for free giveaways. */
  cost: number;
  ends: string;
  status: RewardStatus;
  /** Card tint, matching the flat placeholders used elsewhere. */
  tint: string;
}

export const rewards: Reward[] = [
  {
    id: 'r1',
    title: 'Δωρεάν Spa Day για δύο',
    partner: 'Amara Wellness',
    cost: 0,
    ends: 'Λήγει σε 2 μέρες',
    status: 'available',
    tint: '#F5E6BE',
  },
  {
    id: 'r2',
    title: '-30% σε Beauty Box',
    partner: 'GlowBox Greece',
    cost: 150,
    ends: 'Έως 31 Αυγ',
    status: 'available',
    tint: '#FBE1E9',
  },
  {
    id: 'r3',
    title: 'Δωρεάν καφές κάθε Δευτέρα',
    partner: 'Mokka Coffee Roasters',
    cost: 80,
    ends: 'Έως 30 Σεπ',
    status: 'entered',
    tint: '#EADFF0',
  },
  {
    id: 'r4',
    title: 'Weekend στη Σαντορίνη',
    partner: 'KousKous Official',
    cost: 1000,
    ends: 'Λήγει σε 12 μέρες',
    status: 'locked',
    tint: '#DCEAF5',
  },
];

/** Points the signed-in member currently holds. */
export const memberPoints = 365;

/** The level reached, and the next one to aim at. */
export function levelFor(points: number): { current: RewardsLevel; next: RewardsLevel | null } {
  let index = 0;
  for (let i = 0; i < rewardsLevels.length; i += 1) {
    if (points >= rewardsLevels[i].threshold) index = i;
  }
  return {
    current: rewardsLevels[index],
    next: rewardsLevels[index + 1] ?? null,
  };
}
