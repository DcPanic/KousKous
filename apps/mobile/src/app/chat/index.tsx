import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BadgeCheck, MessageSquareText } from 'lucide-react-native';
import { can, colors, findPlace, paidMemberCta, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { conversations } from '@/data/chat';
import { useSession } from '@/state/session';
import { Avatar } from '@/components/avatar';

export default function ChatListScreen() {
  const router = useRouter();
  const { user } = useSession();
  const allowed = can(user, 'chat');

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
        <Text style={styles.headerTitle}>Μηνύματα</Text>
      </View>

      {allowed ? (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {conversations.map((conversation) => (
            <Pressable
              key={conversation.id}
              style={styles.row}
              onPress={() =>
                router.push({ pathname: '/chat/[id]', params: { id: conversation.id } })
              }
              accessibilityRole="button"
              accessibilityLabel={`Συνομιλία με ${conversation.name}`}
            >
              <View>
                <Avatar size={48} />
                {conversation.online ? <View style={styles.onlineDot} /> : null}
              </View>

              <View style={styles.rowText}>
                <View style={styles.rowTop}>
                  <Text style={styles.name} numberOfLines={1}>
                    {conversation.name}
                  </Text>
                  {conversation.verified ? (
                    <BadgeCheck size={13} color={colors.pink} fill={colors.pinkTint} />
                  ) : null}
                  <Text style={styles.time}>{conversation.lastTime}</Text>
                </View>
                <Text
                  style={[styles.preview, conversation.unread > 0 && styles.previewUnread]}
                  numberOfLines={1}
                >
                  {conversation.lastMessage}
                </Text>
                <Text style={styles.place}>{findPlace(conversation.location)?.name}</Text>
              </View>

              {conversation.unread > 0 ? (
                <View style={styles.unread}>
                  <Text style={styles.unreadLabel}>{conversation.unread}</Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.locked}>
          <View style={styles.lockedIcon}>
            <MessageSquareText size={22} color={colors.pink} />
          </View>
          <Text style={styles.lockedTitle}>Τα μηνύματα είναι για μέλη</Text>
          <Text style={styles.lockedBody}>
            Στείλε μήνυμα σε γυναίκες που γνώρισες σε events και κοινότητες.
          </Text>
          <Pressable style={styles.cta} accessibilityRole="button">
            <Text style={styles.ctaLabel}>{paidMemberCta}</Text>
          </Pressable>
        </View>
      )}
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
  list: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.sm,
    boxShadow: shadows.card,
  },
  onlineDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 12,
    height: 12,
    borderRadius: radii.full,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  rowText: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 13.5,
    fontFamily: font.bold,
    color: colors.text,
    flexShrink: 1,
  },
  time: {
    marginLeft: 'auto',
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  preview: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  previewUnread: {
    color: colors.text,
    fontFamily: font.bold,
  },
  place: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textFaint,
    marginTop: 1,
  },
  unread: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: radii.full,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadLabel: {
    fontSize: 10.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  locked: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  lockedIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.pinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedTitle: {
    fontSize: 16.5,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  lockedBody: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  cta: {
    marginTop: spacing.sm,
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: 26,
  },
  ctaLabel: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
});
