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
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  Heart,
  ImagePlus,
  MessageCircle,
  SendHorizontal,
  Video,
} from 'lucide-react-native';
import { can, colors, findCategory, findLocation, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { findThread, replyCountOf, type Attachment } from '@/data/forum';
import { findPersonByName } from '@/data/people';
import { pickMedia } from '@/lib/media';
import { useForums } from '@/state/forums';
import { useSession } from '@/state/session';
import { Avatar } from '@/components/avatar';
import { AttachmentGrid } from '@/components/attachments';
import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useSession();
  const {
    isSaved,
    toggleSaved,
    isLiked,
    toggleLike,
    repliesFor,
    loadReplies,
    addReply,
    threadById,
    loadThread,
  } = useForums();

  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const threadId = typeof id === 'string' ? id : '';
  // A real thread comes from the provider; the seeded ones are the
  // preview a free account sees, and open the same way.
  const thread = threadById(threadId) ?? findThread(threadId);

  useEffect(() => {
    if (!threadId) return;
    void loadThread(threadId);
    void loadReplies(threadId);
  }, [threadId, loadThread, loadReplies]);

  if (!thread) {
    return (
      <PlaceholderScreen
        title="Η συζήτηση δεν βρέθηκε"
        subtitle="Άγνωστο θέμα"
        body="Ίσως διαγράφηκε ή ο σύνδεσμος είναι λάθος."
      />
    );
  }

  const category = findCategory(thread.categoryId);
  // A real thread carries its author's account; the seeded ones are
  // matched by name against the preview directory.
  const authorId = thread.authorId ?? findPersonByName(thread.author)?.id ?? null;
  const saved = isSaved(thread.id);
  const liked = isLiked(thread.id);
  const canReply = can(user, 'forums_participate');
  // Loaded replies win; the seeded threads carry their own.
  const loadedReplies = repliesFor(thread.id);
  const replies = loadedReplies.length > 0 ? loadedReplies : thread.replies;
  const replyCount = Math.max(replies.length, replyCountOf(thread));

  const attach = async (kind: 'image' | 'video') => {
    const picked = await pickMedia(kind);
    if (picked.length > 0) setAttachments((prev) => [...prev, ...picked]);
  };

  const submit = async () => {
    if ((draft.trim().length === 0 && attachments.length === 0) || sending) return;

    setSending(true);
    setError(null);

    const ok = await addReply(thread.id, draft.trim());

    setSending(false);

    if (!ok) {
      setError('Η απάντηση δεν στάλθηκε. Δοκίμασε ξανά.');
      return;
    }

    setDraft('');
    setAttachments([]);
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
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Συζήτηση</Text>
          <Text style={styles.headerMeta}>
            {category ? `${category.emoji} ${category.name}` : ''}
          </Text>
        </View>
        <Pressable
          onPress={() => toggleSaved(thread.id)}
          style={[styles.saveButton, saved && styles.saveButtonActive]}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Αφαίρεση από τα αγαπημένα' : 'Αποθήκευση στα αγαπημένα'}
          accessibilityState={{ selected: saved }}
        >
          <Bookmark
            size={17}
            color={saved ? colors.white : colors.text}
            fill={saved ? colors.white : 'transparent'}
          />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.opening}>
            <Pressable
              onPress={() =>
                authorId
                  ? router.push({ pathname: '/u/[id]', params: { id: authorId } })
                  : undefined
              }
              disabled={!authorId}
              style={styles.authorRow}
              accessibilityRole={authorId ? 'button' : undefined}
              accessibilityLabel={authorId ? `Προφίλ: ${thread.author}` : undefined}
            >
              <Avatar size={38} />
              <View style={styles.authorText}>
                <View style={styles.authorNameRow}>
                  <Text style={styles.authorName}>{thread.author}</Text>
                  {thread.verified ? (
                    <BadgeCheck size={13} color={colors.pink} fill={colors.pinkTint} />
                  ) : null}
                </View>
                <Text style={styles.muted}>
                  {findLocation(thread.location)?.name} · {thread.timeAgo}
                </Text>
              </View>
            </Pressable>

            <Text style={styles.title}>{thread.title}</Text>
            <Text style={styles.bodyText}>{thread.body}</Text>
            <AttachmentGrid attachments={thread.attachments} />

            <View style={styles.stats}>
              <Pressable
                onPress={() => toggleLike(thread.id)}
                style={styles.stat}
                accessibilityRole="button"
                accessibilityState={{ selected: liked }}
                accessibilityLabel={liked ? 'Αφαίρεση like' : 'Μου αρέσει'}
              >
                <Heart
                  size={15}
                  color={colors.pink}
                  fill={liked ? colors.pink : colors.pinkTint}
                />
                <Text style={styles.statLabel}>{thread.likes + (liked ? 1 : 0)}</Text>
              </Pressable>
              <View style={styles.stat}>
                <MessageCircle size={15} color={colors.textMuted} />
                <Text style={styles.statLabel}>{replyCount}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.repliesHeading}>
            {replyCount > 0 ? `${replyCount} απαντήσεις` : 'Καμία απάντηση ακόμα'}
          </Text>

          {replies.map((reply) => (
            <View key={reply.id} style={styles.reply}>
              <Pressable
                onPress={() =>
                  reply.authorId
                    ? router.push({ pathname: '/u/[id]', params: { id: reply.authorId } })
                    : undefined
                }
                disabled={!reply.authorId}
                style={styles.authorRow}
                accessibilityRole={reply.authorId ? 'button' : undefined}
                accessibilityLabel={reply.authorId ? `Προφίλ: ${reply.author}` : undefined}
              >
                <Avatar size={30} />
                <View style={styles.authorText}>
                  <View style={styles.authorNameRow}>
                    <Text style={styles.replyAuthor}>{reply.author}</Text>
                    {reply.verified ? (
                      <BadgeCheck size={11} color={colors.pink} fill={colors.pinkTint} />
                    ) : null}
                  </View>
                  <Text style={styles.muted}>{reply.timeAgo}</Text>
                </View>
              </Pressable>
              {reply.body.length > 0 ? <Text style={styles.replyBody}>{reply.body}</Text> : null}
              <AttachmentGrid attachments={reply.attachments} height={150} />
              <View style={styles.replyLikes}>
                <Heart size={13} color={colors.textMuted} />
                <Text style={styles.muted}>{reply.likes}</Text>
              </View>
            </View>
          ))}

          {replies.length === 0 ? (
            <Text style={styles.emptyHint}>
              Γίνε η πρώτη που θα απαντήσει — οι πρώτες απαντήσεις είναι που ξεκινούν τη συζήτηση.
            </Text>
          ) : null}
        </ScrollView>

        {canReply ? (
          <View style={styles.composer}>
            <AttachmentGrid
              attachments={attachments}
              onRemove={(attachmentId) =>
                setAttachments((prev) => prev.filter((item) => item.id !== attachmentId))
              }
              height={90}
            />
            <View style={styles.composerRow}>
              <Pressable
                onPress={() => attach('image')}
                style={styles.attachButton}
                accessibilityRole="button"
                accessibilityLabel="Προσθήκη φωτογραφίας"
              >
                <ImagePlus size={19} color={colors.pink} />
              </Pressable>
              <Pressable
                onPress={() => attach('video')}
                style={styles.attachButton}
                accessibilityRole="button"
                accessibilityLabel="Προσθήκη βίντεο"
              >
                <Video size={19} color={colors.pink} />
              </Pressable>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Γράψε την απάντησή σου..."
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                multiline
              />
              <Pressable
                onPress={() => void submit()}
                disabled={sending}
                style={[styles.send, sending && styles.sendDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Αποστολή"
              >
                <SendHorizontal size={17} color={colors.white} />
              </Pressable>
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        ) : (
          <View style={styles.lockedComposer}>
            <Text style={styles.lockedLabel}>
              Η συμμετοχή στις συζητήσεις είναι για μέλη.
            </Text>
          </View>
        )}
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
  saveButton: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.card,
  },
  saveButtonActive: {
    backgroundColor: colors.pink,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  opening: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
    boxShadow: shadows.card,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  authorText: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: 13.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  muted: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  title: {
    fontSize: 17,
    fontFamily: font.extrabold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  bodyText: {
    fontSize: 13.5,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 21,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statLabel: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.textBody,
  },
  repliesHeading: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.7,
    color: colors.pink,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  reply: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    boxShadow: shadows.card,
  },
  replyAuthor: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  replyBody: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 19,
    marginTop: spacing.md,
  },
  replyLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  emptyHint: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  composer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pinkSoft,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 110,
    borderRadius: radii.pill,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.lg,
    paddingTop: 9,
    paddingBottom: 9,
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.text,
  },
  send: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    backgroundColor: colors.textInactive,
  },
  error: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  lockedComposer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
  },
  lockedLabel: {
    fontSize: 12.5,
    fontFamily: font.medium,
    color: colors.textMuted,
  },
});
