import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { emptyDateRange, hasDateRange, type DateRange, type PriceBand } from '@kouskous/shared';
import type { ForumReply, ForumThread } from '@/data/forum';
import { conversations, type ChatMessage } from '@/data/chat';
import { notifications } from '@/data/notifications';
import { fetchMyReactions, setLike, setSaved } from '@/lib/posts-repo';
import { usePersistedStringList } from '@/lib/use-persisted-list';
import { useSession } from '@/state/session';

/** Which screen's filters are being counted or cleared. */
export type FilterSurface = 'feed' | 'forum' | 'events';

const DEFAULT_FOLLOWS = ['beauty', 'travel'];

/**
 * Cross-screen UI state: the drawer, the location filter, category
 * follows, saved threads, and anything the user posts during the session.
 *
 * The location filter deliberately lives above the tab navigator because
 * it applies to the Feed, Forums and Events alike (spec §4). Posted
 * content is kept in memory so the app behaves like the real thing before
 * Supabase exists; it is lost on reload, which is expected for now.
 */

interface AppStateValue {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;

  /** Empty means "everywhere" — no filtering is applied. */
  selectedPlaces: string[];
  togglePlace: (id: string) => void;

  /** Event-only filters, ignored by the feed and forums. */
  eventCategoryIds: string[];
  toggleEventCategory: (id: string) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  priceBand: PriceBand;
  setPriceBand: (band: PriceBand) => void;
  availableOnly: boolean;
  setAvailableOnly: (value: boolean) => void;

  /** How many filters are currently narrowing the given surface. */
  activeFilterCount: (surface: FilterSurface) => number;
  clearFilters: (surface: FilterSurface) => void;

  followedCategories: string[];
  isFollowing: (categoryId: string) => boolean;
  toggleFollow: (categoryId: string) => void;

  /** Events the user said yes to. */
  joinedEventIds: string[];
  hasJoined: (eventId: string) => boolean;
  toggleJoined: (eventId: string) => void;

  /** Women she blocked and posts she reported, by author name. */
  blockedNames: string[];
  isBlocked: (name: string) => boolean;
  toggleBlocked: (name: string) => void;
  reportedPostIds: string[];
  reportPost: (postId: string) => void;

  /** Posts she liked, and posts she bookmarked. */
  likedPostIds: string[];
  hasLiked: (postId: string) => boolean;
  toggleLike: (postId: string) => void;
  savedPostIds: string[];
  isPostSaved: (postId: string) => boolean;
  toggleSavedPost: (postId: string) => void;

  /** Threads the user keeps, so she can return to the conversation. */
  savedThreadIds: string[];
  isSaved: (threadId: string) => boolean;
  toggleSaved: (threadId: string) => void;

  /** Threads started in this session, newest first. */
  createdThreads: ForumThread[];
  addThread: (thread: ForumThread) => void;

  repliesFor: (threadId: string) => ForumReply[];
  addReply: (threadId: string, reply: ForumReply) => void;

  /** Messages sent in this session, per conversation. */
  sentMessages: (conversationId: string) => ChatMessage[];
  sendMessage: (conversationId: string, message: ChatMessage) => void;

