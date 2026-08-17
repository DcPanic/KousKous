/**
 * Reading other women's profiles.
 *
 * `profiles_select` already hides anyone either side has blocked, so a
 * blocked profile comes back as nothing rather than as an error.
 */

import { supabase } from '@/lib/supabase';

export interface PublicProfile {
  id: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  location: string;
  verified: boolean;
  host: boolean;
  official: boolean;
  /** Month and year she joined, as the profile shows it. */
  joined: string;
}

const MONTHS = [
  'Ιανουάριο',
  'Φεβρουάριο',
  'Μάρτιο',
  'Απρίλιο',
  'Μάιο',
  'Ιούνιο',
  'Ιούλιο',
  'Αύγουστο',
  'Σεπτέμβριο',
  'Οκτώβριο',
  'Νοέμβριο',
  'Δεκέμβριο',
];

function joinedLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export async function fetchProfile(id: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'id, name, bio, avatar_url, location, is_verified, is_host, community_approved, is_official, show_location, created_at',
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    bio: data.bio ?? '',
    // Already a full public URL: edit-profile stores it that way after
    // uploading, so it can be handed straight to <Image>.
    avatarUrl: data.avatar_url,
    // She can hide where she lives; the profile then simply omits it.
    location: data.show_location ? (data.location ?? '') : '',
    verified: data.is_verified,
    host: data.is_host && data.community_approved,
    official: data.is_official,
    joined: joinedLabel(data.created_at),
  };
}

/** How many posts she has published. */
export async function fetchPostCount(profileId: string): Promise<number> {
  const { count } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', profileId);

  return count ?? 0;
}
