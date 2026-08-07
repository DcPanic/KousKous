import * as ImagePicker from 'expo-image-picker';
import type { Attachment } from '@/data/forum';

/**
 * Opens the device library and returns the chosen files as attachments.
 *
 * Nothing is uploaded yet — the returned uri points at the local file, so
 * the picked media can be previewed. Wiring this to media storage is a
 * later step; the picker itself is real.
 */
export async function pickMedia(kind: 'image' | 'video'): Promise<Attachment[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return [];

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: kind === 'video' ? ['videos'] : ['images'],
    allowsMultipleSelection: kind === 'image',
    selectionLimit: 4,
    quality: 0.8,
  });

  if (result.canceled) return [];

  return result.assets.map((asset, index) => ({
    id: `${Date.now()}-${index}`,
    kind,
    uri: asset.uri,
  }));
}
