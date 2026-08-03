import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { accountTier, type AccountTier, type User } from '@kouskous/shared';

/**
 * Session state.
 *
 * Backed by mock data until Supabase auth is wired up. The `setTier` helper
 * exists so the four account types from the spec can be previewed without a
 * backend — it will be dropped once real sign-in lands.
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

interface SessionValue {
  user: User;
  tier: AccountTier;
  /** Development-only tier switch; remove once auth is live. */
  setTier: (tier: AccountTier) => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<AccountTier>('free');

  const user = useMemo<User>(() => ({ ...baseUser, ...tierProfiles[tier] }), [tier]);
  const setTier = useCallback((next: AccountTier) => setTierState(next), []);

  const value = useMemo<SessionValue>(
    () => ({ user, tier: accountTier(user), setTier }),
    [user, setTier],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside a SessionProvider');
  return value;
}
