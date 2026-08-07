import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MapPin, SlidersHorizontal } from 'lucide-react-native';
import { colors, placeFilterLabel, radii, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { useAppState, type FilterSurface } from '@/state/app-state';
import { FilterSheet } from './filter-sheet';

interface FilterBarProps {
  surface: FilterSurface;
  /** Shown on the sheet's apply button so the effect is visible. */
  resultCount: number;
}

/**
 * The single entry point to filtering. It summarises what is active and
 * opens the sheet — the criteria themselves live there, because a row of
 * chips cannot hold a searchable place list, dates, categories and price
 * without swamping the screen it is meant to filter.
 */
export function FilterBar({ surface, resultCount }: FilterBarProps) {
  const { selectedPlaces, activeFilterCount } = useAppState();
  const [open, setOpen] = useState(false);

  const count = activeFilterCount(surface);
  const active = count > 0;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.pill, active && styles.pillActive]}
        accessibilityRole="button"
        accessibilityLabel="Φίλτρα"
      >
        <MapPin size={13} color={active ? colors.white : colors.pink} />
        <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
          {placeFilterLabel(selectedPlaces)}
        </Text>
        <View style={styles.divider} />
        <SlidersHorizontal size={13} color={active ? colors.white : colors.textSecondary} />
        {active ? (
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{count}</Text>
          </View>
        ) : null}
      </Pressable>

      <FilterSheet
        visible={open}
        onClose={() => setOpen(false)}
        surface={surface}
        resultCount={resultCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xs,
  },
  pill: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1.3,
    borderColor: colors.borderSoft,
    borderRadius: radii.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.md + 2,
  },
  pillActive: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  label: {
    flexShrink: 1,
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.white,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: colors.borderPill,
    marginHorizontal: 2,
  },
  badge: {
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: radii.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    fontSize: 9.5,
    fontFamily: font.extrabold,
    color: colors.pink,
  },
});
