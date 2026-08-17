import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CalendarHeart,
  Heart,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  UserPlus,
} from 'lucide-react-native';
import { colors, radii, shadows, spacing, toGreekUpperCase } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { relativeTime } from '@/lib/relative-time';
import type { AppNotification, NotificationKind } from '@/lib/social-repo';
import { useSession } from '@/state/session';
import { useSocial } from '@/state/social';
import { Avatar } from '@/components/avatar';

/** Icon and tint per kind, so the list is scannable without reading it. */
const ICONS: Record<NotificationKind, { Icon: typeof Heart; tint: string }> = {
  reply: { Icon: MessageCircle, tint: colors.pink },
  like: { Icon: Heart, tint: colors.pink },
  follow: { Icon: UserPlus, tint: colors.hostPurple },
  event: { Icon: CalendarHeart, tint: colors.gold },
  order: { Icon: ShoppingBag, tint: colors.hostPurple },
  system: { Icon: Sparkles, tint: colors.gold },
};

/**
 * Two buckets only. Anything older than a day reads as history, and a
 * flat list of timestamps is harder to scan than a single divider.
 */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function isRecent(notification: AppNotification): boolean {
  return Date.now() - new Date(notification.createdAt).getTime() < ONE_DAY_MS;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { signedIn } = useSession();
  const {
    notifications,
    unreadNotificationCount,
    markRead,
    markAllRead,
    loading,
    refresh,
  } = useSocial();

  const recent = notifications.filter(isRecent);
  const earlier = notifications.filter((notification) => !isRecent(notification));

  const open = (notification: AppNotification) => {
    markRead(notification.id);

    const target = notification.target;
    if (!target) return;

    if (target.screen === 'thread') {
      router.push({ pathname: '/thread/[id]', params: { id: target.id } });
    } else if (target.screen === 'event') {
      router.push({ pathname: '/event/[id]', params: { id: target.id } });
    } else if (target.screen === 'community') {
      router.push({ pathname: '/community/[id]', params: { id: target.id } });
    } else if (target.screen === 'post') {
      router.push({ pathname: '/post/[id]', params: { id: target.id } });
    } else if (target.screen === 'shop') {
      router.push({ pathname: '/shop/[id]', params: { id: target.id } });
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
          const unread = !notification.read;

          return (
            <Pressable
              key={notification.id}
              onPress={() => open(notification)}
              style={[styles.row, unread && styles.rowUnread]}
              accessibilityRole="button"
              accessibilityLabel={unread ? 'Αδιάβαστη ειδοποίηση' : undefined}
            >
              <View>
                {notification.actor ? (
                  <Avatar size={40} uri={notification.actorAvatarUrl ?? undefined} />
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
                <Text style={styles.time}>{relativeTime(notification.createdAt)}</Text>
              </View>

              {unread ? <View style={styles.unreadDot} /> : null}
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
        {unreadNotificationCount > 0 ? (
          <Pressable
            onPress={markAllRead}
            style={styles.markAll}
            accessibilityRole="button"
          >
            <Text style={styles.markAllLabel}>Όλα ως διαβασμένα</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => void refresh()} tintColor={colors.pink} />
        }
      >
        {renderGroup('Νέα', recent)}
        {renderGroup('Παλαιότερα', earlier)}

        {notifications.length === 0 && !loading ? (
          <Text style={styles.empty}>
            {signedIn
              ? 'Καμία ειδοποίηση ακόμα. Θα σε ειδοποιήσουμε όταν κάτι συμβεί.'
              : 'Κάνε σύνδεση για να δεις τις ειδοποιήσεις σου.'}
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
  empty: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
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
    flex: 1,
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  markAll: {
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  markAllLabel: {
    fontSize: 10.5,
    fontFamily: font.bold,
    color: colors.pink,
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
