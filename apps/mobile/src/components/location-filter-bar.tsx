import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, MapPin, SlidersHorizontal } from 'lucide-react-native';
import { colors, locationFilterLabel, locations, radii, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { useAppState } from '@/state/app-state';

/**
 * Location filter (spec §4). Lives above the tab navigator because the same
 * selection filters the Feed, Forums and Events.
 */
export function LocationFilterBar() {
  const { selectedLocations, toggleLocation, clearLocations } = useAppState();
  const [expanded, setExpanded] = useState(false);
  const active = selectedLocations.length > 0;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setExpanded((open) => !open)}
        style={[styles.pill, active && styles.pillActive]}
        accessibilityRole="button"
      >
        <MapPin size={13} color={active ? colors.white : colors.pink} />
        <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
          {locationFilterLabel(selectedLocations)}
        </Text>
        <SlidersHorizontal size={12} color={active ? colors.white : colors.textSecondary} />
      </Pressable>

      {expanded ? (
        <View style={styles.chips}>
          {locations.map((location) => {
            const selected = selectedLocations.includes(location.id);
            return (
              <Pressable
                key={location.id}
                onPress={() => toggleLocation(location.id)}
                style={[styles.chip, selected && styles.chipSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                {selected ? <Check size={11} color={colors.pinkDark} /> : null}
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                  {location.name}
                </Text>
              </Pressable>
            );
          })}
          {active ? (
            <Pressable onPress={clearLocations} style={styles.clear} accessibilityRole="button">
              <Text style={styles.clearLabel}>Καθαρισμός</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1.3,
    borderColor: colors.borderSoft,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: spacing.md + 2,
  },
  pillActive: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  pillLabel: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textSecondary,
  },
  pillLabelActive: {
    color: colors.white,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: spacing.md + 2,
    borderRadius: 20,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.pink,
    backgroundColor: colors.pinkSoft,
  },
  chipLabel: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  chipLabelSelected: {
    color: colors.pinkDark,
  },
  clear: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  clearLabel: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
});
