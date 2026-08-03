import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';

export type FeedTab = 'foryou' | 'following' | 'trending';

/** "Ακολουθείτε" is driven by the categories followed in the drawer. */
const TABS: [FeedTab, string][] = [
  ['foryou', 'For you'],
  ['following', 'Ακολουθείτε'],
  ['trending', 'Trending'],
];

interface FeedTabsProps {
  value: FeedTab;
  onChange: (tab: FeedTab) => void;
}

export function FeedTabs({ value, onChange }: FeedTabsProps) {
  return (
    <View style={styles.container}>
      {TABS.map(([key, label]) => {
        const active = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.tab, active && styles.tabActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[
                styles.label,
                { color: active ? colors.pink : colors.textMuted, fontFamily: active ? font.extrabold : font.semibold },
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: spacing.screen,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingBottom: spacing.md,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.pink,
  },
  label: {
    fontSize: 13.5,
  },
});
