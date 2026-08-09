import Constants from 'expo-constants';
import { Platform, Share } from 'react-native';

export type ShareResult = 'shared' | 'copied' | 'dismissed' | 'failed';

/**
 * Share a link out of the app.
 *
 * Native gets the system share sheet. On web the same sheet exists only
 * on some browsers, so the fallback copies the link — which is what the
 * caller tells the user happened, rather than claiming a share that never
 * took place.
 */
export async function shareLink(message: string, url: string): Promise<ShareResult> {
  if (Platform.OS === 'web') {
    const nav = typeof navigator === 'undefined' ? undefined : navigator;

    try {
      if (nav?.share) {
        await nav.share({ text: message, url });
        return 'shared';
      }
      if (nav?.clipboard) {
        await nav.clipboard.writeText(url);
        return 'copied';
      }
    } catch (error) {
      // The user closing the browser's share sheet lands here too, and is
      // not a failure worth reporting.
      const aborted = error instanceof Error && error.name === 'AbortError';
      return aborted ? 'dismissed' : 'failed';
    }

    return 'failed';
  }

  try {
    const result = await Share.share({ message: `${message}\n${url}`, url });
    return result.action === Share.dismissedAction ? 'dismissed' : 'shared';
  } catch {
    return 'failed';
  }
}

/**
 * Public link for a piece of content.
 *
 * On web the app may be served from a sub-path (GitHub Pages serves it
 * from /KousKous), so the base has to be prepended — resolving the path
 * against the current URL would drop it and produce a dead link.
 */
export function linkTo(path: string): string {
  // EXPO_PUBLIC_* is inlined into the bundle at build time, which is the
  // only one of the two that survives a static web export; the config
  // value is the fallback for the dev server.
  const base = String(
    process.env.EXPO_PUBLIC_BASE_URL ?? Constants.expoConfig?.extra?.baseUrl ?? '',
  ).replace(/\/$/, '');

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return new URL(`${base}${path}`, window.location.origin).toString();
  }
  return `https://kouskous.app${path}`;
}
