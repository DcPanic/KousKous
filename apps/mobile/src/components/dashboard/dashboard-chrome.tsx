import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, type LucideIcon } from 'lucide-react-native';
import { colors, radii, shadows, spacing, toGreekUpperCase } from '@kouskous/shared';
import { font } from '@/theme/typography';

/**
 * Chrome shared by the Host and Official dashboards.
 *
 * Both are separate "modes" rather than tabs of the main app: they replace
 * the bottom navigation with their own, and carry a distinct accent colour
 * so it is always obvious which mode you are in (spec §6).
 */

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        accessibilityRole="button"
        accessibilityLabel="Πίσω στην εφαρμογή"
      >
        <ArrowLeft size={17} color={colors.text} />
      </Pressable>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

export interface DashboardTab<T extends string> {
  key: T;
  label: string;
  icon: LucideIcon;
}

interface DashboardTabBarProps<T extends string> {
  tabs: DashboardTab<T>[];
  value: T;
  onChange: (tab: T) => void;
  accent: string;
}

export function DashboardTabBar<T extends string>({
  tabs,
  value,
  onChange,
  accent,
}: DashboardTabBarProps<T>) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 22) }]}>
      {tabs.map(({ key, label, icon: Icon }) => {
        const active = key === value;
        const tint = active ? accent : colors.textInactive;

        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Icon size={19} color={tint} strokeWidth={active ? 2.3 : 1.8} />
            <Text
              style={[
                styles.tabLabel,
                { color: tint, fontFamily: active ? font.extrabold : font.semibold },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tint: string;
}

export function StatCard({ label, value, icon: Icon, tint }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      {/* 1A is 10% alpha — the tinted chip behind each stat icon. */}
      <View style={[styles.statIcon, { backgroundColor: `${tint}1A` }]}>
        <Icon size={15} color={tint} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/** Uppercase section label tinted with the dashboard's accent colour. */
export function DashboardEyebrow({ children, accent }: { children: string; accent: string }) {
  return <Text style={[styles.eyebrow, { color: accent }]}>{toGreekUpperCase(children)}</Text>;
}

export const dashboardStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: 6,
    paddingBottom: spacing.xl,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    boxShadow: shadows.card,
  },
  primaryButton: {
    borderRadius: radii.lg,
    paddingVertical: spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.screen,
  },
  primaryButtonLabel: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  title: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    paddingHorizontal: 6,
  },
  tab: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    boxShadow: shadows.card,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 17,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  statLabel: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.7,
    marginBottom: spacing.md,
  },
});
