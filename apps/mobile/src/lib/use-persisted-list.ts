import { useEffect, useRef, useState } from 'react';
import { loadStringList, saveStringList } from './storage';

/**
 * A list of ids that survives a reload.
 *
 * Restore happens once; the guard stops the first write from clobbering
 * what was just read. Until Supabase owns this data, storage is what
 * makes likes, saves and blocks feel like real decisions rather than
 * something the app forgets the moment it is closed.
 */
export function usePersistedStringList(key: string, initial: string[] = []) {
  const [value, setValue] = useState<string[]>(initial);
  const restored = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const stored = await loadStringList(key);
      if (cancelled) return;
      if (stored) setValue(stored);
      restored.current = true;
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (restored.current) void saveStringList(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
