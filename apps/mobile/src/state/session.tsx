import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { accountTier, type AccountTier, type User } from '@kouskous/shared';
import { supabase } from '@/lib/supabase';
import type { ProfileRow } from '@/types/database';

/**
 * Session state.
 *
 * When a woman is signed in, `user` is her real profile row. When she is
 * not, the app still runs on the mock account so the preview stays
 * browsable and the four tiers can be inspected through the drawer's dev
 * switcher. That switcher only applies to the signed-out preview — a real
 * profile is never overridden by it.
 */

const baseUser: User = {
  id: 'u_danae',
  email: 'danae@example.com',
  phone: null,
  name: 'Δανάη Παπαδάκη',
  avatar_url: null,
  bio: null,
  location: 'athens',
  is_paid_member: false,
  paid_until: null,
  is_host: false,
  community_approved: false,
  payment_verified: false,
  payment_provider_account_id: null,
  is_official: false,
  is_verified: false,
  created_at: '2026-01-14T10:00:00Z',
};

/** Per-tier overrides applied on top of `baseUser`. */
const tierProfiles: Record<AccountTier, Partial<User>> = {
  free: {},
  paid: { is_paid_member: true, paid_until: '2026-12-31T00:00:00Z' },
  host: {
    name: 'Νατάσα Ιωάννου',
    is_paid_member: true,
    is_host: true,
    community_approved: true,
    // Approved by the community but not yet payment-verified — the state
    // that shows the two gates are genuinely independent (spec §2.3).
    payment_verified: false,
    payment_provider_account_id: null,
  },
  official: {
    name: 'KousKous',
    is_paid_member: true,
    is_official: true,
    is_verified: true,
    bio: 'Η μεγαλύτερη γυναικεία κοινότητα Ελλάδας & Κύπρου 🇬🇷🇨🇾\nEvents · Giveaways · Προσφορές κάθε μήνα ✨',
  },
};

/** A profile row plus the email, which lives on the auth user. */
function toUser(profile: ProfileRow, email: string | undefined): User {
  return {
    id: profile.id,
    email: email ?? '',
    phone: null,
    name: profile.name,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    location: profile.location,
    is_paid_member: profile.is_paid_member,
    paid_until: profile.paid_until,
    is_host: profile.is_host,
    community_approved: profile.community_approved,
    payment_verified: profile.payment_verified,
    payment_provider_account_id: profile.payment_provider_account_id,
    is_official: profile.is_official,
    is_verified: profile.is_verified,
    created_at: profile.created_at,
  };
}

interface SessionValue {
  user: User;
  tier: AccountTier;
  /** True once a real account is signed in. */
  signedIn: boolean;
  /** False while the stored session is being restored. */
  ready: boolean;
  /** Preview-only tier switch; ignored while signed in. */
  setTier: (tier: AccountTier) => void;
  signOut: () => Promise<void>;
  /** Re-reads the profile row, e.g. after editing it. */
  refreshProfile: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<AccountTier>('free');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [ready, setReady] = useState(false);

  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // A missing profile is not fatal: the trigger creates it on sign-up,
      // and the preview account keeps working meanwhile.
      if (error) return;
      setProfile(data ?? null);
    } catch {
      // Same reasoning as above — never let a failed read blank the app.
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        setSession(data.session);
        if (data.session) await loadProfile(data.session.user.id);
      } catch {
        // Offline, or the backend is unreachable. The app still runs on
        // the preview account rather than hanging on a blank screen.
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) {
        void loadProfile(next.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signedIn = session !== null && profile !== null;

  const user = useMemo<User>(() => {
    if (session && profile) return toUser(profile, session.user.email);
    return { ...baseUser, ...tierProfiles[tier] };
  }, [session, profile, tier]);

  const setTier = useCallback((next: AccountTier) => setTierState(next), []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const value = useMemo<SessionValue>(
    () => ({ user, tier: accountTier(user), signedIn, ready, setTier, signOut, refreshProfile }),
    [user, signedIn, ready, setTier, signOut, refreshProfile],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside a SessionProvider');
  return value;
}
