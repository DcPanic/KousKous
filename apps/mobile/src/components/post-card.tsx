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
import { colors, gradients, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import type { MockPost } from '@/data/mock';
import { findPersonByName } from '@/data/people';
import { linkTo, shareLink } from '@/lib/share';
import { useAppState } from '@/state/app-state';
import { AttachmentGrid } from './attachments';
import { Avatar, AvatarStack } from './avatar';
import { DiagonalGradient } from './gradient';
import { PostOptionsSheet } from './post-options-sheet';

interface PostCardProps {
  post: MockPost;
  /** False on the post's own screen, where opening it again is a no-op. */
  openable?: boolean;
}

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
  // Only seeded authors have a profile; posts written in the app are the
  // signed-in user's own, so there is nothing to open.
  const person = findPersonByName(post.author);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          onPress={() =>
            person ? router.push({ pathname: '/u/[id]', params: { id: person.id } }) : undefined
          }
          disabled={!person}
          style={styles.authorTap}
          accessibilityRole={person ? 'button' : undefined}
          accessibilityLabel={person ? `Προφίλ: ${post.author}` : undefined}
        >
          <Avatar size={42} uri={post.authorAvatarUrl ?? undefined} />
          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{post.author}</Text>
              {post.verified ? <BadgeCheck size={14} color={colors.pink} fill={colors.pinkTint} /> : null}
            </View>
            <Text style={styles.meta}>
              {post.locationLabel} · {post.timeAgo}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => setOptionsOpen(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Περισσότερα"
        >
          <MoreHorizontal size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <PostOptionsSheet
        visible={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        postId={post.id}
        author={post.author}
      />

      {post.caption.length > 0 ? <Text style={styles.caption}>{post.caption}</Text> : null}
      {post.hashtags.length > 0 ? <Text style={styles.hashtags}>{post.hashtags}</Text> : null}

      {post.attachments && post.attachments.length > 0 ? (
        <AttachmentGrid attachments={post.attachments} height={220} />
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
        <View style={styles.actionGroup}>
          <ActionCount
            icon={Heart}
            count={post.likes + (liked ? 1 : 0)}
            tint={colors.pink}
            filled={liked}
            onPress={() => toggleLike(post.id)}
            label={liked ? 'Δεν μου αρέσει πια' : 'Μου αρέσει'}
          />
          <ActionCount
            icon={MessageCircle}
            count={post.comments}
            tint={colors.textSecondary}
            onPress={openable ? openPost : undefined}
            label="Σχόλια"
          />
          <ActionCount
            icon={Send}
            count={post.shares}
            tint={colors.textSecondary}
            onPress={() => void share()}
            label="Κοινοποίηση"
          />
        </View>
        <Pressable
          onPress={() => toggleSavedPost(post.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Αφαίρεση από τα αποθηκευμένα' : 'Αποθήκευση'}
          accessibilityState={{ selected: saved }}
        >
          <Bookmark
            size={19}
            color={saved ? colors.pink : colors.textSecondary}
            fill={saved ? colors.pink : 'transparent'}
          />
        </Pressable>
      </View>

      {shareNote ? <Text style={styles.shareNote}>{shareNote}</Text> : null}

      {post.likedByLabel.length > 0 ? (
        <View style={styles.socialProof}>
          <AvatarStack tints={['#E9A9BC', '#C9A227']} />
          <Text style={styles.socialProofLabel}>{post.likedByLabel}</Text>
        </View>
      ) : null}

      {/* The post's own screen lists every comment below, so the preview
          would only repeat them. */}
      {openable
        ? post.commentPreviews.map((comment) => (
            <Text key={comment.author} style={styles.comment}>
              <Text style={styles.commentAuthor}>{comment.author}</Text> {comment.text}
            </Text>
          ))
        : null}

      {post.totalComments > 0 && openable ? (
        <Pressable onPress={openPost} accessibilityRole="button">
          <Text style={styles.moreComments}>Δείτε και τα {post.totalComments} σχόλια</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

interface ActionCountProps {
  icon: LucideIcon;
  count: number;
  onPress?: () => void;
  label?: string;
  tint: string;
  filled?: boolean;
}

function ActionCount({ icon: Icon, count, tint, filled, onPress, label }: ActionCountProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={styles.action}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon size={18} color={tint} strokeWidth={1.8} fill={filled ? colors.pinkTint : 'transparent'} />
      <Text style={styles.actionCount}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.screen,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.screen,
    boxShadow: shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md + 2,
  },
  authorTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  name: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  meta: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 1,
  },
  caption: {
    fontSize: 13.5,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 20,
    marginBottom: 6,
  },
  hashtags: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.pink,
    marginBottom: spacing.md + 2,
  },
  media: {
    width: '100%',
    aspectRatio: 1.1,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  mediaBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.imageBadge,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 20,
  },
  mediaBadgeLabel: {
    color: colors.white,
    fontSize: 10.5,
    fontFamily: font.bold,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.sm,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: spacing.screen,
    flex: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionCount: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.textBody,
  },
  shareNote: {
    fontSize: 11,
    fontFamily: font.bold,
    color: colors.success,
    marginTop: spacing.sm,
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  socialProofLabel: {
    fontSize: 12,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  comment: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textBody,
    marginBottom: 3,
  },
  commentAuthor: {
    fontFamily: font.bold,
  },
  moreComments: {
    fontSize: 12,
    fontFamily: font.bold,
    color: colors.pink,
    marginTop: 5,
  },
});
