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
import { Avatar, AvatarStack } from './avatar';
import { DiagonalGradient } from './gradient';

export function PostCard({ post }: { post: MockPost }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar size={42} />
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{post.author}</Text>
            {post.verified ? <BadgeCheck size={14} color={colors.pink} fill={colors.pinkTint} /> : null}
          </View>
          <Text style={styles.meta}>
            {post.locationLabel} · {post.timeAgo}
          </Text>
        </View>
        <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel="Περισσότερα">
          <MoreHorizontal size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.caption}>{post.caption}</Text>
      <Text style={styles.hashtags}>{post.hashtags}</Text>

      <DiagonalGradient colors={gradients.photo} style={styles.media}>
        {post.mediaCount > 1 ? (
          <View style={styles.mediaBadge}>
            <Text style={styles.mediaBadgeLabel}>1/{post.mediaCount}</Text>
          </View>
        ) : null}
      </DiagonalGradient>

      <View style={styles.actions}>
        <View style={styles.actionGroup}>
          <ActionCount icon={Heart} count={post.likes} tint={colors.pink} filled />
          <ActionCount icon={MessageCircle} count={post.comments} tint={colors.textSecondary} />
          <ActionCount icon={Send} count={post.shares} tint={colors.textSecondary} />
        </View>
        <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel="Αποθήκευση">
          <Bookmark size={19} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.socialProof}>
        <AvatarStack tints={['#E9A9BC', '#C9A227']} />
        <Text style={styles.socialProofLabel}>{post.likedByLabel}</Text>
      </View>

      {post.commentPreviews.map((comment) => (
        <Text key={comment.author} style={styles.comment}>
          <Text style={styles.commentAuthor}>{comment.author}</Text> {comment.text}
        </Text>
      ))}

      <Pressable accessibilityRole="button">
        <Text style={styles.moreComments}>Δείτε και τα {post.totalComments} σχόλια</Text>
      </Pressable>
    </View>
  );
}

interface ActionCountProps {
  icon: LucideIcon;
  count: number;
  tint: string;
  filled?: boolean;
}

function ActionCount({ icon: Icon, count, tint, filled }: ActionCountProps) {
  return (
    <Pressable style={styles.action} accessibilityRole="button">
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
