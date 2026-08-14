import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Play } from 'lucide-react-native';
import { colors, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import type { MockPost } from '@/data/mock';

const COLUMNS = 3;
const GAP = 2;

/** Tints for text-only posts, picked from the id so a tile keeps its colour. */
const TINTS = ['#FBE1E9', '#F5E6BE', '#EADFF0', '#DCEAF5', '#F0E4D8', '#E4F0E8'];

function tintFor(id: string): string {
  let sum = 0;
  for (let index = 0; index < id.length; index += 1) sum += id.charCodeAt(index);
  return TINTS[sum % TINTS.length];
}

/**
 * A woman's posts as a grid.
 *
 * A post without a photo still gets a tile — it shows the opening of the
 * caption, because a blank square would read as a broken image.
 */
export function PostGrid({ posts, emptyLabel }: { posts: MockPost[]; emptyLabel: string }) {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const size = (width - GAP * (COLUMNS + 1)) / COLUMNS;

  if (posts.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyLabel}>{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {posts.map((post) => {
        const cover = post.attachments?.find((attachment) => attachment.uri);

        return (
          <Pressable
            key={post.id}
            onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
            style={[styles.tile, { width: size, height: size }]}
            accessibilityRole="button"
            accessibilityLabel={post.caption.slice(0, 60) || 'Δημοσίευση'}
          >
            {cover ? (
              <Image
                source={{ uri: cover.uri }}
                style={styles.image}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={160}
              />
            ) : (
              <View style={[styles.textTile, { backgroundColor: tintFor(post.id) }]}>
                <Text style={styles.textTileLabel} numberOfLines={4}>
                  {post.caption || post.hashtags}
                </Text>
              </View>
            )}

            {cover?.kind === 'video' ? (
              <View style={styles.videoBadge}>
                <Play size={11} color={colors.white} fill={colors.white} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    paddingHorizontal: GAP,
  },
  tile: {
    overflow: 'hidden',
    backgroundColor: colors.pinkTint,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textTile: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.sm,
  },
  textTileLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: font.medium,
    color: colors.text,
  },
  videoBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  emptyLabel: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
});
