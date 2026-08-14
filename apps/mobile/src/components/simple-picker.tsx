import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Check, ChevronDown, Search, X } from 'lucide-react-native';
import { colors, normalizeForSearch, radii, spacing, toGreekUpperCase } from '@kouskous/shared';
import { font } from '@/theme/typography';

export interface PickerOption {
  id: string;
  name: string;
  emoji?: string;
}

interface SimplePickerProps {
  label: string;
  placeholder: string;
  options: PickerOption[];
  value: string | null;
  onChange: (id: string | null) => void;
  accent?: string;
}

/**
 * One-level dropdown, for lists that have no subcategories — event kinds,
 * mainly. Same shape as CategoryPicker so the two read alike on screen.
 */
export function SimplePicker({
  label,
  placeholder,
  options,
  value,
  onChange,
  accent = colors.pink,
}: SimplePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const term = normalizeForSearch(query);

  const visible = useMemo(() => {
    if (term.length < 2) return options;
    return options.filter((option) => normalizeForSearch(option.name).includes(term));
  }, [options, term]);

  const selected = options.find((option) => option.id === value);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <View>
      <Text style={[styles.label, { color: accent }]}>{toGreekUpperCase(label)}</Text>

      <Pressable
        onPress={() => setOpen(true)}
        style={styles.field}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.name ?? placeholder}`}
      >
        {selected?.emoji ? <Text style={styles.emoji}>{selected.emoji}</Text> : null}
        <Text style={[styles.fieldValue, !selected && styles.fieldPlaceholder]} numberOfLines={1}>
          {selected?.name ?? placeholder}
        </Text>
        {selected ? (
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
              placeholder="Αναζήτηση"
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              autoFocus
            />
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {visible.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => {
                  onChange(option.id);
                  close();
                }}
                style={styles.row}
                accessibilityRole="button"
              >
                {option.emoji ? <Text style={styles.emoji}>{option.emoji}</Text> : null}
                <Text style={styles.rowName}>{option.name}</Text>
                {option.id === value ? <Check size={15} color={accent} /> : null}
              </Pressable>
            ))}

            {visible.length === 0 ? (
              <Text style={styles.empty}>Δεν βρέθηκε τίποτα για «{query.trim()}».</Text>
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
  emoji: {
    fontSize: 16,
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
    maxHeight: '78%',
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowName: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.medium,
    color: colors.text,
  },
  empty: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
