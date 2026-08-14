import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

/** How long a signed media link stays valid. */
const SIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * Turn storage paths into URLs the app can render.
 *
 * The `media` bucket is private on purpose — this is a women-only
 * community, and a public bucket would make every uploaded photo
 * readable by anyone who guessed or was handed the URL. Private means
 * links have to be signed, and signing is done for the whole batch in one
 * request rather than per image.
 */
export async function signedMediaUrls(paths: string[]): Promise<Map<string, string>> {
  const urls = new Map<string, string>();
  const unique = [...new Set(paths)];
  if (unique.length === 0) return urls;

  const { data, error } = await supabase.storage
    .from('media')
    .createSignedUrls(unique, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return urls;

  for (const item of data) {
    if (item.signedUrl && item.path) urls.set(item.path, item.signedUrl);
  }

  return urls;
}

/** Avatars live in a public bucket, so they need no signing. */
export function avatarUrl(path: string): string {
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
}

/**
 * Read a picked file so it can be uploaded.
 *
 * On web the picker hands back a blob: URL that fetch can read. On device
 * it is a file:// path, which fetch does not reliably support — but
 * expo-file-system's File is itself a Blob, so it can go straight to the
 * upload.
 */
export async function toUploadable(uri: string): Promise<Blob> {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    return response.blob();
  }

  const { File } = await import('expo-file-system');
  return new File(uri) as unknown as Blob;
}
