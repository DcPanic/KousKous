import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, SendHorizontal } from 'lucide-react-native';
import { can, colors, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { findPersonByName } from '@/data/people';
import { useFeed } from '@/state/feed';
import { useSession } from '@/state/session';
import { Avatar } from '@/components/avatar';
import { PostCard } from '@/components/post-card';
import { PlaceholderScreen } from '@/components/placeholder-screen';

/**
 * A post and its whole comment thread (spec §7 screen 2).
 *
 * The card itself is reused so the post looks identical to the feed; only
 * the comments below are new.
 */
export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const { posts, commentsFor, loadComments, addComment } = useFeed();

  const [draft, setDraft] = useState('');
  const [likedComments, setLikedComments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const postId = typeof id === 'string' ? id : '';
  const post = posts.find((item) => item.id === postId);

  // Comments are fetched on open rather than with the feed, which would
  // pull every comment of every post into the list query.
  useEffect(() => {
    if (postId) void loadComments(postId);
  }, [postId, loadComments]);

  if (!post) {
    return (
      <PlaceholderScreen
        title="Η δημοσίευση δεν βρέθηκε"
        subtitle="Άγνωστη δημοσίευση"
        body="Ίσως διαγράφηκε ή ο σύνδεσμος είναι λάθος."
      />
    );
  }

  const canComment = can(user, 'engagement');
  const comments = [...post.commentPreviews, ...commentsFor(post.id)];

  const submit = async () => {
    if (draft.trim().length === 0 || sending) return;

    setSending(true);
    const ok = await addComment(post.id, draft.trim());
    setSending(false);

    if (ok) setDraft('');
  };

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
        <Text style={styles.headerTitle}>Δημοσίευση</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <PostCard post={post} openable={false} />

          <Text style={styles.commentsHeading}>
            {comments.length > 0 ? `${comments.length} σχόλια` : 'Κανένα σχόλιο ακόμα'}
          </Text>

          {comments.map((comment, index) => {
            const person = findPersonByName(comment.author);
            const key = `${comment.author}-${index}`;
            const likedComment = likedComments.includes(key);
            return (
              <View key={key} style={styles.comment}>
                <Pressable
                  onPress={() =>
                    person
                      ? router.push({ pathname: '/u/[id]', params: { id: person.id } })
                      : undefined
                  }
                  disabled={!person}
                  accessibilityRole={person ? 'button' : undefined}
                  accessibilityLabel={person ? `Προφίλ: ${comment.author}` : undefined}
                >
                  <Avatar size={32} />
                </Pressable>
                <View style={styles.commentBubble}>
                  <Text style={styles.commentAuthor}>{comment.author}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
                <Pressable
                  onPress={() =>
                    setLikedComments((prev) =>
                      prev.includes(key) ? prev.filter((item) => item !== key) : [key, ...prev],
                    )
                  }
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={likedComment ? 'Δεν μου αρέσει πια' : 'Μου αρέσει'}
                  accessibilityState={{ selected: likedComment }}
                >
                  <Heart
                    size={15}
                    color={likedComment ? colors.pink : colors.textMuted}
                    fill={likedComment ? colors.pink : 'transparent'}
                  />
                </Pressable>
              </View>
            );
          })}

          {comments.length === 0 ? (
            <Text style={styles.emptyHint}>
              Γίνε η πρώτη που θα σχολιάσει.
            </Text>
          ) : null}
        </ScrollView>

        {canComment ? (
          <View style={styles.composer}>
            <Avatar size={30} />
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Γράψε ένα σχόλιο..."
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              multiline
            />
            <Pressable
              onPress={() => void submit()}
              disabled={sending}
              style={styles.send}
              accessibilityRole="button"
              accessibilityLabel="Αποστολή σχολίου"
            >
              <SendHorizontal size={16} color={colors.white} />
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
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
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  commentsHeading: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.7,
    color: colors.pink,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    boxShadow: shadows.card,
  },
  commentAuthor: {
    fontSize: 12,
    fontFamily: font.bold,
    color: colors.text,
  },
  commentText: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 18,
    marginTop: 2,
  },
  emptyHint: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 34,
    maxHeight: 100,
    borderRadius: radii.pill,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.text,
  },
  send: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
