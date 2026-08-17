/**
 * Reading and writing events.
 *
 * Reads go through the `events_public` view, which carries the host's
 * name and the real attendee count (see 0007_events_public.sql). Writes
 * go to the `events` table itself, where the host gates live.
 */

import type { Attachment } from '@/data/forum';
import { signedMediaUrls, toUploadable } from '@/lib/storage-media';
import { supabase } from '@/lib/supabase';

const EVENT_SELECT = `
  id, host_id, title, description, category_id, subcategory_id, location, venue,
  starts_at, price_cents, spots_total, spots_taken, members_only, cover_path,
  is_official, host_name, host_verified, host_avatar_url
`;

interface EventPublicRow {
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
  spots_taken: number;
  members_only: boolean;
  cover_path: string | null;
  is_official: boolean;
  host_name: string;
  host_verified: boolean;
  host_avatar_url: string | null;
}

export interface EventSummary {
  id: string;
  hostId: string;
  title: string;
  description: string;
  /** yyyy-mm-dd, so the date filters can compare as strings. */
  isoDate: string;
  /** HH:MM in the local timezone. */
  time: string;
  location: string;
  venue: string;
  categoryId: string;
  subcategoryId: string | null;
  /** Euros, because that is what the cards and filters work in. */
  price: number;
  spotsTaken: number;
  spotsTotal: number;
  isOfficial: boolean;
  hostName: string;
  hostVerified: boolean;
  hostAvatarUrl: string | null;
  coverUrl?: string;
}

/**
 * starts_at is a timestamptz, so the device's own timezone decides the
 * date and time shown — an event at 00:30 in Athens must not read as the
 * previous day.
 */
