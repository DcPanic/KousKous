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
      threads: Table<ThreadRow, 'id' | 'created_at' | 'body' | 'pinned'>;
      thread_replies: Table<ThreadReplyRow, 'id' | 'created_at' | 'body'>;
      events: Table<EventRow, 'id' | 'created_at' | 'description' | 'is_official'>;
      messages: Table<MessageRow, 'id' | 'created_at' | 'body'>;
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
    };
    // The canonical "empty" form used by Supabase's own generated types.
    // Record<string, never> is not assignable to the library's generic
    // schema, which silently degrades every query to `never`.
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
