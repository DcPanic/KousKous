import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BadgeCheck } from 'lucide-react-native';
import { colors, findPlace, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { useChat } from '@/state/chat';
import { Avatar } from '@/components/avatar';

export default function ChatListScreen() {
  const router = useRouter();
  const { conversations, loading, refresh, markConversationRead } = useChat();

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

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => void refresh()} tintColor={colors.pink} />
        }
      >
          {conversations.map((conversation) => {
            const unread = conversation.unread;

            return (
            <Pressable
              key={conversation.id}
              style={styles.row}
              onPress={() => {
                markConversationRead(conversation.id);
                router.push({ pathname: '/chat/[id]', params: { id: conversation.id } });
              }}
              accessibilityRole="button"
              accessibilityLabel={`Συνομιλία με ${conversation.name}`}
            >
              <Avatar size={48} uri={conversation.avatarUrl ?? undefined} />

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
                  style={[styles.preview, unread > 0 && styles.previewUnread]}
                  numberOfLines={1}
                >
                  {conversation.lastMessage}
                </Text>
                <Text style={styles.place}>{findPlace(conversation.location)?.name}</Text>
              </View>

              {unread > 0 ? (
                <View style={styles.unread}>
                  <Text style={styles.unreadLabel}>{unread}</Text>
                </View>
              ) : null}
            </Pressable>
            );
          })}

          {conversations.length === 0 && !loading ? (
            <Text style={styles.empty}>
              Καμία συνομιλία ακόμα. Άνοιξε το προφίλ μιας γυναίκας και στείλε της μήνυμα.
            </Text>
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
  empty: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
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
});
