import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Check, ChevronDown, Search, X } from 'lucide-react-native';
import {
  categories,
  categoriesByGroup,
  categoryGroupLabels,
  categoryGroupOrder,
  colors,
  findCategory,
  findSubcategory,
  normalizeForSearch,
  radii,
  spacing,
  subcategoriesFor,
  toGreekUpperCase,
} from '@kouskous/shared';
import { font } from '@/theme/typography';

/** A choice is a category, optionally narrowed to one of its subcategories. */
export interface CategoryChoice {
  categoryId: string;
  subcategoryId: string | null;
}

interface CategoryPickerProps {
  label: string;
  /** Shown in the closed field when nothing is chosen. */
  placeholder: string;
  value: CategoryChoice | null;
  onChange: (choice: CategoryChoice | null) => void;
  accent?: string;
  /** Allows clearing back to nothing. */
  optional?: boolean;
}

function labelFor(choice: CategoryChoice | null): string | null {
  if (!choice) return null;

  const category = findCategory(choice.categoryId);
  if (!category) return null;

  const subcategory = choice.subcategoryId ? findSubcategory(choice.subcategoryId) : undefined;
  return subcategory ? `${category.name} · ${subcategory.name}` : category.name;
}

/**
 * Category chooser.
 *
 * A closed field that opens a searchable list, rather than a wall of
 * chips: with subcategories there are close to a hundred options, and a
 * grid of that many is a scroll, not a choice. Searching goes over both
 * levels, so typing «μακιγιάζ» finds it without knowing it lives under
 * Beauty.
 */
export function CategoryPicker({
  label,
  placeholder,
  value,
  onChange,
  accent = colors.pink,
  optional = true,
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const term = normalizeForSearch(query);

  const matches = useMemo(() => {
    if (term.length < 2) return null;

    return categories
      .map((category) => {
        const categoryHit = normalizeForSearch(category.name).includes(term);
        const subs = subcategoriesFor(category.id).filter((subcategory) =>
          normalizeForSearch(subcategory.name).includes(term),
        );

        // A category matching by name offers all of its subcategories.
        if (categoryHit) return { category, subs: subcategoriesFor(category.id) };
        return subs.length > 0 ? { category, subs } : null;
      })
      .filter((entry): entry is { category: (typeof categories)[number]; subs: ReturnType<typeof subcategoriesFor> } => entry !== null);
  }, [term]);

  const close = () => {
    setOpen(false);
    setQuery('');
    setExpanded(null);
  };

  const choose = (categoryId: string, subcategoryId: string | null) => {
    onChange({ categoryId, subcategoryId });
    close();
  };

  const selectedLabel = labelFor(value);

  return (
    <View>
      <Text style={[styles.label, { color: accent }]}>{toGreekUpperCase(label)}</Text>

      <Pressable
        onPress={() => setOpen(true)}
        style={styles.field}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selectedLabel ?? placeholder}`}
      >
        <Text style={[styles.fieldValue, !selectedLabel && styles.fieldPlaceholder]} numberOfLines={1}>
          {selectedLabel ?? placeholder}
        </Text>
        {selectedLabel && optional ? (
          <Pressable
            onPress={() => onChange(null)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Καθαρισμός"
          >
            <X size={15} color={colors.textMuted} />
          </Pressable>
        ) : null}
        <ChevronDown size={16} color={accent} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <Pressable style={styles.scrim} onPress={close} accessibilityLabel="Κλείσιμο" />

        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.searchRow}>
            <Search size={16} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Αναζήτηση κατηγορίας"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              autoFocus
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityRole="button">
                <X size={15} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {matches !== null
              ? matches.map(({ category, subs }) => (
                  <View key={category.id}>
                    <Pressable
                      onPress={() => choose(category.id, null)}
                      style={styles.categoryRow}
                      accessibilityRole="button"
                    >
                      <Text style={styles.emoji}>{category.emoji}</Text>
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </Pressable>
                    {subs.map((subcategory) => (
                      <Pressable
                        key={subcategory.id}
                        onPress={() => choose(category.id, subcategory.id)}
                        style={styles.subRow}
                        accessibilityRole="button"
                      >
                        <Text style={styles.subName}>{subcategory.name}</Text>
                        {value?.subcategoryId === subcategory.id ? (
                          <Check size={15} color={accent} />
                        ) : null}
                      </Pressable>
                    ))}
                  </View>
                ))
              : categoryGroupOrder.map((group) => (
                  <View key={group}>
                    <Text style={styles.groupLabel}>
                      {toGreekUpperCase(categoryGroupLabels[group])}
                    </Text>

                    {categoriesByGroup(group).map((category) => {
                      const isExpanded = expanded === category.id;
                      const subs = subcategoriesFor(category.id);

                      return (
                        <View key={category.id}>
                          <Pressable
                            onPress={() => setExpanded(isExpanded ? null : category.id)}
                            style={styles.categoryRow}
                            accessibilityRole="button"
                            accessibilityState={{ expanded: isExpanded }}
                          >
                            <Text style={styles.emoji}>{category.emoji}</Text>
                            <Text style={styles.categoryName}>{category.name}</Text>
                            <Text style={styles.subCount}>{subs.length}</Text>
                            <ChevronDown
                              size={15}
                              color={colors.textMuted}
                              style={isExpanded ? styles.chevronOpen : undefined}
                            />
                          </Pressable>

                          {isExpanded ? (
                            <>
                              <Pressable
                                onPress={() => choose(category.id, null)}
                                style={styles.subRow}
                                accessibilityRole="button"
                              >
                                <Text style={[styles.subName, styles.subNameAll]}>
                                  Όλα σε {category.name}
                                </Text>
                                {value?.categoryId === category.id && !value.subcategoryId ? (
                                  <Check size={15} color={accent} />
                                ) : null}
                              </Pressable>

                              {subs.map((subcategory) => (
                                <Pressable
                                  key={subcategory.id}
                                  onPress={() => choose(category.id, subcategory.id)}
                                  style={styles.subRow}
                                  accessibilityRole="button"
                                >
                                  <Text style={styles.subName}>{subcategory.name}</Text>
                                  {value?.subcategoryId === subcategory.id ? (
                                    <Check size={15} color={accent} />
                                  ) : null}
                                </Pressable>
                              ))}
                            </>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                ))}

            {matches?.length === 0 ? (
              <Text style={styles.empty}>Δεν βρέθηκε κατηγορία για «{query.trim()}».</Text>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
  },
  fieldValue: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  fieldPlaceholder: {
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.scrim,
  },
  sheet: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    maxHeight: '82%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  grabber: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.borderChip,
    marginBottom: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cream,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md + 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.text,
  },
  list: {
    marginTop: spacing.md,
  },
  groupLabel: {
    fontSize: 10.5,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emoji: {
    fontSize: 17,
  },
  categoryName: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  subCount: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textFaint,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md - 2,
    paddingLeft: spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  subName: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: font.medium,
    color: colors.textBody,
  },
  subNameAll: {
    fontFamily: font.bold,
    color: colors.pinkDark,
  },
  empty: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
