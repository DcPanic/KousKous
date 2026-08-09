/**
 * Database shape, mirroring supabase/migrations/0001_init.sql.
 *
 * Hand-written rather than generated, because generating requires the
 * Supabase CLI against the live project. Keep it in step with the
 * migrations by hand — the client is typed against it, so a mismatch
 * shows up as a TypeScript error rather than a runtime surprise.
 */

export interface ProfileRow {
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

export interface PostRow {
  id: string;
  author_id: string;
  caption: string;
  hashtags: string;
  location: string | null;
  category_id: string | null;
  created_at: string;
}

export interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface ThreadRow {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  body: string;
  location: string | null;
  pinned: boolean;
  created_at: string;
}

export interface ThreadReplyRow {
  id: string;
  thread_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface EventRow {
  id: string;
  host_id: string;
  title: string;
  description: string;
  category_id: string | null;
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

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  media_path: string | null;
  created_at: string;
}

export interface RewardRow {
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
      posts: Table<PostRow, 'id' | 'created_at' | 'caption' | 'hashtags'>;
      comments: Table<CommentRow, 'id' | 'created_at'>;
      threads: Table<ThreadRow, 'id' | 'created_at' | 'body' | 'pinned'>;
      thread_replies: Table<ThreadReplyRow, 'id' | 'created_at' | 'body'>;
      events: Table<EventRow, 'id' | 'created_at' | 'description' | 'is_official'>;
      messages: Table<MessageRow, 'id' | 'created_at' | 'body'>;
      rewards: Table<RewardRow, 'id' | 'created_at'>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
