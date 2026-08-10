import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, Crown, Lock, Users } from 'lucide-react-native';
import {
  accountTier,
  colors,
  findEventCategory,
  findPlace,
  gradients,
  layout,
  matchesDateRange,
  matchesPlaces,
  matchesPrice,
  radii,
  shadows,
  spacing,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import { events } from '@/data/mock';
import { formatEventDate } from '@/lib/date';
import { useAppState } from '@/state/app-state';
import { useSession } from '@/state/session';
import { DiagonalGradient } from '@/components/gradient';
import { FilterBar } from '@/components/filter-bar';
import { SectionEyebrow } from '@/components/section-eyebrow';

export default function EventsScreen() {
  const { user } = useSession();
  const { selectedPlaces, eventCategoryIds, dateRange, priceBand, availableOnly } = useAppState();
  const router = useRouter();
  // Events are open to everyone. Only the KousKous events themselves are
  // a members' benefit, and that is marked per card rather than by hiding
  // the whole screen.
  const isFree = accountTier(user) === 'free';

  const visibleEvents = useMemo(
    () =>
      events
        .filter((event) => matchesPlaces(event.location, selectedPlaces))
        .filter((event) => matchesDateRange(event.isoDate, dateRange))
        .filter(
          (event) =>
            eventCategoryIds.length === 0 || eventCategoryIds.includes(event.categoryId),
        )
        .filter((event) => matchesPrice(event.price, priceBand))
        .filter((event) => !availableOnly || event.spotsTaken < event.spotsTotal)
        .sort((a, b) => a.isoDate.localeCompare(b.isoDate)),
    [selectedPlaces, eventCategoryIds, dateRange, priceBand, availableOnly],
  );

  return (
    <View style={styles.screen}>
      <FilterBar surface="events" resultCount={visibleEvents.length} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <SectionEyebrow>Επερχόμενα Events</SectionEyebrow>
        <View style={styles.list}>
          {visibleEvents.map((event) => {
            const category = findEventCategory(event.categoryId);
            const place = findPlace(event.location);
            const spotsLeft = event.spotsTotal - event.spotsTaken;

            return (
              <Pressable
                key={event.id}
                style={styles.card}
                onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
                accessibilityRole="button"
                accessibilityLabel={event.title}
              >
                <DiagonalGradient colors={gradients.eventCover} style={styles.cover}>
                  {category ? (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                      <Text style={styles.categoryLabel}>{category.name}</Text>
                    </View>
                  ) : null}
                  {event.isOfficial ? (
                    <View style={styles.officialBadge}>
                      <Crown size={10} color={colors.white} fill={colors.white} />
                      <Text style={styles.categoryLabel}>Official</Text>
                    </View>
                  ) : null}
                  {event.isOfficial && isFree ? (
                    <View style={styles.membersBadge}>
                      <Lock size={9} color={colors.white} />
                      <Text style={styles.categoryLabel}>Για μέλη</Text>
                    </View>
                  ) : null}
                </DiagonalGradient>

                <View style={styles.body}>
                  <Text style={styles.title}>{event.title}</Text>
                  <View style={styles.metaRow}>
                    <Calendar size={12} color={colors.textMuted} />
                    <Text style={styles.meta}>
                      {formatEventDate(event.isoDate)} · {event.time}
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Users size={12} color={colors.textMuted} />
                    <Text style={styles.meta}>
                      {place?.name}
                      {spotsLeft > 0 ? ` · ${spotsLeft} θέσεις` : ' · Συμπληρώθηκε'}
                    </Text>
                  </View>
                  <Text style={styles.price}>
                    {event.price === 0 ? 'Δωρεάν' : `€${event.price.toFixed(2).replace('.', ',')}`}
                  </Text>
                </View>
              </Pressable>
            );
          })}

          {visibleEvents.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Κανένα event με αυτά τα φίλτρα</Text>
              <Text style={styles.emptyBody}>
                Δοκίμασε άλλη ημερομηνία ή ευρύτερη τοποθεσία.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    paddingBottom: layout.tabBarHeight,
  },
  list: {
    paddingHorizontal: spacing.screen,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.md + 2,
    boxShadow: shadows.card,
  },
  cover: {
    height: 84,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.imageBadge,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  membersBadge: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.imageBadge,
    borderRadius: radii.full,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gold,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  categoryEmoji: {
    fontSize: 11,
  },
  categoryLabel: {
    fontSize: 10,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  body: {
    padding: 13,
  },
  title: {
    fontSize: 14,
    fontFamily: font.extrabold,
    color: colors.text,
    marginBottom: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  meta: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  price: {
    fontSize: 13,
    fontFamily: font.extrabold,
    color: colors.pinkDark,
    marginTop: 6,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: {
    fontSize: 14.5,
    fontFamily: font.extrabold,
    color: colors.text,
    marginBottom: 6,
  },
  emptyBody: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
