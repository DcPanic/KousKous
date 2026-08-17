import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BadgeCheck, CalendarDays, MapPin, Search, X } from 'lucide-react-native';
import {
  categories,
  colors,
  findEventCategory,
  findPlace,
  normalizeForSearch,
  radii,
  shadows,
  spacing,
  toGreekUpperCase,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import { people } from '@/data/people';
import { useEvents } from '@/state/events';
import { Avatar } from '@/components/avatar';

const MIN_QUERY = 2;
const MAX_PER_GROUP = 5;

/** Suggestions offered before anything is typed. */
const POPULAR = ['Αθήνα', 'Beauty', 'Θάλασσα', 'Λεμεσός', 'Yoga'];

const MONTHS = [
  'Ιαν',
  'Φεβ',
  'Μαρ',
  'Απρ',
  'Μαΐ',
  'Ιουν',
  'Ιουλ',
  'Αυγ',
  'Σεπ',
  'Οκτ',
  'Νοε',
  'Δεκ',
];

function shortDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/**
 * One field across women, communities and events.
 *
 * Matching goes through the shared folding, so «λεμεσος» finds Λεμεσός and
 * «ΑΘΗΝΑ» finds Αθήνα. Nothing here is a separate search per tab — a woman
 * types a word, she gets everything that word touches.
 */
export default function SearchScreen() {
  const router = useRouter();
  const { events } = useEvents();
  const [query, setQuery] = useState('');

  const term = normalizeForSearch(query);
  const active = term.length >= MIN_QUERY;

  const matchedPeople = useMemo(() => {
    if (!active) return [];
    return people
      .filter((person) => {
        const place = findPlace(person.location)?.name ?? '';
        return (
          normalizeForSearch(person.name).includes(term) ||
          normalizeForSearch(person.bio).includes(term) ||
          normalizeForSearch(place).includes(term)
        );
      })
      .slice(0, MAX_PER_GROUP);
  }, [term, active]);

  const matchedCategories = useMemo(() => {
    if (!active) return [];
    return categories
      .filter((category) => normalizeForSearch(category.name).includes(term))
      .slice(0, MAX_PER_GROUP);
  }, [term, active]);

  const matchedEvents = useMemo(() => {
    if (!active) return [];
    return events
      .filter((event) => {
        const place = findPlace(event.location)?.name ?? '';
        const category = findEventCategory(event.categoryId)?.name ?? '';
        return (
          normalizeForSearch(event.title).includes(term) ||
          normalizeForSearch(place).includes(term) ||
          normalizeForSearch(category).includes(term)
        );
      })
      .slice(0, MAX_PER_GROUP);
  }, [events, term, active]);

  const total = matchedPeople.length + matchedCategories.length + matchedEvents.length;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Πίσω"
        >
          <ArrowLeft size={17} color={colors.text} />
        </Pressable>
        <View style={styles.field}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Γυναίκες, κοινότητες, events"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoFocus
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Καθαρισμός"
            >
              <X size={16} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {!active ? (
          <>
            <Text style={styles.sectionTitle}>{toGreekUpperCase('Δημοφιλή')}</Text>
            <View style={styles.chipWrap}>
              {POPULAR.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => setQuery(suggestion)}
                  style={styles.chip}
                  accessibilityRole="button"
                >
                  <Text style={styles.chipLabel}>{suggestion}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.hint}>
              Γράψε τουλάχιστον {MIN_QUERY} γράμματα. Οι τόνοι δεν παίζουν ρόλο.
            </Text>
          </>
        ) : total === 0 ? (
          <Text style={styles.empty}>Δεν βρέθηκε τίποτα για «{query.trim()}».</Text>
        ) : (
          <>
            {matchedPeople.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>{toGreekUpperCase('Γυναίκες')}</Text>
                {matchedPeople.map((person) => (
                  <Pressable
                    key={person.id}
                    onPress={() => router.push({ pathname: '/u/[id]', params: { id: person.id } })}
                    style={styles.row}
                    accessibilityRole="button"
                    accessibilityLabel={`Προφίλ: ${person.name}`}
                  >
                    <Avatar size={40} />
                    <View style={styles.rowText}>
                      <View style={styles.rowTitleLine}>
                        <Text style={styles.rowTitle}>{person.name}</Text>
                        {person.verified ? (
                          <BadgeCheck size={12} color={colors.pink} fill={colors.pinkTint} />
                        ) : null}
                      </View>
                      <Text style={styles.rowMeta} numberOfLines={1}>
                        {findPlace(person.location)?.name}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </>
            ) : null}

            {matchedCategories.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>{toGreekUpperCase('Κοινότητες')}</Text>
                {matchedCategories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() =>
                      router.push({ pathname: '/community/[id]', params: { id: category.id } })
                    }
                    style={styles.row}
                    accessibilityRole="button"
                  >
                    <View style={styles.emojiTile}>
                      <Text style={styles.emoji}>{category.emoji}</Text>
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle}>{category.name}</Text>
                      <Text style={styles.rowMeta}>Κοινότητα</Text>
                    </View>
                  </Pressable>
                ))}
              </>
            ) : null}

            {matchedEvents.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>{toGreekUpperCase('Events')}</Text>
                {matchedEvents.map((event) => (
                  <Pressable
                    key={event.id}
                    onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
                    style={styles.row}
                    accessibilityRole="button"
                  >
                    <View style={styles.emojiTile}>
                      <Text style={styles.emoji}>
                        {findEventCategory(event.categoryId)?.emoji ?? '📅'}
                      </Text>
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {event.title}
                      </Text>
                      <View style={styles.rowMetaLine}>
                        <MapPin size={11} color={colors.textMuted} />
                        <Text style={styles.rowMeta}>{findPlace(event.location)?.name}</Text>
                        <CalendarDays size={11} color={colors.textMuted} />
                        <Text style={styles.rowMeta}>{shortDate(event.isoDate)}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
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
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md + 2,
    boxShadow: shadows.card,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.text,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.pink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
  },
  chipLabel: {
    fontSize: 12,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  hint: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: spacing.lg,
  },
  empty: {
    fontSize: 13,
    fontFamily: font.medium,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: 6,
    boxShadow: shadows.card,
  },
  emojiTile: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.pinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 18,
  },
  rowText: {
    flex: 1,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowTitle: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
    flexShrink: 1,
  },
  rowMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  rowMeta: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginRight: 4,
  },
});
