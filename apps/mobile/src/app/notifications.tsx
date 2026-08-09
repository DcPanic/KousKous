import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CalendarHeart,
  Heart,
  MessageCircle,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing, toGreekUpperCase } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { notifications, type AppNotification, type NotificationKind } from '@/data/notifications';
import { Avatar } from '@/components/avatar';

/** Icon and tint per kind, so the list is scannable without reading it. */
const ICONS: Record<NotificationKind, { Icon: typeof Heart; tint: string }> = {
  reply: { Icon: MessageCircle, tint: colors.pink },
  like: { Icon: Heart, tint: colors.pink },
  follow: { Icon: UserPlus, tint: colors.hostPurple },
  event: { Icon: CalendarHeart, tint: colors.gold },
  community: { Icon: Users, tint: colors.hostPurple },
  system: { Icon: Sparkles, tint: colors.gold },
};

/**
 * Two buckets only. Anything older than a day reads as history, and a
 * flat list of timestamps is harder to scan than a single divider.
 */
const RECENT_LABELS = ['λεπτά', 'ώρα', 'ώρες'];

function isRecent(notification: AppNotification): boolean {
  return RECENT_LABELS.some((label) => notification.timeAgo.includes(label));
}

export default function NotificationsScreen() {
  const router = useRouter();

  const recent = notifications.filter(isRecent);
  const earlier = notifications.filter((notification) => !isRecent(notification));

  const open = (notification: AppNotification) => {
    const target = notification.target;
    if (!target) return;

    if (target.screen === 'thread') {
      router.push({ pathname: '/thread/[id]', params: { id: target.id } });
    } else if (target.screen === 'event') {
      router.push({ pathname: '/event/[id]', params: { id: target.id } });
    } else if (target.screen === 'community') {
      router.push({ pathname: '/community/[id]', params: { id: target.id } });
    } else {
      router.push({ pathname: '/chat/[id]', params: { id: target.id } });
    }
  };

  const renderGroup = (label: string, items: AppNotification[]) => {
    if (items.length === 0) return null;

    return (
      <View>
        <Text style={styles.groupLabel}>{toGreekUpperCase(label)}</Text>
        {items.map((notification) => {
          const { Icon, tint } = ICONS[notification.kind];
          const tappable = notification.target !== null;

          return (
            <Pressable
              key={notification.id}
              onPress={() => open(notification)}
              disabled={!tappable}
              style={[styles.row, !notification.read && styles.rowUnread]}
              accessibilityRole={tappable ? 'button' : 'text'}
            >
              <View>
                {notification.actor ? (
                  <Avatar size={40} />
                ) : (
                  <View style={[styles.systemAvatar, { backgroundColor: `${tint}22` }]}>
                    <Icon size={18} color={tint} />
                  </View>
                )}
                {notification.actor ? (
                  <View style={[styles.kindBadge, { backgroundColor: tint }]}>
                    <Icon size={10} color={colors.white} />
                  </View>
                ) : null}
              </View>

              <View style={styles.rowText}>
                <Text style={styles.body}>
                  {notification.actor ? (
                    <Text style={styles.actor}>{notification.actor} </Text>
                  ) : null}
                  {notification.body}
                </Text>
                <Text style={styles.time}>{notification.timeAgo}</Text>
              </View>

              {!notification.read ? <View style={styles.unreadDot} /> : null}
            </Pressable>
          );
        })}
      </View>
    );
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
        <Text style={styles.headerTitle}>Ειδοποιήσεις</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {renderGroup('Νέα', recent)}
        {renderGroup('Παλαιότερα', earlier)}
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
  groupLabel: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.7,
    color: colors.pink,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
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
  rowUnread: {
    backgroundColor: colors.pinkSoft,
  },
  systemAvatar: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kindBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  rowText: {
    flex: 1,
  },
  body: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 18,
  },
  actor: {
    fontFamily: font.bold,
    color: colors.text,
  },
  time: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.pink,
  },
});
