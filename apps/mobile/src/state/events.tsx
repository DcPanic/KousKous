import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { events as seededEvents } from '@/data/mock';
import { findEventDetail } from '@/data/event-detail';
import {
  fetchJoinedEventIds,
  fetchUpcomingEvents,
  setJoined as writeJoined,
  type EventSummary,
  type NewEvent,
  createEvent,
} from '@/lib/events-repo';
import { useSession } from '@/state/session';

/**
 * Events.
 *
 * Signed in, everything comes from the database. Signed out, the seeded
 * events stand in so a woman who has not signed up yet sees what is on
 * rather than an empty screen — the same rule the feed follows.
 */

interface EventsValue {
  events: EventSummary[];
  loading: boolean;
  error: boolean;
  refresh: () => Promise<void>;

  hasJoined: (eventId: string) => boolean;
  /** Returns false when joining was refused — a full or members-only event. */
  toggleJoined: (eventId: string) => Promise<boolean>;

  /** Returns the new event's id, or null when it could not be saved. */
  publish: (input: NewEvent) => Promise<string | null>;
}

const EventsContext = createContext<EventsValue | null>(null);

/** The seeded events, widened to the shape the real ones use. */
const PREVIEW: EventSummary[] = seededEvents.map((event) => {
  const detail = findEventDetail(event.id);

  return {
    id: event.id,
    hostId: '',
    title: event.title,
    description: detail?.description ?? '',
    isoDate: event.isoDate,
    time: event.time,
    location: event.location,
    venue: detail?.venue ?? '',
    categoryId: event.categoryId,
    subcategoryId: null,
    price: event.price,
    spotsTaken: event.spotsTaken,
    spotsTotal: event.spotsTotal,
    isOfficial: event.isOfficial,
    hostName: detail?.hostName ?? 'KousKous',
    hostVerified: detail?.hostVerified ?? false,
    hostAvatarUrl: null,
  };
});

export function EventsProvider({ children }: { children: ReactNode }) {
  const { user, signedIn, ready } = useSession();

  const [remote, setRemote] = useState<EventSummary[] | null>(null);
  const [joined, setJoinedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    if (!signedIn) return;

    setLoading(true);
    setError(false);

    try {
      const [list, mine] = await Promise.all([
        fetchUpcomingEvents(),
        fetchJoinedEventIds(user.id),
      ]);

      setRemote(list);
      setJoinedIds(mine);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [signedIn, user.id]);

  useEffect(() => {
    if (!ready) return;

    if (signedIn) {
      void refresh();
    } else {
      setRemote(null);
      setJoinedIds([]);
    }
  }, [ready, signedIn, refresh]);

  const toggleJoined = useCallback(
    async (eventId: string) => {
      const next = !joined.includes(eventId);

      // Signed out there is nowhere to write, but the preview should
      // still show what joining feels like.
      if (!signedIn) {
        setJoinedIds((prev) =>
          next ? [...prev, eventId] : prev.filter((id) => id !== eventId),
        );
        return true;
      }

      try {
        await writeJoined(eventId, user.id, next);
      } catch {
        // The policy refused it — a KousKous event and a free account, or
        // a row that no longer exists. Leave the state untouched.
        return false;
      }

      setJoinedIds((prev) => (next ? [...prev, eventId] : prev.filter((id) => id !== eventId)));
      // The seat count on the card changes for everyone, so re-read it.
      void refresh();
      return true;
    },
    [joined, signedIn, user.id, refresh],
  );

  const publish = useCallback(
    async (input: NewEvent) => {
      if (!signedIn) return null;

      try {
        const id = await createEvent(user.id, input);
        await refresh();
        return id;
      } catch {
        return null;
      }
    },
    [signedIn, user.id, refresh],
  );

  const value = useMemo<EventsValue>(
    () => ({
      events: remote ?? PREVIEW,
      loading,
      error,
      refresh,
      hasJoined: (eventId: string) => joined.includes(eventId),
      toggleJoined,
      publish,
    }),
    [remote, loading, error, refresh, joined, toggleJoined, publish],
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsValue {
  const value = useContext(EventsContext);
  if (!value) throw new Error('useEvents must be used inside an EventsProvider');
  return value;
}
