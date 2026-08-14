import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { posts as seededPosts, type MockComment, type MockPost } from '@/data/mock';
import {
  createComment,
  createPost,
  fetchComments,
  fetchPosts,
  PAGE_SIZE,
  type NewPost,
} from '@/lib/posts-repo';
import { useSession } from '@/state/session';

/**
 * The feed.
 *
 * Signed in, everything comes from the database. Signed out, the seeded
 * content stands in so the app is browsable before anyone has an account
 * — and so a woman who has not signed up yet still sees what KousKous
 * looks like rather than an empty screen.
 */

interface FeedValue {
  posts: MockPost[];
  loading: boolean;
  /** True while an older page is being appended. */
  loadingMore: boolean;
  /** Set when a load failed, so the screen can say so and offer a retry. */
  error: boolean;
  refresh: () => Promise<void>;
  /** Appends the next page; a no-op once everything is loaded. */
  loadMore: () => Promise<void>;

  /** Returns false when the post could not be saved. */
  publish: (input: NewPost) => Promise<boolean>;

  commentsFor: (postId: string) => MockComment[];
  loadComments: (postId: string) => Promise<void>;
  addComment: (postId: string, body: string) => Promise<boolean>;
}

const FeedContext = createContext<FeedValue | null>(null);

export function FeedProvider({ children }: { children: ReactNode }) {
  const { user, signedIn, ready } = useSession();

  const [remotePosts, setRemotePosts] = useState<MockPost[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [error, setError] = useState(false);
  const [comments, setComments] = useState<Record<string, MockComment[]>>({});

  const refresh = useCallback(async () => {
    if (!signedIn) return;

    setLoading(true);
    setError(false);

    try {
      const page = await fetchPosts();
      setRemotePosts(page);
      setExhausted(page.length < PAGE_SIZE);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [signedIn]);

  // Older posts are fetched by the timestamp of the last one on screen
  // rather than by offset, so a post added while scrolling cannot make a
  // row appear twice or be skipped.
  const loadMore = useCallback(async () => {
    if (!signedIn || loadingMore || exhausted || !remotePosts?.length) return;

    setLoadingMore(true);

    try {
      const oldest = remotePosts[remotePosts.length - 1];
      const page = await fetchPosts(oldest.createdAt);

      setRemotePosts((prev) => [...(prev ?? []), ...page]);
      setExhausted(page.length < PAGE_SIZE);
    } catch {
      // Silent: the feed already has content, and a failed page is
      // retried by the next scroll.
    } finally {
      setLoadingMore(false);
    }
  }, [signedIn, loadingMore, exhausted, remotePosts]);

  useEffect(() => {
    if (!ready) return;

    if (signedIn) {
      void refresh();
    } else {
      // Back to the seeded preview, and drop anything cached for the
      // account that just signed out.
      setRemotePosts(null);
      setComments({});
      setExhausted(false);
    }
  }, [ready, signedIn, refresh]);

  const publish = useCallback(
    async (input: NewPost) => {
      if (!signedIn) return false;

      try {
        await createPost(user.id, input);
        await refresh();
        return true;
      } catch {
        return false;
      }
    },
    [signedIn, user.id, refresh],
  );

  const loadComments = useCallback(
    async (postId: string) => {
      if (!signedIn) return;

      try {
        const loaded = await fetchComments(postId);
        setComments((prev) => ({ ...prev, [postId]: loaded }));
      } catch {
        // Leave whatever was already shown rather than blanking the thread.
      }
    },
    [signedIn],
  );

  const addComment = useCallback(
    async (postId: string, body: string) => {
      if (!signedIn) {
        // Signed out there is nowhere to write, but the preview should
        // still show what commenting feels like.
        setComments((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] ?? []), { author: user.name, text: body }],
        }));
        return true;
      }

      try {
        await createComment(postId, user.id, body);
        await loadComments(postId);
        return true;
      } catch {
        return false;
      }
    },
    [signedIn, user.id, user.name, loadComments],
  );

  const value = useMemo<FeedValue>(
    () => ({
      posts: remotePosts ?? seededPosts,
      loading,
      loadingMore,
      error,
      refresh,
      loadMore,
      publish,
      commentsFor: (postId: string) => comments[postId] ?? [],
      loadComments,
      addComment,
    }),
    [
      remotePosts,
      loading,
      loadingMore,
      error,
      refresh,
      loadMore,
      publish,
      comments,
      loadComments,
      addComment,
    ],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeed(): FeedValue {
  const value = useContext(FeedContext);
  if (!value) throw new Error('useFeed must be used inside a FeedProvider');
  return value;
}
