import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, MapPin, Search, X } from 'lucide-react-native';
import {
  colors,
  datePresetLabels,
  datePresetOrder,
  eventCategories,
  findPlace,
  placeBreadcrumb,
  placeKindLabels,
  regionsWithPlaces,
  priceBandLabels,
  priceBandOrder,
  radii,
  searchPlaces,
  spacing,
  toGreekUpperCase,
  type Country,
  type Place,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import { useAppState, type FilterSurface } from '@/state/app-state';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  surface: FilterSurface;
  /** How many items the current filters leave, shown on the apply button. */
  resultCount: number;
}

const COUNTRIES: { id: Country; label: string }[] = [
  { id: 'GR', label: 'Ελλάδα' },
  { id: 'CY', label: 'Κύπρος' },
];

export function FilterSheet({ visible, onClose, surface, resultCount }: FilterSheetProps) {
  const {
    selectedPlaces,
    togglePlace,
    eventCategoryIds,
    toggleEventCategory,
    datePreset,
    setDatePreset,
    priceBand,
    setPriceBand,
    availableOnly,
    setAvailableOnly,
    activeFilterCount,
    clearFilters,
  } = useAppState();

  const [query, setQuery] = useState('');
  const [country, setCountry] = useState<Country>('GR');

  const suggestions = useMemo(() => searchPlaces(query), [query]);
  const browsable = useMemo(() => regionsWithPlaces(country), [country]);
  const isEvents = surface === 'events';
  const activeCount = activeFilterCount(surface);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} accessibilityLabel="Κλείσιμο" />

        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Κλείσιμο">
              <X size={20} color={colors.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Φίλτρα</Text>
            <Pressable
              onPress={() => clearFilters(surface)}
              disabled={activeCount === 0}
              hitSlop={10}
              accessibilityRole="button"
            >
              <Text style={[styles.clear, activeCount === 0 && styles.clearDisabled]}>
                Καθαρισμός
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <SectionTitle>Τοποθεσία</SectionTitle>

            <View style={styles.searchBox}>
              <Search size={16} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Χώρα, πόλη ή περιοχή…"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                autoCorrect={false}
              />
              {query.length > 0 ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Καθαρισμός αναζήτησης">
                  <X size={15} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </View>

            {selectedPlaces.length > 0 ? (
              <View style={styles.chosenRow}>
                {selectedPlaces.map((id) => {
                  const place = findPlace(id);
                  if (!place) return null;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => togglePlace(id)}
                      style={styles.chosenChip}
                      accessibilityRole="button"
                      accessibilityLabel={`Αφαίρεση ${place.name}`}
                    >
                      <Text style={styles.chosenLabel}>{place.name}</Text>
                      <X size={12} color={colors.pinkDark} />
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {query.length > 0 ? (
              <View style={styles.suggestions}>
                {suggestions.map((place) => (
                  <SuggestionRow
                    key={place.id}
                    place={place}
                    selected={selectedPlaces.includes(place.id)}
                    onPress={() => togglePlace(place.id)}
                  />
                ))}
                {suggestions.length === 0 ? (
                  <Text style={styles.noResults}>Καμία τοποθεσία με «{query}»</Text>
                ) : null}
              </View>
            ) : (
              <>
                <View style={styles.countryRow}>
                  {COUNTRIES.map((item) => {
                    const active = item.id === country;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => setCountry(item.id)}
                        style={[styles.countryTab, active && styles.countryTabActive]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                      >
                        <Text style={[styles.countryLabel, active && styles.countryLabelActive]}>
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {browsable.map(({ region, children }) => {
                  const regionSelected = selectedPlaces.includes(region.id);
                  return (
                    <View key={region.id} style={styles.regionBlock}>
                      <Pressable
                        onPress={() => togglePlace(region.id)}
                        style={styles.regionHeader}
                        accessibilityRole="button"
                        accessibilityState={{ selected: regionSelected }}
                        accessibilityLabel={`Όλη η περιοχή ${region.name}`}
                      >
                        <Text style={[styles.regionName, regionSelected && styles.regionNameActive]}>
                          {region.name}
                        </Text>
                        <Text style={[styles.regionAll, regionSelected && styles.regionAllActive]}>
                          {regionSelected ? '✓ όλη η περιοχή' : 'όλη η περιοχή'}
                        </Text>
                      </Pressable>

                      <View style={styles.chipWrap}>
                        {children.map((place) => {
                          const selected = selectedPlaces.includes(place.id);
                          return (
                            <Pressable
                              key={place.id}
                              onPress={() => togglePlace(place.id)}
                              style={[styles.chip, selected && styles.chipActive]}
                              accessibilityRole="button"
                              accessibilityState={{ selected }}
                            >
                              {selected ? <Check size={11} color={colors.pinkDark} /> : null}
                              <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>
                                {place.name}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {isEvents ? (
              <>
                <SectionTitle>Πότε</SectionTitle>
                <View style={styles.chipWrap}>
                  {datePresetOrder.map((preset) => {
                    const selected = preset === datePreset;
                    return (
                      <Pressable
                        key={preset}
                        onPress={() => setDatePreset(preset)}
                        style={[styles.chip, selected && styles.chipActive]}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                      >
                        <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>
                          {datePresetLabels[preset]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <SectionTitle>Είδος</SectionTitle>
                <View style={styles.chipWrap}>
                  {eventCategories.map((category) => {
                    const selected = eventCategoryIds.includes(category.id);
                    return (
                      <Pressable
                        key={category.id}
                        onPress={() => toggleEventCategory(category.id)}
                        style={[styles.chip, selected && styles.chipActive]}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                      >
                        <Text style={styles.chipEmoji}>{category.emoji}</Text>
                        <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>
                          {category.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <SectionTitle>Τιμή</SectionTitle>
                <View style={styles.chipWrap}>
                  {priceBandOrder.map((band) => {
                    const selected = band === priceBand;
                    return (
                      <Pressable
                        key={band}
                        onPress={() => setPriceBand(band)}
                        style={[styles.chip, selected && styles.chipActive]}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                      >
                        <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>
                          {priceBandLabels[band]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.switchRow}>
                  <View style={styles.switchText}>
                    <Text style={styles.switchLabel}>Μόνο με διαθέσιμες θέσεις</Text>
                    <Text style={styles.switchHint}>Κρύβει όσα έχουν συμπληρωθεί</Text>
                  </View>
                  <Switch
                    value={availableOnly}
                    onValueChange={setAvailableOnly}
                    trackColor={{ true: colors.pink, false: colors.borderPill }}
                    thumbColor={colors.white}
                  />
                </View>
              </>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.apply} onPress={onClose} accessibilityRole="button">
              <Text style={styles.applyLabel}>
                {resultCount === 1 ? 'Εμφάνιση 1 αποτελέσματος' : `Εμφάνιση ${resultCount} αποτελεσμάτων`}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{toGreekUpperCase(children)}</Text>;
}

interface SuggestionRowProps {
  place: Place;
  selected: boolean;
  onPress: () => void;
}

function SuggestionRow({ place, selected, onPress }: SuggestionRowProps) {
  const breadcrumb = placeBreadcrumb(place.id);

  return (
    <Pressable
      onPress={onPress}
      style={styles.suggestion}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <MapPin size={15} color={selected ? colors.pink : colors.textMuted} />
      <View style={styles.suggestionText}>
        <Text style={styles.suggestionName}>{place.name}</Text>
        <Text style={styles.suggestionMeta}>
          {placeKindLabels[place.kind]}
          {breadcrumb ? ` · ${breadcrumb}` : ''}
        </Text>
      </View>
      {selected ? <Check size={16} color={colors.pink} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.scrim,
  },
  backdropTap: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.xl + 8,
    borderTopRightRadius: radii.xl + 8,
    maxHeight: '88%',
  },
  grabber: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.borderPill,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  clear: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.pink,
  },
  clearDisabled: {
    color: colors.textFaint,
  },
  body: {
    paddingHorizontal: spacing.screen,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.pink,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: 10,
    borderWidth: 1.3,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.medium,
    color: colors.text,
  },
  chosenRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  chosenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.full,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  chosenLabel: {
    fontSize: 11.5,
    fontFamily: font.extrabold,
    color: colors.pinkDark,
  },
  suggestions: {
    marginTop: spacing.md,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
    marginBottom: 6,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  suggestionMeta: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 1,
  },
  noResults: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
  countryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  countryTab: {
    paddingVertical: 7,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
  },
  countryTabActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  countryLabel: {
    fontSize: 12,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  countryLabelActive: {
    color: colors.white,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  regionBlock: {
    marginBottom: spacing.lg,
  },
  regionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  regionName: {
    fontSize: 12.5,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  regionNameActive: {
    color: colors.pinkDark,
  },
  regionAll: {
    fontSize: 10.5,
    fontFamily: font.bold,
    color: colors.textFaint,
  },
  regionAllActive: {
    color: colors.pink,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.pink,
    backgroundColor: colors.pinkSoft,
  },
  chipEmoji: {
    fontSize: 13,
  },
  chipLabel: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  chipLabelActive: {
    color: colors.pinkDark,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  switchText: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  switchHint: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  apply: {
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  applyLabel: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
});
