/**
 * Database shape, mirroring supabase/migrations/0001_init.sql.
 *
 * The row types are object type aliases, not interfaces: an interface has
 * no implicit index signature, so it fails the library's
 * `Record<string, unknown>` constraint and silently collapses every query
 * type to `never`.
 *
 * Hand-written rather than generated, because generating requires the
 * Supabase CLI against the live project. Keep it in step with the
 * migrations by hand — the client is typed against it, so a mismatch
 * shows up as a TypeScript error rather than a runtime surprise.
 */

export type ProfileRow = {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  is_paid_member: boolean;
  paid_until: string | null;
  is_host: boolean;
  community_approved: boolean;
  payment_verified: boolean;
  payment_provider_account_id: string | null;
  is_official: boolean;
  is_verified: boolean;
  show_location: boolean;
  discoverable: boolean;
  points: number;
  created_at: string;
}

export type PostRow = {
  id: string;
  author_id: string;
  caption: string;
  hashtags: string;
  location: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  created_at: string;
}

export type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export type ThreadRow = {
  id: string;
  category_id: string;
  subcategory_id: string | null;
  author_id: string;
  title: string;
  body: string;
  location: string | null;
  pinned: boolean;
  created_at: string;
}

export type ThreadReplyRow = {
  id: string;
  thread_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export type ThreadMediaRow = {
  id: string;
  /** Set on an opening post; null on a reply. Exactly one of the two. */
  thread_id: string | null;
  reply_id: string | null;
  kind: 'image' | 'video';
  storage_path: string;
  position: number;
};

export type ThreadLikeRow = {
  thread_id: string;
  profile_id: string;
  created_at: string;
};

export type ReplyLikeRow = {
  reply_id: string;
  profile_id: string;
  created_at: string;
};

/** The `forum_stats` view: totals per community, no thread content. */
export type ForumStatsRow = {
  category_id: string;
  thread_count: number;
  reply_count: number;
};

export type EventRow = {
  id: string;
  host_id: string;
  title: string;
  description: string;
  category_id: string | null;
  subcategory_id: string | null;
  location: string;
  venue: string | null;
  starts_at: string;
  price_cents: number;
  spots_total: number;
  members_only: boolean;
  cover_path: string | null;
  is_official: boolean;
  created_at: string;
}

/**
 * The `events_public` view: every event column plus the host's badge and
 * the attendee count, which RLS hides on the base tables.
 */
export type EventPublicRow = EventRow & {
  host_name: string;
  host_verified: boolean;
  host_avatar_url: string | null;
  spots_taken: number;
};

export type PostMediaRow = {
  id: string;
  post_id: string;
  kind: 'image' | 'video';
  storage_path: string;
  position: number;
};

/** Join tables: a composite primary key, no surrogate id. */
export type PostLikeRow = {
  post_id: string;
  profile_id: string;
  created_at: string;
};

export type PostSaveRow = {
  post_id: string;
  profile_id: string;
  created_at: string;
};

export type ThreadSaveRow = {
  thread_id: string;
  profile_id: string;
  created_at: string;
};

export type CategoryFollowRow = {
  profile_id: string;
  category_id: string;
  created_at: string;
};

export type BlockRow = {
  blocker_id: string;
  blocked_id: string;
  created_at: string;
};

export type EventAttendeeRow = {
  event_id: string;
  profile_id: string;
  checked_in_at: string | null;
  created_at: string;
};

export type ReportRow = {
  id: string;
  reporter_id: string;
  reason: string;
  post_id: string | null;
  thread_id: string | null;
  reply_id: string | null;
  reported_profile_id: string | null;
  status: string;
  created_at: string;
};

export type StoryRow = {
  id: string;
  author_id: string;
  kind: 'image' | 'video';
  storage_path: string;
  caption: string;
  created_at: string;
};

export type StoryViewRow = {
  story_id: string;
  viewer_id: string;
  created_at: string;
};

export type ShopRow = {
  id: string;
  host_id: string;
  name: string;
  description: string;
  logo_path: string | null;
  location: string | null;
  is_open: boolean;
  created_at: string;
};

export type ProductRow = {
  id: string;
  shop_id: string;
  title: string;
  description: string;
  price_cents: number;
  stock: number | null;
  category_id: string | null;
  subcategory_id: string | null;
  is_active: boolean;
  created_at: string;
};

export type ProductMediaRow = {
  id: string;
  product_id: string;
  storage_path: string;
  position: number;
};

export type OrderRow = {
  id: string;
  buyer_id: string;
  shop_id: string;
  total_cents: number;
  status: string;
  /** The payment lives on the host's Stripe account, not here. */
  stripe_payment_intent_id: string | null;
  note: string;
  created_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
};

export type FollowRow = {
  follower_id: string;
  followee_id: string;
  created_at: string;
};

export type NotificationRow = {
  id: string;
  profile_id: string;
  kind: 'reply' | 'like' | 'follow' | 'event' | 'order' | 'system';
  actor_id: string | null;
  target_kind: 'thread' | 'event' | 'post' | 'chat' | 'community' | 'shop' | null;
  target_id: string | null;
  detail: string;
  read_at: string | null;
  created_at: string;
};

export type ConversationRow = {
  id: string;
  created_at: string;
};

export type ConversationMemberRow = {
  conversation_id: string;
  profile_id: string;
  /** Null until she opens it for the first time. */
  last_read_at: string | null;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  media_path: string | null;
  created_at: string;
}

export type RewardRow = {
  id: string;
  title: string;
  partner: string;
  cost_points: number;
  min_level: string;
  ends_at: string | null;
  members_only: boolean;
  created_at: string;
}

/** Insert shapes: server-defaulted columns are optional. */
type Insertable<T, Optional extends keyof T> = Omit<T, Optional> & Partial<Pick<T, Optional>>;

type Table<Row, InsertOptional extends keyof Row> = {
  Row: Row;
  Insert: Insertable<Row, InsertOptional>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, Exclude<keyof ProfileRow, 'id' | 'name'>>;
      posts: Table<PostRow, 'id' | 'created_at' | 'caption' | 'hashtags' | 'subcategory_id'>;
      comments: Table<CommentRow, 'id' | 'created_at'>;
      threads: Table<
        ThreadRow,
        'id' | 'created_at' | 'body' | 'pinned' | 'subcategory_id' | 'location'
      >;
      thread_replies: Table<ThreadReplyRow, 'id' | 'created_at' | 'body'>;
      thread_media: Table<ThreadMediaRow, 'id' | 'position' | 'thread_id' | 'reply_id'>;
      thread_likes: Table<ThreadLikeRow, 'created_at'>;
      reply_likes: Table<ReplyLikeRow, 'created_at'>;
      events: Table<
        EventRow,
        | 'id'
        | 'created_at'
        | 'description'
        | 'is_official'
        | 'members_only'
        | 'cover_path'
        | 'venue'
        | 'category_id'
        | 'subcategory_id'
        | 'price_cents'
      >;
      follows: Table<FollowRow, 'created_at'>;
      notifications: Table<
        NotificationRow,
        'id' | 'created_at' | 'detail' | 'read_at' | 'actor_id' | 'target_kind' | 'target_id'
      >;
      conversations: Table<ConversationRow, 'id' | 'created_at'>;
      conversation_members: Table<ConversationMemberRow, 'last_read_at'>;
      messages: Table<MessageRow, 'id' | 'created_at' | 'body' | 'media_path'>;
      rewards: Table<RewardRow, 'id' | 'created_at'>;
      post_media: Table<PostMediaRow, 'id' | 'position'>;
      post_likes: Table<PostLikeRow, 'created_at'>;
      post_saves: Table<PostSaveRow, 'created_at'>;
      thread_saves: Table<ThreadSaveRow, 'created_at'>;
      category_follows: Table<CategoryFollowRow, 'created_at'>;
      blocks: Table<BlockRow, 'created_at'>;
      event_attendees: Table<EventAttendeeRow, 'created_at' | 'checked_in_at'>;
      reports: Table<ReportRow, 'id' | 'created_at' | 'status'>;
      stories: Table<StoryRow, 'id' | 'created_at' | 'caption'>;
      story_views: Table<StoryViewRow, 'created_at'>;
      shops: Table<ShopRow, 'id' | 'created_at' | 'description' | 'is_open' | 'logo_path' | 'location'>;
      products: Table<ProductRow, 'id' | 'created_at' | 'description' | 'is_active'>;
      product_media: Table<ProductMediaRow, 'id' | 'position'>;
      orders: Table<OrderRow, 'id' | 'created_at' | 'status' | 'note' | 'stripe_payment_intent_id'>;
      order_items: Table<OrderItemRow, 'id'>;
    };
    Views: {
      events_public: { Row: EventPublicRow; Relationships: [] };
      forum_stats: { Row: ForumStatsRow; Relationships: [] };
    };
    // The canonical "empty" form used by Supabase's own generated types.
    // Record<string, never> is not assignable to the library's generic
    // schema, which silently degrades every query to `never`.
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
