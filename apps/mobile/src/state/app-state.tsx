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
import type { ChatMessage } from '@/data/chat';
import type { MockPost } from '@/data/mock';
import { loadStringList, saveStringList } from '@/lib/storage';

/** Which screen's filters are being counted or cleared. */
export type FilterSurface = 'feed' | 'forum' | 'events';

const SAVED_KEY = 'savedThreads';
const FOLLOWS_KEY = 'followedCategories';
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

  /** Threads the user keeps, so she can return to the conversation. */
  savedThreadIds: string[];
  isSaved: (threadId: string) => boolean;
  toggleSaved: (threadId: string) => void;

  /** Threads started in this session, newest first. */
  createdThreads: ForumThread[];
  addThread: (thread: ForumThread) => void;

  /** Posts written in this session, newest first. */
  createdPosts: MockPost[];
  addPost: (post: MockPost) => void;

  repliesFor: (threadId: string) => ForumReply[];
  addReply: (threadId: string, reply: ForumReply) => void;

  /** Messages sent in this session, per conversation. */
  sentMessages: (conversationId: string) => ChatMessage[];
  sendMessage: (conversationId: string, message: ChatMessage) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [eventCategoryIds, setEventCategoryIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>(emptyDateRange);
  const [priceBand, setPriceBand] = useState<PriceBand>('any');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [followedCategories, setFollowedCategories] = useState<string[]>(DEFAULT_FOLLOWS);
  const [savedThreadIds, setSavedThreadIds] = useState<string[]>([]);
  const [createdThreads, setCreatedThreads] = useState<ForumThread[]>([]);
  const [createdPosts, setCreatedPosts] = useState<MockPost[]>([]);
  const [replies, setReplies] = useState<Record<string, ForumReply[]>>({});
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});

  // Restore preferences once, then mirror every later change back to
  // storage. The guard stops the first write from clobbering what was
  // just read.
  const restored = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const [saved, follows] = await Promise.all([
        loadStringList(SAVED_KEY),
        loadStringList(FOLLOWS_KEY),
      ]);
      if (cancelled) return;

      if (saved) setSavedThreadIds(saved);
      if (follows) setFollowedCategories(follows);
      restored.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (restored.current) void saveStringList(SAVED_KEY, savedThreadIds);
  }, [savedThreadIds]);

  useEffect(() => {
    if (restored.current) void saveStringList(FOLLOWS_KEY, followedCategories);
  }, [followedCategories]);

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

  const toggleSaved = useCallback((threadId: string) => {
    setSavedThreadIds((prev) =>
      prev.includes(threadId) ? prev.filter((item) => item !== threadId) : [threadId, ...prev],
    );
  }, []);

  const addThread = useCallback((thread: ForumThread) => {
    setCreatedThreads((prev) => [thread, ...prev]);
  }, []);

  const addPost = useCallback((post: MockPost) => {
    setCreatedPosts((prev) => [post, ...prev]);
  }, []);

  const addReply = useCallback((threadId: string, reply: ForumReply) => {
    setReplies((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), reply] }));
  }, []);

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
      savedThreadIds,
      isSaved: (threadId: string) => savedThreadIds.includes(threadId),
      toggleSaved,
      createdThreads,
      addThread,
      createdPosts,
      addPost,
      repliesFor: (threadId: string) => replies[threadId] ?? [],
      addReply,
      sentMessages: (conversationId: string) => messages[conversationId] ?? [],
      sendMessage,
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
      savedThreadIds,
      toggleSaved,
      createdThreads,
      addThread,
      createdPosts,
      addPost,
      replies,
      addReply,
      messages,
      sendMessage,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside an AppStateProvider');
  return value;
}
