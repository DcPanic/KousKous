import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { accessFor } from '@kouskous/shared';
import { threadsForCategory, type ForumReply, type ForumThread } from '@/data/forum';
import {
  createReply,
  createThread,
  fetchForumStats,
  fetchMyThreadState,
  fetchReplies,
  fetchThread,
  fetchThreads,
  fetchThreadsByIds,
  setThreadLike,
  setThreadSaved,
  type NewThread,
} from '@/lib/forums-repo';
import { useSession } from '@/state/session';

/**
 * The forums.
 *
 * Reading a thread is what the subscription buys (§3), and the database
 * enforces that — a free account gets no rows at all. So free accounts
 * keep the seeded threads, which is exactly the blurred teaser the
 * communities screen already shows behind the paywall. Paid members get
 * the real ones.
 */

interface ForumsValue {
  /** Threads in one community, loading them the first time it is opened. */
  threadsFor: (categoryId: string) => ForumThread[];
  loadThreads: (categoryId: string) => Promise<void>;
  loadingCategory: string | null;

  threadById: (threadId: string) => ForumThread | undefined;
  loadThread: (threadId: string) => Promise<void>;

  repliesFor: (threadId: string) => ForumReply[];
  loadReplies: (threadId: string) => Promise<void>;
  /** Returns false when the reply could not be saved. */
  addReply: (threadId: string, body: string) => Promise<boolean>;

  /** Returns the new thread's id, or null when it could not be saved. */
  publish: (input: NewThread) => Promise<string | null>;

  isSaved: (threadId: string) => boolean;
  toggleSaved: (threadId: string) => void;
  savedThreadIds: string[];
  /** Full threads behind the saved ids, for the Αγαπημένα screen. */
  savedThreads: ForumThread[];

  isLiked: (threadId: string) => boolean;
  toggleLike: (threadId: string) => void;

  /** Threads + replies in a community, for the grid. Undefined until known. */
  activityFor: (categoryId: string) => number | undefined;
}

const ForumsContext = createContext<ForumsValue | null>(null);

export function ForumsProvider({ children }: { children: ReactNode }) {
  const { user, signedIn, ready } = useSession();

  // A free account cannot read threads, so it stays on the seeded set
  // rather than staring at an empty forum it is being asked to pay for.
  const live = signedIn && accessFor(user, 'forums_view') === 'allowed';

  const [threads, setThreads] = useState<Record<string, ForumThread[]>>({});
  const [singles, setSingles] = useState<Record<string, ForumThread>>({});
  const [replies, setReplies] = useState<Record<string, ForumReply[]>>({});
  const [saved, setSaved] = useState<string[]>([]);
  const [savedThreads, setSavedThreads] = useState<ForumThread[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [stats, setStats] = useState<Map<string, number>>(new Map());
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !signedIn) {
      setThreads({});
      setSingles({});
      setReplies({});
      setSaved([]);
      setSavedThreads([]);
      setLiked([]);
      setStats(new Map());
      return;
    }

    // The counts are readable even without a subscription — that number
    // is the reason to buy one.
    void fetchForumStats().then(setStats);

    if (live) {
      void fetchMyThreadState(user.id).then((state) => {
        setSaved(state.saved);
        setLiked(state.liked);
      });
    }
  }, [ready, signedIn, live, user.id]);

  // The saved screen can be opened without visiting any community, so
  // the threads behind the ids are fetched rather than looked up.
  useEffect(() => {
    if (!live || saved.length === 0) {
      setSavedThreads([]);
      return;
    }

    void fetchThreadsByIds(saved).then(setSavedThreads);
  }, [live, saved]);

  const loadThreads = useCallback(
    async (categoryId: string) => {
      if (!live) return;

      setLoadingCategory(categoryId);

      try {
        const loaded = await fetchThreads(categoryId);
        setThreads((prev) => ({ ...prev, [categoryId]: loaded }));
      } catch {
        // Leave whatever was shown; the screen offers a retry.
      } finally {
        setLoadingCategory(null);
      }
    },
    [live],
  );

  const loadThread = useCallback(
    async (threadId: string) => {
      if (!live) return;

      try {
        const loaded = await fetchThread(threadId);
        if (loaded) setSingles((prev) => ({ ...prev, [threadId]: loaded }));
      } catch {
        // Same: keep what is on screen.
      }
    },
    [live],
  );

  const loadReplies = useCallback(
    async (threadId: string) => {
      if (!live) return;

      try {
        const loaded = await fetchReplies(threadId);
        setReplies((prev) => ({ ...prev, [threadId]: loaded }));
      } catch {
        // Keep whatever was already shown rather than blanking the thread.
      }
    },
    [live],
  );

  const addReply = useCallback(
    async (threadId: string, body: string) => {
      if (!live) return false;

      try {
        await createReply(threadId, user.id, body);
        await loadReplies(threadId);
        return true;
      } catch {
        return false;
      }
    },
    [live, user.id, loadReplies],
  );

  const publish = useCallback(
    async (input: NewThread) => {
      if (!live) return null;

      try {
        const id = await createThread(user.id, input);
        await loadThreads(input.categoryId);
        return id;
      } catch {
        return null;
      }
    },
    [live, user.id, loadThreads],
  );

  const toggleSaved = useCallback(
    (threadId: string) => {
      const next = !saved.includes(threadId);
      setSaved((prev) => (next ? [threadId, ...prev] : prev.filter((id) => id !== threadId)));

      if (live) {
        void setThreadSaved(threadId, user.id, next).catch(() => {
          setSaved((prev) => (next ? prev.filter((id) => id !== threadId) : [threadId, ...prev]));
        });
      }
    },
    [saved, live, user.id],
  );

  const toggleLike = useCallback(
    (threadId: string) => {
      const next = !liked.includes(threadId);
      setLiked((prev) => (next ? [threadId, ...prev] : prev.filter((id) => id !== threadId)));

      if (live) {
        void setThreadLike(threadId, user.id, next).catch(() => {
          setLiked((prev) => (next ? prev.filter((id) => id !== threadId) : [threadId, ...prev]));
        });
      }
    },
    [liked, live, user.id],
  );

  const value = useMemo<ForumsValue>(
    () => ({
      threadsFor: (categoryId: string) =>
        live ? (threads[categoryId] ?? []) : threadsForCategory(categoryId),
      loadThreads,
      loadingCategory,
      threadById: (threadId: string) =>
        singles[threadId] ??
        Object.values(threads)
          .flat()
          .find((thread) => thread.id === threadId),
      loadThread,
      repliesFor: (threadId: string) => replies[threadId] ?? [],
      loadReplies,
      addReply,
      publish,
      isSaved: (threadId: string) => saved.includes(threadId),
      toggleSaved,
      savedThreadIds: saved,
      savedThreads: live ? savedThreads : [],
      isLiked: (threadId: string) => liked.includes(threadId),
      toggleLike,
      activityFor: (categoryId: string) => stats.get(categoryId),
    }),
    [
      live,
      threads,
      singles,
      replies,
      saved,
      savedThreads,
      liked,
      stats,
      loadingCategory,
      loadThreads,
      loadThread,
      loadReplies,
      addReply,
      publish,
      toggleSaved,
      toggleLike,
    ],
  );

  return <ForumsContext.Provider value={value}>{children}</ForumsContext.Provider>;
}

export function useForums(): ForumsValue {
  const value = useContext(ForumsContext);
  if (!value) throw new Error('useForums must be used inside a ForumsProvider');
  return value;
}