function splitLocal(startsAt: string): { isoDate: string; time: string } {
  const date = new Date(startsAt);
  const pad = (value: number) => String(value).padStart(2, '0');

  return {
    isoDate: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

function toEvent(row: EventPublicRow, urls: Map<string, string>): EventSummary {
  const { isoDate, time } = splitLocal(row.starts_at);

  return {
    id: row.id,
    hostId: row.host_id,
    title: row.title,
    description: row.description,
    isoDate,
    time,
    location: row.location,
    venue: row.venue ?? '',
    categoryId: row.category_id ?? '',
    subcategoryId: row.subcategory_id,
    price: row.price_cents / 100,
    spotsTaken: row.spots_taken,
    spotsTotal: row.spots_total,
    isOfficial: row.is_official,
    hostName: row.host_name,
    hostVerified: row.host_verified,
    hostAvatarUrl: row.host_avatar_url,
    coverUrl: row.cover_path ? urls.get(row.cover_path) : undefined,
  };
}

async function withCovers(rows: EventPublicRow[]): Promise<EventSummary[]> {
  const urls = await signedMediaUrls(
    rows.map((row) => row.cover_path).filter((path): path is string => Boolean(path)),
  );

  return rows.map((row) => toEvent(row, urls));
}

/**
 * Every event that has not happened yet, soonest first.
 *
 * Past events are dropped here rather than in the screen so the filters
 * never have to reason about them.
 */
export async function fetchUpcomingEvents(): Promise<EventSummary[]> {
  const { data, error } = await supabase
    .from('events_public')
    .select(EVENT_SELECT)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(100);

  if (error || !data) throw error ?? new Error('events unavailable');

  return withCovers(data as unknown as EventPublicRow[]);
}

export async function fetchEvent(id: string): Promise<EventSummary | null> {
  const { data, error } = await supabase
    .from('events_public')
    .select(EVENT_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return (await withCovers([data as unknown as EventPublicRow]))[0] ?? null;
}

/** A host's own events, past ones included — that is her history. */
export async function fetchHostEvents(hostId: string): Promise<EventSummary[]> {
  const { data, error } = await supabase
    .from('events_public')
    .select(EVENT_SELECT)
    .eq('host_id', hostId)
    .order('starts_at', { ascending: false });

  if (error || !data) throw error ?? new Error('events unavailable');

  return withCovers(data as unknown as EventPublicRow[]);
}

/** Events the signed-in woman has joined. */
export async function fetchJoinedEventIds(profileId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('event_attendees')
    .select('event_id')
    .eq('profile_id', profileId);

  if (error || !data) return [];

  return data.map((row) => row.event_id);
}

/**
 * Join or leave.
 *
 * Who may join is decided by the `attendees_join` policy, not here: host
 * events are open to everyone, KousKous events are a members' benefit.
 */
export async function setJoined(
  eventId: string,
  profileId: string,
  joined: boolean,
): Promise<void> {
  if (joined) {
    const { error } = await supabase
      .from('event_attendees')
      .insert({ event_id: eventId, profile_id: profileId });

    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from('event_attendees')
    .delete()
    .eq('event_id', eventId)
    .eq('profile_id', profileId);

  if (error) throw error;
}

export interface NewEvent {
  title: string;
  description: string;
  categoryId: string | null;
  subcategoryId: string | null;
  location: string;
  venue: string;
  /** The day, as the calendar emits it (an ISO instant at local noon). */
  isoDate: string;
  /** HH:MM as typed by the host, in her own timezone. */
  time: string;
  priceCents: number;
  spotsTotal: number;
  membersOnly: boolean;
  cover?: Attachment;
}

export async function createEvent(hostId: string, input: NewEvent): Promise<string> {
  // Built from local parts so the stored instant matches the wall clock
  // the host typed, whatever timezone she is in. The calendar anchors the
  // day at local noon, so reading its local date parts is safe.
  const day = new Date(input.isoDate);
  const [hours, minutes] = input.time.split(':').map(Number);
  const startsAt = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    hours || 0,
    minutes || 0,
  );

  const { data, error } = await supabase
    .from('events')
    .insert({
      host_id: hostId,
      title: input.title,
      description: input.description,
      category_id: input.categoryId,
      subcategory_id: input.subcategoryId,
      location: input.location,
      venue: input.venue,
      starts_at: startsAt.toISOString(),
      price_cents: input.priceCents,
      spots_total: input.spotsTotal,
      members_only: input.membersOnly,
      is_official: false,
    })
    .select('id')
    .single();

  if (error || !data) throw error ?? new Error('event not created');

  if (input.cover?.uri) {
    const path = `${hostId}/events/${data.id}/cover`;
    const blob = await toUploadable(input.cover.uri);

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, blob, { contentType: blob.type || undefined, upsert: true });

    // A failed cover should not throw away the event itself.
    if (!uploadError) {
      await supabase.from('events').update({ cover_path: path }).eq('id', data.id);
    }
  }

  return data.id;
}

/** Mark someone as arrived. Only the host of the event may do this. */
export async function setCheckedIn(
  eventId: string,
  profileId: string,
  checkedIn: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('event_attendees')
    .update({ checked_in_at: checkedIn ? new Date().toISOString() : null })
    .eq('event_id', eventId)
    .eq('profile_id', profileId);

  if (error) throw error;
}

/** The door list, visible only to the host of the event. */
export async function fetchAttendees(
  eventId: string,
): Promise<{ id: string; name: string; avatarUrl: string | null; checkedIn: boolean }[]> {
  const { data, error } = await supabase
    .from('event_attendees')
    .select('profile_id, checked_in_at, profile:profiles!event_attendees_profile_id_fkey (name, avatar_url)')
    .eq('event_id', eventId);

  if (error || !data) return [];

  const rows = data as unknown as {
    profile_id: string;
    checked_in_at: string | null;
    profile: { name: string; avatar_url: string | null } | null;
  }[];

  return rows.map((row) => ({
    id: row.profile_id,
    name: row.profile?.name ?? 'Μέλος',
    avatarUrl: row.profile?.avatar_url ?? null,
    checkedIn: row.checked_in_at !== null,
  }));
}
