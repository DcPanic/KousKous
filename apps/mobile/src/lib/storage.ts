import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin typed wrapper over AsyncStorage, which is backed by localStorage on
 * web and native storage on device.
 *
 * Only preferences live here — saved threads and followed categories.
 * Posted content is not persisted: its attachments point at local file
 * URIs that do not survive a restart, and it belongs in the database once
 * the backend exists.
 */

const PREFIX = 'kouskous:';

export async function loadStringList(key: string): Promise<string[] | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    // Corrupt or unavailable storage must never break the app; the caller
    // keeps its default.
    return null;
  }
}

export async function saveStringList(key: string, value: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Ignored: losing a preference is preferable to crashing.
  }
}
