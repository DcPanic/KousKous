import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Cross-screen UI state: the drawer, the location filter and category
 * follows. The location filter deliberately lives above the tab navigator
 * because it applies to the Feed, Forums and Events alike (spec §4).
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
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [followedCategories, setFollowedCategories] = useState<string[]>(['beauty', 'travel']);

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
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside an AppStateProvider');
  return value;
}
