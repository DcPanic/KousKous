import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark, Heart, MessageCircle } from 'lucide-react-native';
import { colors, findCategory, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { findThread, replyCountOf, type ForumThread } from '@/data/forum';
import type { MockPost } from '@/data/mock';
import { useAppState } from '@/state/app-state';
import { useFeed } from '@/state/feed';
import { useForums } from '@/state/forums';
import { PostCard } from '@/components/post-card';

/**
 * Saved threads, so a member can come back to a conversation she wants to
 * keep taking part in rather than hunting for it in the community.
 */
export default function SavedScreen() {
  const router = useRouter();
  const { savedPostIds } = useAppState();
  const { savedThreads, savedThreadIds, toggleSaved } = useForums();
  const { posts } = useFeed();

  const [tab, setTab] = useState<'threads' | 'posts'>('threads');

  // Real threads when there are any; otherwise the seeded ones a free
  // account saved from the preview.
  const threads =
    savedThreads.length > 0
      ? savedThreads
      : savedThreadIds
          .map((id) => findThread(id))
          .filter((thread): thread is ForumThread => thread !== undefined);

  const savedPosts = savedPostIds
    .map((id) => posts.find((post) => post.id === id))
    .filter((post): post is MockPost => post !== undefined);

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
            {threads.length + savedPosts.length === 1
              ? '1 αποθηκευμένο'
              : `${threads.length + savedPosts.length} αποθηκευμένα`}
          </Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {(
          [
            ['threads', `Συζητήσεις · ${threads.length}`],
            ['posts', `Δημοσιεύσεις · ${savedPosts.length}`],
          ] as const
        ).map(([key, label]) => {
          const active = key === tab;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={tab === 'threads' ? styles.list : styles.postList}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'posts' ? (
          <>
            {savedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {savedPosts.length === 0 ? (
              <View style={styles.empty}>
                <Bookmark size={26} color={colors.textFaint} />
                <Text style={styles.emptyTitle}>Δεν έχεις αποθηκεύσει καμία δημοσίευση</Text>
                <Text style={styles.emptyBody}>
                  Πάτα τον σελιδοδείκτη σε μια δημοσίευση για να την κρατήσεις εδώ.
                </Text>
              </View>
            ) : null}
          </>
        ) : null}

        {tab === 'threads' ? threads.map((thread) => {
          const category = findCategory(thread.categoryId);
          const replyCount = replyCountOf(thread);

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
        }) : null}

        {tab === 'threads' && threads.length === 0 ? (
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
  tabs: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
    paddingVertical: 8,
  },
  tabActive: {
    borderColor: colors.pink,
    backgroundColor: colors.pinkSoft,
  },
  tabLabel: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.pinkDark,
  },
  postList: {
    paddingBottom: spacing.xxl,
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
