/**
 * Feature gating (master prompt §3).
 *
 * The feature matrix lives here so the app and the admin panel can never
 * drift apart on who is allowed to do what. UI code should ask
 * `accessFor(...)` rather than checking `is_paid_member` inline.
 */

import type { User } from './types';

export const PAID_MEMBER_PRICE_EUR = 3.99;
export const HOST_PRICE_MIN_EUR = 39.99;
export const HOST_PRICE_MAX_EUR = 49.99;

/** Copy for the paywall CTA, kept next to the price it quotes. */
export const paidMemberCta = `Γίνε μέλος · €${PAID_MEMBER_PRICE_EUR.toFixed(2).replace('.', ',')}/μήνα`;

export type Feature =
  | 'profile'
  | 'feed'
  | 'engagement'
  | 'stories'
  | 'forums_view'
  | 'forums_participate'
  | 'chat'
  | 'events_view'
  | 'follow_categories'
  | 'rewards'
  | 'create_events'
  | 'run_shop'
  | 'host_dashboard'
  | 'official_dashboard';

/**
 * - `allowed`  — render normally.
 * - `preview`  — render the content behind a blur + lock overlay with an
 *                upgrade CTA. Used for Forums and Events on free accounts.
 * - `locked`   — do not render the surface at all.
 */
export type Access = 'allowed' | 'preview' | 'locked';

export type AccountTier = 'free' | 'paid' | 'host' | 'official';

/**
 * Resolve the effective tier. Host and official both imply paid-member
 * capabilities, so the tiers are checked most-privileged first.
 */
export function accountTier(user: Pick<User, 'is_official' | 'is_host' | 'community_approved' | 'is_paid_member'>): AccountTier {
  if (user.is_official) return 'official';
  if (user.is_host && user.community_approved) return 'host';
  if (user.is_paid_member) return 'paid';
  return 'free';
}

const MEMBER_ONLY: Feature[] = ['forums_participate', 'follow_categories', 'rewards'];

/** Free accounts see these surfaces, but blurred behind a lock overlay. */
const PREVIEW_FOR_FREE: Feature[] = ['forums_view'];

const ALWAYS_ALLOWED: Feature[] = [
  'profile',
  'feed',
  'engagement',
  'stories',
  // Events are open to everyone: what a subscription buys is the forums,
  // the KousKous events and the rewards — not the events other women run.
  'events_view',
  // Messaging is how women who met at an event stay in touch. Charging
  // for it would cut the community at exactly the point it forms.
  'chat',
];

export function accessFor(
  user: Pick<User, 'is_official' | 'is_host' | 'community_approved' | 'is_paid_member'>,
  feature: Feature,
): Access {
  const tier = accountTier(user);

  if (ALWAYS_ALLOWED.includes(feature)) return 'allowed';

  if (feature === 'official_dashboard') {
    return tier === 'official' ? 'allowed' : 'locked';
  }

  if (feature === 'host_dashboard' || feature === 'create_events' || feature === 'run_shop') {
    return tier === 'host' || tier === 'official' ? 'allowed' : 'locked';
  }

  if (PREVIEW_FOR_FREE.includes(feature)) {
    return tier === 'free' ? 'preview' : 'allowed';
  }

  if (MEMBER_ONLY.includes(feature)) {
    return tier === 'free' ? 'locked' : 'allowed';
  }

  return 'locked';
}

export function can(
  user: Pick<User, 'is_official' | 'is_host' | 'community_approved' | 'is_paid_member'>,
  feature: Feature,
): boolean {
  return accessFor(user, feature) === 'allowed';
}

/**
 * Whether a shop can actually take money.
 *
 * Opening a shop and listing products only needs community approval;
 * selling needs the payment account too. The two gates are independent,
 * exactly as they are for paid events (§2.3), so a newly approved host
 * can set her shop up while the Stripe onboarding is still in progress.
 */
export function canSell(
  user: Pick<User, 'is_host' | 'community_approved' | 'payment_verified' | 'is_official'>,
): boolean {
  return canCreatePaidEvents(user);
}

/**
 * Who may take part in an event.
 *
 * Events run by hosts are open to every account, free ones included —
 * they are the hosts' livelihood and the reason many women arrive. Only
 * the events KousKous itself runs are a subscription benefit, alongside
 * the forums and the rewards.
 */
export function canJoinEvent(
  user: Pick<User, 'is_official' | 'is_host' | 'community_approved' | 'is_paid_member'>,
  event: { is_official: boolean },
): boolean {
  if (!event.is_official) return true;
  return accountTier(user) !== 'free';
}

/**
 * Community approval and payment verification are independent gates.
 * An approved host with no verified payment account may still run events,
 * but only free ones.
 */
export function canCreatePaidEvents(
  user: Pick<User, 'is_host' | 'community_approved' | 'payment_verified' | 'is_official'>,
): boolean {
  if (user.is_official) return true;
  return user.is_host && user.community_approved && user.payment_verified;
}
