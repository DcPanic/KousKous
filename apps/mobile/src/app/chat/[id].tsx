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
  ImagePlus,
  SendHorizontal,
  ShieldAlert,
  Video,
} from 'lucide-react-native';
import { colors, findPlace, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import type { Attachment } from '@/data/forum';
import { pickMedia } from '@/lib/media';
import { useChat } from '@/state/chat';
import { Avatar } from '@/components/avatar';
import { AttachmentGrid } from '@/components/attachments';
import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { conversations, messagesFor, loadMessages, send, markConversationRead } = useChat();

  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversationId = typeof id === 'string' ? id : '';
  const conversation = conversations.find((item) => item.id === conversationId);

  useEffect(() => {
    if (!conversationId) return;
    void loadMessages(conversationId);
    markConversationRead(conversationId);
  }, [conversationId, loadMessages, markConversationRead]);

  if (!conversation) {
    return (
      <PlaceholderScreen
        title="Η συνομιλία δεν βρέθηκε"
        subtitle="Άγνωστη συνομιλία"
        body="Ίσως διαγράφηκε ή ο σύνδεσμος είναι λάθος."
      />
    );
  }

  const messages = messagesFor(conversation.id);
  const personId = conversation.personId;

  const attach = async (kind: 'image' | 'video') => {
    const picked = await pickMedia(kind);
    if (picked.length > 0) setAttachments((prev) => [...prev, ...picked]);
  };

  const submit = async () => {
    if ((draft.trim().length === 0 && attachments.length === 0) || sending) return;

    setSending(true);
    setError(null);

    const ok = await send(conversation.id, draft.trim(), attachments[0]);

    setSending(false);

    if (!ok) {
      setError('Το μήνυμα δεν στάλθηκε. Δοκίμασε ξανά.');
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

        <Pressable
          onPress={() =>
            personId ? router.push({ pathname: '/u/[id]', params: { id: personId } }) : undefined
          }
          disabled={!personId}
          style={styles.headerTap}
          accessibilityRole={personId ? 'button' : undefined}
          accessibilityLabel={personId ? `Προφίλ: ${conversation.name}` : undefined}
        >
          <Avatar size={36} uri={conversation.avatarUrl ?? undefined} />

          <View style={styles.headerText}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {conversation.name}
              </Text>
              {conversation.verified ? (
                <BadgeCheck size={13} color={colors.pink} fill={colors.pinkTint} />
              ) : null}
            </View>
            <Text style={styles.headerMeta}>{findPlace(conversation.location)?.name}</Text>
          </View>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.safetyNote}>
            <ShieldAlert size={14} color={colors.pinkDark} />
            <Text style={styles.safetyLabel}>
              Μην στέλνεις ποτέ χρήματα ή προσωπικά στοιχεία μέσα από τα μηνύματα.
            </Text>
          </View>

          {messages.map((message) => (
            <View
              key={message.id}
              style={[styles.bubbleRow, message.mine ? styles.rowMine : styles.rowTheirs]}
            >
              <View style={[styles.bubble, message.mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                {message.body.length > 0 ? (
                  <Text style={[styles.bubbleText, message.mine && styles.bubbleTextMine]}>
                    {message.body}
                  </Text>
                ) : null}
                <AttachmentGrid attachments={message.attachments} height={140} />
                <Text style={[styles.time, message.mine && styles.timeMine]}>{message.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

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
                placeholder="Γράψε μήνυμα..."
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
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
  headerTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 14.5,
    fontFamily: font.extrabold,
    color: colors.text,
    flexShrink: 1,
  },
  headerMeta: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  safetyLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: font.medium,
    color: colors.pinkDark,
    lineHeight: 16,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
  },
  bubbleMine: {
    backgroundColor: colors.pink,
    borderBottomRightRadius: radii.sm,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radii.sm,
    boxShadow: shadows.card,
  },
  bubbleText: {
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 20,
  },
  bubbleTextMine: {
    color: colors.white,
  },
  time: {
    fontSize: 9.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeMine: {
    color: colors.pinkTint,
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
});
