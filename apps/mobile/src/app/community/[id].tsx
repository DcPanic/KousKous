import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Heart,
  MessageCircle,
  Pin,
  Plus,
} from 'lucide-react-native';
import {
  can,
  colors,
  findCategory,
  findPlace,
  matchesPlaces,
  radii,
  shadows,
  spacing,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import { forumSortLabels, replyCountOf, sortThreads, type ForumSort } from '@/data/forum';
import { useAppState } from '@/state/app-state';
import { useForums } from '@/state/forums';
import { useSession } from '@/state/session';
import { Avatar } from '@/components/avatar';
import { AttachmentGrid } from '@/components/attachments';
import { FilterBar } from '@/components/filter-bar';
import { PlaceholderScreen } from '@/components/placeholder-screen';

const SORTS: ForumSort[] = ['recent', 'popular', 'unanswered'];

export default function CommunityForumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const { isFollowing, toggleFollow, selectedPlaces } = useAppState();
  const { threadsFor, loadThreads, loadingCategory, isSaved, toggleSaved } = useForums();
  const router = useRouter();
  const [sort, setSort] = useState<ForumSort>('recent');

  const category = typeof id === 'string' ? findCategory(id) : undefined;
  const categoryId = category?.id;

  useEffect(() => {
    if (categoryId) void loadThreads(categoryId);
  }, [categoryId, loadThreads]);

  const threads = useMemo(() => {
    if (!category) return [];
    const byLocation = threadsFor(category.id).filter((thread) =>
      matchesPlaces(thread.location, selectedPlaces),
    );
    return sortThreads(byLocation, sort);
  }, [category, threadsFor, selectedPlaces, sort]);

  if (!category) {
    return (
      <PlaceholderScreen
        title="Η κοινότητα δεν βρέθηκε"
        subtitle="Άγνωστη κατηγορία"
        body="Ο σύνδεσμος δείχνει σε κοινότητα που δεν υπάρχει."
      />
    );
  }

  const following = isFollowing(category.id);
  const canPost = can(user, 'forums_participate');

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
        <Text style={styles.headerEmoji}>{category.emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{category.name}</Text>
          <Text style={styles.headerMeta}>{threads.length} συζητήσεις</Text>
        </View>
        <Pressable
          onPress={() => toggleFollow(category.id)}
          style={[styles.followPill, following && styles.followPillActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: following }}
        >
          <Text style={[styles.followLabel, following && styles.followLabelActive]}>
            {following ? 'Ακολουθείς' : 'Follow'}
          </Text>
        </Pressable>
      </View>

      {/* Location applies to forums as well as the feed and events. */}
      <FilterBar surface="forum" resultCount={threads.length} />

      <View style={styles.sorts}>
        {SORTS.map((key) => {
          const active = key === sort;
          return (
            <Pressable
              key={key}
              onPress={() => setSort(key)}
              style={[styles.sortChip, active && styles.sortChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.sortLabel, active && styles.sortLabelActive]}>
                {forumSortLabels[key]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {threads.map((thread) => {
          const saved = isSaved(thread.id);
          const replyCount = replyCountOf(thread);

          return (
            <Pressable
              key={thread.id}
              style={styles.thread}
              onPress={() => router.push({ pathname: '/thread/[id]', params: { id: thread.id } })}
              accessibilityRole="button"
              accessibilityLabel={thread.title}
            >
              {thread.pinned ? (
                <View style={styles.pinnedRow}>
                  <Pin size={11} color={colors.pink} />
                  <Text style={styles.pinnedLabel}>Καρφιτσωμένο</Text>
                </View>
              ) : null}

              <View style={styles.threadHeader}>
                <Avatar size={30} />
                <View style={styles.threadAuthor}>
                  <View style={styles.threadAuthorRow}>
                    <Text style={styles.authorName}>{thread.author}</Text>
                    {thread.verified ? (
                      <BadgeCheck size={12} color={colors.pink} fill={colors.pinkTint} />
                    ) : null}
                  </View>
                  <Text style={styles.muted}>
                    {findPlace(thread.location)?.name} · {thread.timeAgo}
                  </Text>
                </View>
                <Pressable
                  onPress={() => toggleSaved(thread.id)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={saved ? 'Αφαίρεση από τα αγαπημένα' : 'Αποθήκευση'}
                  accessibilityState={{ selected: saved }}
                >
                  <Bookmark
                    size={16}
                    color={saved ? colors.pink : colors.textMuted}
                    fill={saved ? colors.pink : 'transparent'}
                  />
                </Pressable>
              </View>

              <Text style={styles.threadTitle}>{thread.title}</Text>
              <Text style={styles.threadExcerpt} numberOfLines={2}>
                {thread.excerpt}
              </Text>

              <AttachmentGrid attachments={thread.attachments} height={130} />

              <View style={styles.threadStats}>
                <View style={styles.stat}>
                  <MessageCircle size={14} color={colors.textMuted} />
                  <Text style={styles.statLabel}>{replyCount}</Text>
                </View>
                <View style={styles.stat}>
                  <Heart size={14} color={colors.textMuted} />
                  <Text style={styles.statLabel}>{thread.likes}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        {threads.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Καμία συζήτηση εδώ</Text>
            <Text style={styles.emptyBody}>
              {sort === 'unanswered'
                ? 'Όλες οι συζητήσεις έχουν απαντήσεις.'
                : 'Δοκίμασε να καθαρίσεις το φίλτρο τοποθεσίας.'}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {canPost ? (
        <Pressable
          style={styles.newPost}
          onPress={() =>
            router.push({ pathname: '/new-thread', params: { categoryId: category.id } })
          }
          accessibilityRole="button"
        >
          <Plus size={18} color={colors.white} strokeWidth={2.6} />
          <Text style={styles.newPostLabel}>Νέα συζήτηση</Text>
        </Pressable>
      ) : null}
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
  headerEmoji: {
    fontSize: 22,
  },
  headerText: {
    flex: 1,
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
  followPill: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderPill,
    backgroundColor: colors.surface,
  },
  followPillActive: {
    borderColor: 'transparent',
    backgroundColor: colors.pinkSoft,
  },
  followLabel: {
    fontSize: 10.5,
    fontFamily: font.extrabold,
    color: colors.textMuted,
  },
  followLabelActive: {
    color: colors.pinkDark,
  },
  sorts: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  sortChip: {
    paddingVertical: 7,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
  },
  sortChipActive: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  sortLabel: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  sortLabelActive: {
    color: colors.white,
  },
  list: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 96,
  },
  thread: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    boxShadow: shadows.card,
  },
  pinnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  pinnedLabel: {
    fontSize: 10,
    fontFamily: font.extrabold,
    color: colors.pink,
    letterSpacing: 0.4,
  },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  threadAuthor: {
    flex: 1,
  },
  threadAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  muted: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  threadTitle: {
    fontSize: 14.5,
    fontFamily: font.extrabold,
    color: colors.text,
    marginBottom: 5,
  },
  threadExcerpt: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  threadStats: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: font.bold,
    color: colors.textBody,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontFamily: font.extrabold,
    color: colors.text,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  newPost: {
    position: 'absolute',
    right: spacing.screen,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    boxShadow: shadows.fab,
  },
  newPostLabel: {
    fontSize: 13,
    fontFamily: font.extrabold,
    color: colors.white,
  },
});