  /** Notifications she has already seen, and the resulting badge count. */
  readNotificationIds: string[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  /** Conversations she has opened, and the resulting badge count. */
  readConversationIds: string[];
  unreadMessageCount: number;
  markConversationRead: (id: string) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { user, signedIn } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [eventCategoryIds, setEventCategoryIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>(emptyDateRange);
  const [priceBand, setPriceBand] = useState<PriceBand>('any');
  const [availableOnly, setAvailableOnly] = useState(false);
  // Everything below outlives a reload; the rest is session content that
  // belongs in the database once it exists.
  const [followedCategories, setFollowedCategories] = usePersistedStringList(
    'followedCategories',
    DEFAULT_FOLLOWS,
  );
  const [savedThreadIds, setSavedThreadIds] = usePersistedStringList('savedThreads');
  const [joinedEventIds, setJoinedEventIds] = usePersistedStringList('joinedEvents');
  const [likedPostIds, setLikedPostIds] = usePersistedStringList('likedPosts');
  const [savedPostIds, setSavedPostIds] = usePersistedStringList('savedPosts');
  const [blockedNames, setBlockedNames] = usePersistedStringList('blockedNames');
  const [reportedPostIds, setReportedPostIds] = usePersistedStringList('reportedPosts');
  const [readNotificationIds, setReadNotificationIds] = usePersistedStringList('readNotifications');
  const [readConversationIds, setReadConversationIds] = usePersistedStringList('readConversations');
  const [createdThreads, setCreatedThreads] = useState<ForumThread[]>([]);
  const [replies, setReplies] = useState<Record<string, ForumReply[]>>({});
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const togglePlace = useCallback((id: string) => {
    setSelectedPlaces((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const toggleEventCategory = useCallback((id: string) => {
    setEventCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const activeFilterCount = useCallback(
    (surface: FilterSurface) => {
      // Place is the only filter the feed and forums use; the rest are
      // event concepts and would otherwise inflate their badge.
      let count = selectedPlaces.length;
      if (surface !== 'events') return count;

      count += eventCategoryIds.length;
      if (hasDateRange(dateRange)) count += 1;
      if (priceBand !== 'any') count += 1;
      if (availableOnly) count += 1;
      return count;
    },
    [selectedPlaces, eventCategoryIds, dateRange, priceBand, availableOnly],
  );

  const clearFilters = useCallback((surface: FilterSurface) => {
    setSelectedPlaces([]);
    if (surface !== 'events') return;
    setEventCategoryIds([]);
    setDateRange(emptyDateRange);
    setPriceBand('any');
    setAvailableOnly(false);
  }, []);

  const toggleFollow = useCallback((categoryId: string) => {
    setFollowedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((item) => item !== categoryId)
        : [...prev, categoryId],
    );
  }, []);

  const toggleJoined = useCallback((eventId: string) => {
    setJoinedEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((item) => item !== eventId) : [eventId, ...prev],
    );
  }, []);

  const toggleBlocked = useCallback((name: string) => {
    setBlockedNames((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [name, ...prev],
    );
  }, []);

  const reportPost = useCallback((postId: string) => {
    setReportedPostIds((prev) => (prev.includes(postId) ? prev : [postId, ...prev]));
  }, []);

  // The list updates immediately and the write follows; a failed write
  // is corrected by the next hydration rather than by blocking the tap.
  const toggleLike = useCallback(
    (postId: string) => {
      const liked = !likedPostIds.includes(postId);
      setLikedPostIds((prev) =>
        liked ? [postId, ...prev] : prev.filter((item) => item !== postId),
      );
      if (signedIn) void setLike(postId, user.id, liked).catch(() => undefined);
    },
    [likedPostIds, setLikedPostIds, signedIn, user.id],
  );

  const toggleSavedPost = useCallback(
    (postId: string) => {
      const saved = !savedPostIds.includes(postId);
      setSavedPostIds((prev) =>
        saved ? [postId, ...prev] : prev.filter((item) => item !== postId),
      );
      if (signedIn) void setSaved(postId, user.id, saved).catch(() => undefined);
    },
    [savedPostIds, setSavedPostIds, signedIn, user.id],
  );

  // Her real likes and saves replace the locally cached ones on sign-in.
  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;

    void (async () => {
      try {
        const reactions = await fetchMyReactions(user.id);
        if (cancelled) return;
        setLikedPostIds(reactions.liked);
        setSavedPostIds(reactions.saved);
      } catch {
        // Keep the cached lists; they are a reasonable approximation.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [signedIn, user.id, setLikedPostIds, setSavedPostIds]);

  const toggleSaved = useCallback((threadId: string) => {
    setSavedThreadIds((prev) =>
      prev.includes(threadId) ? prev.filter((item) => item !== threadId) : [threadId, ...prev],
    );
  }, []);

  const addThread = useCallback((thread: ForumThread) => {
    setCreatedThreads((prev) => [thread, ...prev]);
  }, []);

  const addReply = useCallback((threadId: string, reply: ForumReply) => {
    setReplies((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), reply] }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setReadNotificationIds((prev) => (prev.includes(id) ? prev : [id, ...prev]));
  }, [setReadNotificationIds]);

  const markAllNotificationsRead = useCallback(() => {
    setReadNotificationIds(notifications.map((notification) => notification.id));
  }, [setReadNotificationIds]);

  const markConversationRead = useCallback((id: string) => {
    setReadConversationIds((prev) => (prev.includes(id) ? prev : [id, ...prev]));
  }, [setReadConversationIds]);

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.read && !readNotificationIds.includes(notification.id),
  ).length;

  const unreadMessageCount = conversations
    .filter((conversation) => !readConversationIds.includes(conversation.id))
    .reduce((sum, conversation) => sum + conversation.unread, 0);

  const sendMessage = useCallback((conversationId: string, message: ChatMessage) => {
    setMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] ?? []), message],
    }));
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      drawerOpen,
      openDrawer,
      closeDrawer,
      selectedPlaces,
      togglePlace,
      eventCategoryIds,
      toggleEventCategory,
      dateRange,
      setDateRange,
      priceBand,
      setPriceBand,
      availableOnly,
      setAvailableOnly,
      activeFilterCount,
      clearFilters,
      followedCategories,
      isFollowing: (categoryId: string) => followedCategories.includes(categoryId),
      toggleFollow,
      joinedEventIds,
      hasJoined: (eventId: string) => joinedEventIds.includes(eventId),
      toggleJoined,
      blockedNames,
      isBlocked: (name: string) => blockedNames.includes(name),
      toggleBlocked,
      reportedPostIds,
      reportPost,
      likedPostIds,
      hasLiked: (postId: string) => likedPostIds.includes(postId),
      toggleLike,
      savedPostIds,
      isPostSaved: (postId: string) => savedPostIds.includes(postId),
      toggleSavedPost,
      savedThreadIds,
      isSaved: (threadId: string) => savedThreadIds.includes(threadId),
      toggleSaved,
      createdThreads,
      addThread,
      repliesFor: (threadId: string) => replies[threadId] ?? [],
      addReply,
      sentMessages: (conversationId: string) => messages[conversationId] ?? [],
      sendMessage,
      readNotificationIds,
      unreadNotificationCount,
      markNotificationRead,
      markAllNotificationsRead,
      readConversationIds,
      unreadMessageCount,
      markConversationRead,
    }),
    [
      drawerOpen,
      openDrawer,
      closeDrawer,
      selectedPlaces,
      togglePlace,
      eventCategoryIds,
      toggleEventCategory,
      dateRange,
      priceBand,
      availableOnly,
      activeFilterCount,
      clearFilters,
      followedCategories,
      toggleFollow,
      joinedEventIds,
      toggleJoined,
      blockedNames,
      toggleBlocked,
      reportedPostIds,
      reportPost,
      likedPostIds,
      toggleLike,
      savedPostIds,
      toggleSavedPost,
      savedThreadIds,
      toggleSaved,
      createdThreads,
      addThread,
      replies,
      addReply,
      messages,
      sendMessage,
      readNotificationIds,
      unreadNotificationCount,
      markNotificationRead,
      markAllNotificationsRead,
      readConversationIds,
      unreadMessageCount,
      markConversationRead,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside an AppStateProvider');
  return value;
}
