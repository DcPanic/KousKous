import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { stories as seededStories, type MockStory } from '@/data/mock';
import { createStory, fetchStories, markStorySeen, type NewStory } from '@/lib/stories-repo';
import { useSession } from '@/state/session';

/**
 * The story rail.
 *
 * Same arrangement as the feed: real rows when signed in, the seeded rail
 * otherwise, so a visitor still sees what stories look like.
 */

interface StoriesValue {
  stories: MockStory[];
  find: (id: string) => MockStory | undefined;
  refresh: () => Promise<void>;
  /** Returns false when the story could not be uploaded. */
  publish: (input: NewStory) => Promise<boolean>;
  markSeen: (frameId: string) => void;
}

const StoriesContext = createContext<StoriesValue | null>(null);

export function StoriesProvider({ children }: { children: ReactNode }) {
  const { user, signedIn, ready } = useSession();
  const [remote, setRemote] = useState<MockStory[] | null>(null);

  const refresh = useCallback(async () => {
    if (!signedIn) return;

    try {
      setRemote(await fetchStories());
    } catch {
      // Keep whatever is on screen; the rail is not worth an error state.
    }
  }, [signedIn]);

  useEffect(() => {
    if (!ready) return;

    if (signedIn) {
      void refresh();
    } else {
      setRemote(null);
    }
  }, [ready, signedIn, refresh]);

  // A story expires while the app is open, so the rail is re-read
  // periodically rather than only on mount.
  useEffect(() => {
    if (!signedIn) return;

    const timer = setInterval(() => void refresh(), 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [signedIn, refresh]);

  const publish = useCallback(
    async (input: NewStory) => {
      if (!signedIn) return false;

      try {
        await createStory(user.id, input);
        await refresh();
        return true;
      } catch {
        return false;
      }
    },
    [signedIn, user.id, refresh],
  );

  const markSeen = useCallback(
    (frameId: string) => {
      if (signedIn) void markStorySeen(frameId, user.id);
    },
    [signedIn, user.id],
  );

  const stories = remote ?? seededStories;

  const value = useMemo<StoriesValue>(
    () => ({
      stories,
      find: (id: string) => stories.find((story) => story.id === id),
      refresh,
      publish,
      markSeen,
    }),
    [stories, refresh, publish, markSeen],
  );

  return <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>;
}

export function useStories(): StoriesValue {
  const value = useContext(StoriesContext);
  if (!value) throw new Error('useStories must be used inside a StoriesProvider');
  return value;
}
