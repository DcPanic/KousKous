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

/**
 * The two privacy switches that change what other women can see.
 *
 * `show_location` hides her city from her profile; `discoverable` keeps
 * her out of the suggestion lists without hiding her from anyone who
 * already follows or messages her.
 */
export async function setPrivacy(
  profileId: string,
  next: { showLocation?: boolean; discoverable?: boolean },
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...(next.showLocation !== undefined ? { show_location: next.showLocation } : {}),
      ...(next.discoverable !== undefined ? { discoverable: next.discoverable } : {}),
    })
    .eq('id', profileId);

  if (error) throw error;
}

/**
 * Women matching a search term.
 *
 * The match runs in Postgres rather than over a downloaded directory, so
 * it works with any number of accounts. `discoverable` is honoured: a
 * woman who has switched it off stays out of results without her profile
 * becoming unreachable to anyone who already has her link. Blocked
 * accounts never come back at all — `profiles_select` sees to that.
 *
 * ilike, not full-text search: Greek accents and the two-case rule make a
 * text-search configuration a bigger decision than this screen needs, and
 * the pattern below already matches the way women type.
 */
export async function searchProfiles(term: string, limit = 5): Promise<PublicProfile[]> {
  const pattern = `%${term.replace(/[%_]/g, '')}%`;

  const { data } = await supabase
    .from('profiles')
    .select(
      'id, name, bio, avatar_url, location, is_verified, is_host, community_approved, is_official, show_location, created_at',
    )
    .eq('discoverable', true)
    .or(`name.ilike.${pattern},bio.ilike.${pattern}`)
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    bio: row.bio ?? '',
    avatarUrl: row.avatar_url,
    location: row.show_location ? (row.location ?? '') : '',
    verified: row.is_verified,
    host: row.is_host && row.community_approved,
    official: row.is_official,
    joined: joinedLabel(row.created_at),
  }));
}
