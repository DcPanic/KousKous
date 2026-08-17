import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchFollowers,
  fetchFollowing,
  fetchNotifications,
  fetchSuggested,
  markAllNotificationsRead as writeAllRead,
  markNotificationRead as writeRead,
  setFollowing as writeFollowing,
  type AppNotification,
  type FollowPerson,
} from '@/lib/social-repo';
import { useSession } from '@/state/session';

/**
 * Who she follows, and what she has been told about.
 *
 * Both are empty signed out rather than seeded: an invented follower list
 * is a claim about real people, and an invented notification is a lie
 * about something that never happened.
 */

interface SocialValue {
  following: FollowPerson[];
  followers: FollowPerson[];
  suggested: FollowPerson[];
  loading: boolean;
  refresh: () => Promise<void>;

  isFollowing: (profileId: string) => boolean;
  toggleFollowing: (profileId: string) => void;

  notifications: AppNotification[];
  unreadNotificationCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const SocialContext = createContext<SocialValue | null>(null);

export function SocialProvider({ children }: { children: ReactNode }) {
  const { user, signedIn, ready } = useSession();

  const [following, setFollowingList] = useState<FollowPerson[]>([]);
  const [followers, setFollowers] = useState<FollowPerson[]>([]);
  const [suggested, setSuggested] = useState<FollowPerson[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!signedIn) return;

    setLoading(true);

    try {
      const [mine, theirs] = await Promise.all([
        fetchFollowing(user.id),
        fetchFollowers(user.id),
      ]);

      setFollowingList(mine);
      setFollowers(theirs);
      setSuggested(await fetchSuggested(user.id, mine.map((person) => person.id)));
    } catch {
      // Keep whatever is on screen.
    } finally {
      setLoading(false);
    }

    try {
      setNotifications(await fetchNotifications(user.id));
    } catch {
      // Same.
    }
  }, [signedIn, user.id]);

  useEffect(() => {
    if (!ready) return;

    if (signedIn) {
      void refresh();
    } else {
      setFollowingList([]);
      setFollowers([]);
      setSuggested([]);
      setNotifications([]);
    }
  }, [ready, signedIn, refresh]);

  const toggleFollowing = useCallback(
    (profileId: string) => {
      if (!signedIn) return;

      const next = !following.some((person) => person.id === profileId);
      const person =
        following.find((item) => item.id === profileId) ??
        suggested.find((item) => item.id === profileId) ??
        followers.find((item) => item.id === profileId);

      // Moved on screen straight away; the lists are re-read after.
      setFollowingList((prev) =>
        next
          ? person
            ? [person, ...prev]
            : prev
          : prev.filter((item) => item.id !== profileId),
      );

      void writeFollowing(user.id, profileId, next)
        .then(() => refresh())
        .catch(() => {
          setFollowingList((prev) =>
            next ? prev.filter((item) => item.id !== profileId) : person ? [person, ...prev] : prev,
          );
        });
    },
    [signedIn, following, suggested, followers, user.id, refresh],
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
    void writeRead(id);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    if (signedIn) void writeAllRead(user.id);
  }, [signedIn, user.id]);

  const value = useMemo<SocialValue>(
    () => ({
      following,
      followers,
      suggested,
      loading,
      refresh,
      isFollowing: (profileId: string) => following.some((person) => person.id === profileId),
      toggleFollowing,
      notifications,
      unreadNotificationCount: notifications.filter((notification) => !notification.read).length,
      markRead,
      markAllRead,
    }),
    [
      following,
      followers,
      suggested,
      loading,
      refresh,
      toggleFollowing,
      notifications,
      markRead,
      markAllRead,
    ],
  );

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

export function useSocial(): SocialValue {
  const value = useContext(SocialContext);
  if (!value) throw new Error('useSocial must be used inside a SocialProvider');
  return value;
}
