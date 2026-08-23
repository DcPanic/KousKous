import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Play, X } from 'lucide-react-native';
import { colors, radii, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import type { Attachment } from '@/data/forum';
import { useLightbox } from './lightbox';

interface AttachmentGridProps {
  attachments: Attachment[];
  /** Provided by composers, so a picked file can be taken back off. */
  onRemove?: (id: string) => void;
  height?: number;
  /** Shown under the picture once it is open full-screen. */
  caption?: string;
}

/**
 * Renders picked or seeded media. Seeded placeholders have no file, so
 * they fall back to a flat tint. Videos show a play badge — playback
 * arrives with media storage; this is the poster.
 */
export function AttachmentGrid({
  attachments,
  onRemove,
  height = 190,
  caption,
}: AttachmentGridProps) {
  const { open } = useLightbox();

  if (attachments.length === 0) return null;

  const single = attachments.length === 1;

  // Only pictures that exist can be opened; a seeded tint has nothing
  // bigger behind it, and a video needs a player rather than a viewer.
  const openable = attachments.filter(
    (attachment) => attachment.uri && attachment.kind === 'image',
  );

  const items = attachments.map((attachment) => {
    const canOpen = Boolean(attachment.uri) && attachment.kind === 'image';

    return (
    <Pressable
      key={attachment.id}
      onPress={
        canOpen
          ? () =>
              open(
                openable.map((item) => ({ uri: item.uri as string, caption })),
                openable.findIndex((item) => item.id === attachment.id),
              )
          : undefined
      }
      disabled={!canOpen}
      style={[
        styles.item,
        { height },
        single ? styles.itemFull : styles.itemScrolled,
        !attachment.uri && { backgroundColor: attachment.tint ?? colors.pinkTint },
      ]}
      accessibilityRole={canOpen ? 'button' : undefined}
      accessibilityLabel={canOpen ? 'Άνοιγμα φωτογραφίας' : undefined}
    >
      {attachment.uri ? (
        <Image
          source={{ uri: attachment.uri }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={160}
        />
      ) : null}

      {attachment.kind === 'video' ? (
        <View style={styles.playBadge}>
          <Play size={14} color={colors.white} fill={colors.white} />
          <Text style={styles.playLabel}>Βίντεο</Text>
        </View>
      ) : null}

      {onRemove ? (
        <Pressable
          onPress={() => onRemove(attachment.id)}
          style={styles.remove}
          accessibilityRole="button"
          accessibilityLabel="Αφαίρεση"
        >
          <X size={13} color={colors.white} />
        </Pressable>
      ) : null}
    </Pressable>
    );
  });

  if (single) return <View style={styles.singleWrap}>{items}</View>;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  singleWrap: {
    marginTop: spacing.md,
  },
  row: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  item: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.pinkTint,
  },
  itemFull: {
    width: '100%',
  },
  itemScrolled: {
    width: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.imageBadge,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  playLabel: {
    color: colors.white,
    fontSize: 10.5,
    fontFamily: font.bold,
  },
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: colors.imageBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
