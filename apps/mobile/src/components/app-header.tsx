import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, Menu, MessageSquareText, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors, fontSizes, radii, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { useAppState } from '@/state/app-state';

/** Unread notification count. Static until notifications are wired up. */
const UNREAD_COUNT = 3;

export function AppHeader() {
  const { openDrawer } = useAppState();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        <Pressable onPress={openDrawer} hitSlop={10} accessibilityRole="button" accessibilityLabel="Μενού">
          <Menu size={20} color={colors.text} strokeWidth={2} />
        </Pressable>
        <Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel="Ειδοποιήσεις">
          <Bell size={21} color={colors.text} strokeWidth={1.8} />
          {UNREAD_COUNT > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{UNREAD_COUNT}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View>
        <Text style={styles.logo}>KousKous</Text>
        <Text style={styles.logoHeart}>♥</Text>
      </View>

      <View style={[styles.side, styles.sideRight]}>
        <Pressable hitSlop={10} accessibilityRole="button" accessibilityLabel="Μηνύματα">
          <MessageSquareText size={21} color={colors.text} strokeWidth={1.8} />
        </Pressable>
        <Pressable
          onPress={() => router.push('/create')}
          style={styles.createButton}
          accessibilityRole="button"
          accessibilityLabel="Δημιουργία"
        >
          <Plus size={17} color={colors.white} strokeWidth={2.6} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    // Reserve equal width on both sides so the logo stays optically centred.
    minWidth: 78,
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  logo: {
    fontFamily: font.logo,
    fontSize: fontSizes.logo,
    lineHeight: fontSizes.logo * 1.4,
    color: colors.pink,
  },
  logoHeart: {
    position: 'absolute',
    top: 0,
    right: -14,
    fontSize: 13,
    color: colors.pink,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -6,
    width: 15,
    height: 15,
    borderRadius: radii.full,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.cream,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontFamily: font.extrabold,
  },
  createButton: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
