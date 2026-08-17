import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BadgeCheck,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  type LucideIcon,
} from 'lucide-react-native';
import {
  colors,
  findCategory,
  findSubcategory,
  gradients,
  radii,
  spacing,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import type { MockPost } from '@/data/mock';
import { findPersonByName } from '@/data/people';
import { linkTo, shareLink } from '@/lib/share';
import { useAppState } from '@/state/app-state';
import { AttachmentGrid } from './attachments';
import { Avatar } from './avatar';
import { DiagonalGradient } from './gradient';
import { PostOptionsSheet } from './post-options-sheet';

interface PostCardProps {
  post: MockPost;
  /** False on the post's own screen, where opening it again is a no-op. */
  openable?: boolean;
}

/**
 * A post as a full-width row.
 *
 * The avatar sits in its own column and everything else runs down the
 * right of it, with a hairline between posts instead of a card. It reads
 * as one continuous conversation rather than a stack of boxes, and it
 * fits noticeably more on a phone screen.
 */
export function PostCard({ post, openable = true }: PostCardProps) {
  const router = useRouter();
  const { hasLiked, toggleLike, isPostSaved, toggleSavedPost } = useAppState();

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);

  const liked = hasLiked(post.id);
  const saved = isPostSaved(post.id);
  const openPost = () => router.push({ pathname: '/post/[id]', params: { id: post.id } });

  const share = async () => {
    const result = await shareLink(
      `Δες αυτή τη δημοσίευση της ${post.author} στο KousKous`,
      linkTo(`/post/${post.id}`),
    );
    if (result === 'copied') setShareNote('Ο σύνδεσμος αντιγράφηκε');
  };

  // Only seeded authors have a profile page of their own.
  const person = findPersonByName(post.author);
  const openAuthor = () =>
    person ? router.push({ pathname: '/u/[id]', params: { id: person.id } }) : undefined;

  const category = post.categoryId ? findCategory(post.categoryId) : undefined;
  const subcategory = post.subcategoryId ? findSubcategory(post.subcategoryId) : undefined;
  const categoryLabel = category
    ? `${category.emoji} ${category.name}${subcategory ? ` · ${subcategory.name}` : ''}`
    : null;

  const likeCount = post.likes + (liked ? 1 : 0);

  const summary = [
    post.totalComments > 0
      ? `${post.totalComments} ${post.totalComments === 1 ? 'απάντηση' : 'απαντήσεις'}`
      : null,
    likeCount > 0 ? `${likeCount} likes` : null,
    categoryLabel,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <View style={styles.row}>
      <Pressable
        onPress={openAuthor}
        disabled={!person}
        accessibilityRole={person ? 'button' : undefined}
        accessibilityLabel={person ? `Προφίλ: ${post.author}` : undefined}
      >
        <Avatar size={38} uri={post.authorAvatarUrl ?? undefined} />
      </Pressable>

      <View style={styles.column}>
        <View style={styles.headerLine}>
          <Pressable
            onPress={openAuthor}
            disabled={!person}
            style={styles.nameRow}
            accessibilityRole={person ? 'button' : undefined}
          >
            <Text style={styles.name} numberOfLines={1}>
              {post.author}
            </Text>
            {post.verified ? (
              <BadgeCheck size={13} color={colors.pink} fill={colors.pinkTint} />
            ) : null}
          </Pressable>

          <Text style={styles.time}>{post.timeAgo}</Text>
          <Pressable
            onPress={() => setOptionsOpen(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Περισσότερα"
          >
            <MoreHorizontal size={17} color={colors.textMuted} />
          </Pressable>
        </View>

        {post.caption.length > 0 ? <Text style={styles.caption}>{post.caption}</Text> : null}
        {post.hashtags.length > 0 ? <Text style={styles.hashtags}>{post.hashtags}</Text> : null}

        {post.attachments && post.attachments.length > 0 ? (
          <AttachmentGrid attachments={post.attachments} height={230} />
        ) : post.mediaCount > 0 ? (
          <DiagonalGradient colors={gradients.photo} style={styles.media}>
            {post.mediaCount > 1 ? (
              <View style={styles.mediaBadge}>
                <Text style={styles.mediaBadgeLabel}>1/{post.mediaCount}</Text>
              </View>
            ) : null}
          </DiagonalGradient>
        ) : null}

        <View style={styles.actions}>
          <Action
            icon={Heart}
            onPress={() => toggleLike(post.id)}
            label={liked ? 'Δεν μου αρέσει πια' : 'Μου αρέσει'}
            tint={liked ? colors.pink : colors.textSecondary}
            filled={liked}
          />
          <Action
            icon={MessageCircle}
            onPress={openable ? openPost : undefined}
            label="Σχόλια"
            tint={colors.textSecondary}
          />
          <Action
            icon={Send}
            onPress={() => void share()}
            label="Κοινοποίηση"
            tint={colors.textSecondary}
          />
          <View style={styles.actionsSpacer} />
          <Action
            icon={Bookmark}
            onPress={() => toggleSavedPost(post.id)}
            label={saved ? 'Αφαίρεση από τα αποθηκευμένα' : 'Αποθήκευση'}
            tint={saved ? colors.pink : colors.textSecondary}
            filled={saved}
          />
        </View>

        {/* Counts read as one quiet line rather than a number beside every
            icon, which is what made the old row feel busy. */}
        {summary.length > 0 ? (
          <Pressable
            onPress={openable ? openPost : undefined}
            disabled={!openable}
            accessibilityRole={openable ? 'button' : undefined}
          >
            <Text style={styles.counts}>{summary}</Text>
          </Pressable>
        ) : null}

        {shareNote ? <Text style={styles.shareNote}>{shareNote}</Text> : null}
      </View>

      <PostOptionsSheet
        visible={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        postId={post.id}
        authorId={post.authorId ?? ''}
        author={post.author}
      />
    </View>
  );
}

function Action({
  icon: Icon,
  onPress,
  label,
  tint,
  filled,
}: {
  icon: LucideIcon;
  onPress?: () => void;
  label: string;
  tint: string;
  filled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      hitSlop={8}
      style={styles.action}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon size={19} color={tint} strokeWidth={1.8} fill={filled ? tint : 'transparent'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  column: {
    flex: 1,
  },
  headerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  name: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.text,
    flexShrink: 1,
  },
  time: {
    marginLeft: 'auto',
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  caption: {
    fontSize: 14,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 20,
    marginTop: 2,
  },
  hashtags: {
    fontSize: 13,
    fontFamily: font.medium,
    color: colors.pink,
    marginTop: 2,
  },
  media: {
    width: '100%',
    aspectRatio: 1.1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  mediaBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.imageBadge,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  mediaBadgeLabel: {
    color: colors.white,
    fontSize: 10.5,
    fontFamily: font.bold,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  actionsSpacer: {
    flex: 1,
  },
  action: {
    paddingVertical: 2,
  },
  counts: {
    fontSize: 12,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  shareNote: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.success,
    marginTop: 4,
  },
});
