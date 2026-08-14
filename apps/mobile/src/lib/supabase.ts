/**
 * Supabase client.
 *
 * The URL and the anon key are public by design: the anon key carries no
 * privileges of its own, and every table is protected by Row Level
 * Security policies (see supabase/migrations). That is why they can live
 * in the repository — the secret that must never be committed is the
 * `service_role` key, which is not used by the app at all.
 *
 * Values can still be overridden per environment through
 * EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import type { Database } from '@/types/database';

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://ajfztsoamctwerbvdorr.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqZnp0c29hbWN0d2VyYnZkb3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyOTg5MjgsImV4cCI6MjEwMTg3NDkyOH0.nNRoGq5Cc7Z1_z-d4j6FnCenH29wt483qF-WX7rMZME';

/** How long a single request may hang before it is treated as failed. */
const REQUEST_TIMEOUT_MS = 12_000;

/**
 * On a weak mobile connection a request can stay pending indefinitely, and
 * every screen that waits on one would sit on its spinner forever. Bounding
 * the wait turns that into an ordinary error the screens already handle.
 */
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // A caller-supplied signal still has to win, so both are honoured.
  init?.signal?.addEventListener('abort', () => controller.abort());

  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch: fetchWithTimeout },
  auth: {
    // AsyncStorage keeps the session on device. On web the SDK's default
    // localStorage is correct, and AsyncStorage is not available during
    // static rendering, so it is only passed on native.
    ...(Platform.OS === 'web' ? {} : { storage: AsyncStorage }),
    autoRefreshToken: true,
    persistSession: true,
    // Only matters for OAuth redirects, which the app does not use.
    detectSessionInUrl: false,
  },
});
