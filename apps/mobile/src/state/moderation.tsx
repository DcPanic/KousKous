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
  fetchBlocked,
  fetchMyReportedPosts,
  reportContent,
  setBlocked as writeBlocked,
  type BlockedPerson,
  type ReportTarget,
} from '@/lib/moderation-repo';
import { useSession } from '@/state/session';

/**
 * Blocking and reporting.
 *
 * A block is enforced by the database, not by this state: every policy
 * that reads content runs `is_blocked_pair`, so a blocked woman's posts,
 * threads, events and profile stop coming back at all. What is kept here
 * is only what the screens need to show — the list, and whether a button
 * should say "block" or "unblock".
 */

interface ModerationValue {
  blocked: BlockedPerson[];
  isBlocked: (profileId: string) => boolean;
  /** Returns false when the change could not be saved. */
  toggleBlocked: (profileId: string) => Promise<boolean>;

  reportedPostIds: string[];
  /** Returns false when the report could not be filed. */
  report: (reason: string, target: ReportTarget) => Promise<boolean>;

  refresh: () => Promise<void>;
}

const ModerationContext = createContext<ModerationValue | null>(null);

export function ModerationProvider({ children }: { children: ReactNode }) {
  const { user, signedIn, ready } = useSession();

  const [blocked, setBlockedList] = useState<BlockedPerson[]>([]);
  const [reportedPostIds, setReportedPostIds] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    if (!signedIn) return;

    try {
      const [list, reported] = await Promise.all([
        fetchBlocked(user.id),
        fetchMyReportedPosts(user.id),
      ]);

      setBlockedList(list);
      setReportedPostIds(reported);
    } catch {
      // Keep what is on screen.
    }
  }, [signedIn, user.id]);

  useEffect(() => {
    if (!ready) return;

    if (signedIn) {
      void refresh();
    } else {
      setBlockedList([]);
      setReportedPostIds([]);
    }
  }, [ready, signedIn, refresh]);

  const toggleBlocked = useCallback(
    async (profileId: string) => {
      if (!signedIn) return false;

      const next = !blocked.some((person) => person.id === profileId);

      try {
        await writeBlocked(user.id, profileId, next);
      } catch {
        return false;
      }

      await refresh();
      return true;
    },
    [signedIn, blocked, user.id, refresh],
  );

  const report = useCallback(
    async (reason: string, target: ReportTarget) => {
      if (!signedIn) return false;

      try {
        await reportContent(user.id, reason, target);
      } catch {
        return false;
      }

      if (target.postId) {
        setReportedPostIds((prev) =>
          prev.includes(target.postId as string) ? prev : [target.postId as string, ...prev],
        );
      }

      return true;
    },
    [signedIn, user.id],
  );

  const value = useMemo<ModerationValue>(
    () => ({
      blocked,
      isBlocked: (profileId: string) => blocked.some((person) => person.id === profileId),
      toggleBlocked,
      reportedPostIds,
      report,
      refresh,
    }),
    [blocked, toggleBlocked, reportedPostIds, report, refresh],
  );

  return <ModerationContext.Provider value={value}>{children}</ModerationContext.Provider>;
}

export function useModeration(): ModerationValue {
  const value = useContext(ModerationContext);
  if (!value) throw new Error('useModeration must be used inside a ModerationProvider');
  return value;
}
