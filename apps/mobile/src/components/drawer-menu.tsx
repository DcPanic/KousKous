import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  BarChart3,
  Bookmark,
  ChevronRight,
  Gift,
  HelpCircle,
  LogOut,
  Settings,
  Sparkles,
  UserPlus,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import {
  type AccountTier,
  categoriesByGroup,
  categoryGroupLabels,
  categoryGroupOrder,
  colors,
  gradients,
  layout,
  radii,
  shadows,
  toGreekUpperCase,
  spacing,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import { useAppState } from '@/state/app-state';
import { useSession } from '@/state/session';
import { Avatar } from './avatar';
import { DiagonalGradient } from './gradient';

const ANIMATION_MS = 280;

const tierLabels: Record<AccountTier, { text: string; color: string }> = {
  free: { text: 'Free Member', color: colors.pink },
  paid: { text: 'Μέλος', color: colors.pink },
  host: { text: 'Premium Event Host', color: colors.hostPurple },
  official: { text: 'Official Account', color: colors.hostPurple },
};

/**
 * Side menu (spec §6). Holds the grouped category list with per-category
 * follow toggles, plus the account links. Hosts and the Official account
 * additionally get an entry point into their dashboard.
 */
export function DrawerMenu() {
  const { drawerOpen, closeDrawer, isFollowing, toggleFollow } = useAppState();
  const { user, tier } = useSession();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // useWindowDimensions re-renders on resize, unlike a one-off
  // Dimensions.get. Static web rendering has no window to measure and
  // reports 0; falling back to the cap keeps the closed panel translated
  // fully off-screen instead of collapsing to zero width and showing
  // through at the left edge.
  const { width: windowWidth } = useWindowDimensions();
  const width =
    windowWidth > 0
      ? Math.min(windowWidth * layout.drawerWidthRatio, layout.drawerMaxWidth)
      : layout.drawerMaxWidth;

  // Starts fully off-screen; the extra 5% keeps the shadow hidden too.
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: drawerOpen ? 1 : 0,
      duration: ANIMATION_MS,
      useNativeDriver: true,
    }).start();
  }, [drawerOpen, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 1.05, 0],
  });

  const tierLabel = tierLabels[tier];
  const showsDashboard = tier === 'host' || tier === 'official';

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: drawerOpen ? 'auto' : 'none' }]}>
      <Animated.View style={[styles.scrim, { opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} accessibilityLabel="Κλείσιμο μενού" />
      </Animated.View>

      <Animated.View style={[styles.panel, { width, transform: [{ translateX }] }]}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.screen }]}>
          <View style={styles.headerUser}>
            <Avatar size={46} />
            <View style={styles.headerText}>
              <Text style={styles.headerName} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={[styles.headerTier, { color: tierLabel.color }]}>{tierLabel.text}</Text>
            </View>
          </View>
          <Pressable onPress={closeDrawer} hitSlop={10} accessibilityRole="button" accessibilityLabel="Κλείσιμο">
            <X size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          {showsDashboard ? (
            <Pressable
              onPress={() => {
                closeDrawer();
                router.push(tier === 'official' ? '/official' : '/host');
              }}
              accessibilityRole="button"
            >
              <DiagonalGradient
                colors={tier === 'official' ? gradients.official : gradients.host}
                style={styles.dashboardButton}
              >
                <BarChart3 size={19} color={colors.white} />
                <Text style={styles.dashboardLabel}>
                  {tier === 'official' ? 'Official Dashboard' : 'Dashboard Διοργανώτριας'}
                </Text>
                <ChevronRight size={16} color={colors.white} />
              </DiagonalGradient>
            </Pressable>
          ) : null}

          <TierSwitcher />

          {categoryGroupOrder.map((group) => (
            <View key={group}>
              <DrawerSection label={categoryGroupLabels[group]} />
              {categoriesByGroup(group).map((category) => (
                <DrawerRow
                  key={category.id}
                  emoji={category.emoji}
                  label={category.name}
                  following={isFollowing(category.id)}
                  onToggle={() => toggleFollow(category.id)}
                />
              ))}
            </View>
          ))}

          <DrawerSection label="Λογαριασμός" />
          <DrawerRow
            icon={Bookmark}
            label="Αγαπημένα"
            onPress={() => {
              closeDrawer();
              router.push('/saved');
            }}
          />
          <DrawerRow
            icon={Gift}
            label="Δώρα & Προσφορές"
            onPress={() => {
              closeDrawer();
              router.push('/rewards');
            }}
          />
          <DrawerRow icon={UserPlus} label="Φίλες" />
          <DrawerRow
            icon={Sparkles}
            label="Γίνε Premium Host"
            onPress={() => {
              closeDrawer();
              router.push('/host-plan');
            }}
          />
          <DrawerRow
            icon={Settings}
            label="Ρυθμίσεις"
            onPress={() => {
              closeDrawer();
              router.push('/settings');
            }}
          />
          <DrawerRow icon={HelpCircle} label="Βοήθεια" />
          <DrawerRow icon={LogOut} label="Αποσύνδεση" />
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function DrawerSection({ label }: { label: string }) {
  return <Text style={styles.section}>{toGreekUpperCase(label)}</Text>;
}

