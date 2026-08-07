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
import type { ForumReply, ForumThread } from '@/data/forum';
import { loadStringList, saveStringList } from '@/lib/storage';

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
  selectedLocations: string[];
  toggleLocation: (id: string) => void;
  clearLocations: () => void;

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

  repliesFor: (threadId: string) => ForumReply[];
  addReply: (threadId: string, reply: ForumReply) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [followedCategories, setFollowedCategories] = useState<string[]>(DEFAULT_FOLLOWS);
  const [savedThreadIds, setSavedThreadIds] = useState<string[]>([]);
  const [createdThreads, setCreatedThreads] = useState<ForumThread[]>([]);
  const [replies, setReplies] = useState<Record<string, ForumReply[]>>({});

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

  const toggleLocation = useCallback((id: string) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const clearLocations = useCallback(() => setSelectedLocations([]), []);

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

  const addReply = useCallback((threadId: string, reply: ForumReply) => {
    setReplies((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), reply] }));
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      drawerOpen,
      openDrawer,
      closeDrawer,
      selectedLocations,
      toggleLocation,
      clearLocations,
      followedCategories,
      isFollowing: (categoryId: string) => followedCategories.includes(categoryId),
      toggleFollow,
      savedThreadIds,
      isSaved: (threadId: string) => savedThreadIds.includes(threadId),
      toggleSaved,
      createdThreads,
      addThread,
      repliesFor: (threadId: string) => replies[threadId] ?? [],
      addReply,
    }),
    [
      drawerOpen,
      openDrawer,
      closeDrawer,
      selectedLocations,
      toggleLocation,
      clearLocations,
      followedCategories,
      toggleFollow,
      savedThreadIds,
      toggleSaved,
      createdThreads,
      addThread,
      replies,
      addReply,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside an AppStateProvider');
  return value;
}
