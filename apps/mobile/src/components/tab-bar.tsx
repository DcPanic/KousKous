import { useRouter } from 'expo-router';
// expo-router 57 vendors its own navigator; the bottom-tab types ship with
// the js-tabs entry point rather than @react-navigation/bottom-tabs.
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, Home, Plus, User as UserIcon, Users, type LucideIcon } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { Avatar } from './avatar';

/**
 * Bottom navigation (spec §6).
 *
 * Every item carries a label under its icon — a deliberate departure from
 * Instagram's icon-only bar. The centre action is not a tab: it opens the
 * create-post modal, so it is rendered outside the navigator's route list.
 */

const TAB_META: Record<string, { label: string; icon: LucideIcon }> = {
  index: { label: 'Αρχική', icon: Home },
  communities: { label: 'Κοινότητες', icon: Users },
  events: { label: 'Events', icon: Calendar },
  profile: { label: 'Προφίλ', icon: UserIcon },
};

/** Where the centre button sits relative to the other tabs. */
const CENTER_INDEX = 2;

export function AppTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const router = useRouter();

  const items = state.routes.map((route, index) => {
    const meta = TAB_META[route.name];
    if (!meta) return null;

    const focused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TabButton
        key={route.key}
        label={meta.label}
        icon={meta.icon}
        focused={focused}
        onPress={onPress}
        // The home icon is the only filled one; profile shows an avatar.
        filled={route.name === 'index'}
        avatar={route.name === 'profile'}
      />
    );
  });

  const withCenter = [
    ...items.slice(0, CENTER_INDEX),
    <Pressable
      key="create"
      style={styles.centerButton}
      onPress={() => router.push('/create')}
      accessibilityRole="button"
      accessibilityLabel="Δημιουργία"
    >
      <Plus size={22} color={colors.white} strokeWidth={2.6} />
    </Pressable>,
    ...items.slice(CENTER_INDEX),
  ];

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 22) }]}>{withCenter}</View>
  );
}

interface TabButtonProps {
  label: string;
  icon: LucideIcon;
  focused: boolean;
  filled: boolean;
  avatar: boolean;
  onPress: () => void;
}

function TabButton({ label, icon: Icon, focused, filled, avatar, onPress }: TabButtonProps) {
  const tint = focused ? colors.pink : colors.textInactive;

  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      {avatar ? (
        <View style={[styles.tabAvatar, focused && styles.tabAvatarActive]}>
          <Avatar size={18} />
        </View>
      ) : (
        <Icon
          size={21}
          color={tint}
          strokeWidth={focused ? 2.3 : 1.8}
          fill={focused && filled ? colors.pink : 'transparent'}
        />
      )}
      <Text style={[styles.tabLabel, { color: tint, fontFamily: focused ? font.extrabold : font.semibold }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    paddingHorizontal: 6,
    // The centre button is lifted above the bar and must not be clipped.
    overflow: 'visible',
  },
  tab: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 9.5,
  },
  tabAvatar: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabAvatarActive: {
    borderColor: colors.pink,
  },
  centerButton: {
    width: 46,
    height: 46,
    borderRadius: radii.full,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
    boxShadow: shadows.fab,
  },
});