interface DrawerRowProps {
  emoji?: string;
  icon?: LucideIcon;
  label: string;
  following?: boolean;
  onToggle?: () => void;
  onPress?: () => void;
}

function DrawerRow({ emoji, icon: Icon, label, following, onToggle, onPress }: DrawerRowProps) {
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {emoji ? (
        <Text style={styles.rowEmoji}>{emoji}</Text>
      ) : Icon ? (
        <Icon size={18} color={colors.text} strokeWidth={1.8} />
      ) : null}
      <Text style={styles.rowLabel}>{label}</Text>
      {onToggle ? (
        <Pressable
          onPress={onToggle}
          style={[styles.followPill, following && styles.followPillActive]}
          accessibilityRole="button"
          accessibilityState={{ selected: following }}
        >
          <Text style={[styles.followLabel, following && styles.followLabelActive]}>
            {following ? 'Ακολουθείς' : 'Follow'}
          </Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

/**
 * Development-only account switcher.
 *
 * Lets the four account types from spec §2 be previewed before auth exists.
 * Delete this together with the mock session provider.
 */
function TierSwitcher() {
  const { tier, setTier } = useSession();
  const options: [AccountTier, string][] = [
    ['free', 'Free'],
    ['paid', 'Μέλος'],
    ['host', 'Host'],
    ['official', 'Official'],
  ];

  return (
    <View style={styles.switcher}>
      <DrawerSection label="Preview λογαριασμού (dev)" />
      <View style={styles.switcherRow}>
        {options.map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => setTier(value)}
            style={[styles.switcherChip, tier === value && styles.switcherChipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: tier === value }}
          >
            <Text style={[styles.switcherLabel, tier === value && styles.switcherLabelActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.scrim,
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.surface,
    boxShadow: shadows.drawer,
    // Belt and braces: content must never spill outside the panel, even
    // if its width is measured as smaller than the content inside it.
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 14.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  headerTier: {
    fontSize: 11.5,
    fontFamily: font.bold,
    marginTop: 1,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  dashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    padding: spacing.md + 2,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
  },
  dashboardLabel: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  section: {
    fontSize: 10.5,
    fontFamily: font.extrabold,
    letterSpacing: 0.85,
    color: colors.textEyebrow,
    paddingTop: spacing.lg,
    paddingBottom: 6,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
  },
  rowEmoji: {
    fontSize: 17,
    width: 20,
    textAlign: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: font.medium,
    color: colors.text,
  },
  followPill: {
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.3,
    borderColor: colors.borderPill,
    backgroundColor: colors.surface,
  },
  followPillActive: {
    borderColor: 'transparent',
    backgroundColor: colors.pinkSoft,
  },
  followLabel: {
    fontSize: 10.5,
    fontFamily: font.extrabold,
    color: colors.textMuted,
  },
  followLabelActive: {
    color: colors.pinkDark,
  },
  switcher: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  switcherRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: spacing.md,
  },
  switcherChip: {
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.3,
    borderColor: colors.borderPill,
  },
  switcherChipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  switcherLabel: {
    fontSize: 10.5,
    fontFamily: font.extrabold,
    color: colors.textMuted,
  },
  switcherLabelActive: {
    color: colors.white,
  },
});
