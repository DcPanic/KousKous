import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import type { Attachment } from '@/data/forum';

/**
 * The widest a photo ever needs to be.
 *
 * A phone camera hands back 3000-4000px, several megabytes each. Nothing
 * in the app renders wider than the screen, so uploading the original
 * costs the woman posting it her data and everyone else their loading
 * time, for pixels no one sees. 1440 stays sharp on the largest phones.
 */
const MAX_WIDTH = 1440;
const JPEG_QUALITY = 0.72;

async function downscale(uri: string): Promise<string> {
  try {
    const result = await manipulateAsync(uri, [{ resize: { width: MAX_WIDTH } }], {
      compress: JPEG_QUALITY,
      format: SaveFormat.JPEG,
    });
    return result.uri;
  } catch {
    // A photo that cannot be resized is still worth posting.
    return uri;
  }
}

/**
 * Opens the device library and returns the chosen files as attachments.
 *
 * Images are downscaled before they leave the picker, so everything
 * downstream — preview, upload, feed — works with a sensible size.
 * Videos are passed through: re-encoding one on device is slow and
 * belongs to a transcoding step, not the picker.
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

  const assets = await Promise.all(
    result.assets.map(async (asset, index) => ({
      id: `${Date.now()}-${index}`,
      kind,
      uri: kind === 'image' ? await downscale(asset.uri) : asset.uri,
    })),
  );

  return assets;
}
