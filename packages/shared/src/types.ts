/**
 * Domain entities (master prompt §8).
 *
 * These mirror the intended Postgres schema. Field names use snake_case to
 * match the database columns so rows can be handed straight to the UI
 * without a mapping layer.
 */

import type { CategoryGroup } from './categories';

export type PostType = 'text' | 'image' | 'video' | 'story' | 'reel' | 'voice' | 'poll';
export type EngagementType = 'like' | 'comment' | 'share' | 'save';
export type EventStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type TicketStatus = 'reserved' | 'paid' | 'checked_in' | 'refunded' | 'cancelled';

export interface User {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  /** Home city — a location id from `locations.ts`. */
  location: string | null;

  is_paid_member: boolean;
  paid_until: string | null;

  /**
   * Host status is a flag on a normal user, not a separate entity.
   * `community_approved` and `payment_verified` are independent gates:
   * a host may be approved but unable to charge for events until their
   * payment account is verified.
   */
  is_host: boolean;
  community_approved: boolean;
  payment_verified: boolean;
  payment_provider_account_id: string | null;

  /** The single internal KousKous account. Renders a gold Official badge. */
  is_official: boolean;
  /** Ordinary blue-style verification, unrelated to `is_official`. */
  is_verified: boolean;

  /** Whether her city is shown on her profile to other women. */
  show_location: boolean;
  /** Whether she appears in suggestion lists. Never hides her profile. */
  discoverable: boolean;

  created_at: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  emoji: string;
  group: CategoryGroup;
}

export interface UserFollowsCategory {
  user_id: string;
  category_id: string;
}

export interface Post {
  id: string;
  author_id: string;
  type: PostType;
  content: string;
  media_urls: string[];
  hashtags: string[];
  /** Location id, used by the location filter. */
  location: string | null;
  category_id: string | null;
  created_at: string;
}

export interface PostEngagement {
  post_id: string;
  user_id: string;
  type: EngagementType;
  /** Populated only when `type` is 'comment'. */
  content: string | null;
}

export interface Event {
  id: string;
  /** Null for official events, which are owned by the platform account. */
  host_id: string | null;
  is_official: boolean;
  sponsor: string | null;

  title: string;
  description: string;
  cover_url: string | null;
  location: string;
  lat: number | null;
  lng: number | null;
  date: string;
  time: string;

  max_participants: number | null;
  /** Zero means a free event, which unverified hosts may still create. */
  price: number;
  currency: string;
  status: EventStatus;

  created_at: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  user_id: string;
  qr_code: string;
  status: TicketStatus;
  amount: number;
  payment_provider_txn_id: string | null;
  purchased_at: string;
}

export interface EventReview {
  id: string;
  event_id: string;
  user_id: string;
  host_rating: number;
  event_rating: number;
  organization_rating: number;
  location_rating: number;
  value_rating: number;
  comment: string | null;
}

export interface Giveaway {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  starts_at: string;
  ends_at: string;
  entries_count: number;
}

export interface Announcement {
  id: string;
  text: string;
  sent_at: string;
  reach_count: number;
}
