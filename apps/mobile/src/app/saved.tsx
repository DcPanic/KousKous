import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark, Heart, MessageCircle } from 'lucide-react-native';
import { colors, findCategory, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { findThread, type ForumThread } from '@/data/forum';
import { useAppState } from '@/state/app-state';

/**
 * Saved threads, so a member can come back to a conversation she wants to
 * keep taking part in rather than hunting for it in the community.
 */
export default function SavedScreen() {
  const router = useRouter();
  const { savedThreadIds, createdThreads, toggleSaved, repliesFor } = useAppState();

  const threads = savedThreadIds
    .map(
      (id) =>
        createdThreads.find((thread) => thread.id === id) ?? findThread(id),
    )
    .filter((thread): thread is ForumThread => thread !== undefined);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Πίσω"
        >
          <ArrowLeft size={17} color={colors.text} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Αγαπημένα</Text>
          <Text style={styles.headerMeta}>
            {threads.length === 1 ? '1 συζήτηση' : `${threads.length} συζητήσεις`}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {threads.map((thread) => {
          const category = findCategory(thread.categoryId);
          const replyCount = thread.replies.length + repliesFor(thread.id).length;

          return (
            <Pressable
              key={thread.id}
              style={styles.card}
              onPress={() => router.push({ pathname: '/thread/[id]', params: { id: thread.id } })}
              accessibilityRole="button"
              accessibilityLabel={thread.title}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.categoryChip}>
                  {category ? `${category.emoji} ${category.name}` : ''}
                </Text>
                <Pressable
                  onPress={() => toggleSaved(thread.id)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Αφαίρεση από τα αγαπημένα"
                >
                  <Bookmark size={16} color={colors.pink} fill={colors.pink} />
                </Pressable>
              </View>

              <Text style={styles.title}>{thread.title}</Text>
              <Text style={styles.excerpt} numberOfLines={2}>
                {thread.excerpt}
              </Text>

              <View style={styles.stats}>
                <View style={styles.stat}>
                  <MessageCircle size={13} color={colors.textMuted} />
                  <Text style={styles.statLabel}>{replyCount}</Text>
                </View>
                <View style={styles.stat}>
                  <Heart size={13} color={colors.textMuted} />
                  <Text style={styles.statLabel}>{thread.likes}</Text>
                </View>
                <Text style={styles.author}>{thread.author}</Text>
              </View>
            </Pressable>
          );
        })}

        {threads.length === 0 ? (
          <View style={styles.empty}>
            <Bookmark size={26} color={colors.textFaint} />
            <Text style={styles.emptyTitle}>Δεν έχεις αποθηκεύσει καμία συζήτηση</Text>
            <Text style={styles.emptyBody}>
              Σε μια συζήτηση, πάτα τον σελιδοδείκτη πάνω δεξιά για να την κρατήσεις εδώ και να
              συνεχίσεις να συμμετέχεις.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  back: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.card,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  headerMeta: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  list: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    boxShadow: shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  categoryChip: {
    fontSize: 11,
    fontFamily: font.bold,
    color: colors.pinkDark,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  title: {
    fontSize: 14.5,
    fontFamily: font.extrabold,
    color: colors.text,
    marginBottom: 4,
  },
  excerpt: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textBody,
  },
  author: {
    marginLeft: 'auto',
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: 72,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontFamily: font.extrabold,
    color: colors.text,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
});
