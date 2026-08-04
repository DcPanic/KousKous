import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, Users } from 'lucide-react-native';
import { accessFor, colors, gradients, layout, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { events } from '@/data/mock';
import { useAppState } from '@/state/app-state';
import { useSession } from '@/state/session';
import { DiagonalGradient } from '@/components/gradient';
import { LockedOverlay } from '@/components/locked-overlay';
import { SectionEyebrow } from '@/components/section-eyebrow';

export default function EventsScreen() {
  const { user } = useSession();
  const { selectedLocations } = useAppState();
  const router = useRouter();
  const locked = accessFor(user, 'events_view') === 'preview';

  const visibleEvents = useMemo(() => {
    if (selectedLocations.length === 0) return events;
    return events.filter((event) => selectedLocations.includes(event.location));
  }, [selectedLocations]);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!locked}
      >
        <SectionEyebrow>Επερχόμενα Events</SectionEyebrow>
        <View style={styles.list}>
          {visibleEvents.map((event) => (
            <Pressable
              key={event.id}
              style={styles.card}
              // Free members only get the blurred preview, so the card
              // must not open the detail screen for them.
              disabled={locked}
              onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
              accessibilityRole="button"
              accessibilityLabel={event.title}
            >
              <DiagonalGradient colors={gradients.eventCover} style={styles.cover} />
              <View style={styles.body}>
                <Text style={styles.title}>{event.title}</Text>
                <View style={styles.metaRow}>
                  <Calendar size={12} color={colors.textMuted} />
                  <Text style={styles.meta}>{event.date}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Users size={12} color={colors.textMuted} />
                  <Text style={styles.meta}>{event.spots}</Text>
                </View>
              </View>
            </Pressable>
          ))}

          {visibleEvents.length === 0 ? (
            <Text style={styles.empty}>Δεν υπάρχουν events στις επιλεγμένες τοποθεσίες.</Text>
          ) : null}
        </View>
      </ScrollView>

      {locked ? (
        <LockedOverlay
          title="Τα events είναι για μέλη"
          subtitle="Κλείσε θέση σε official & host events."
        />
      ) : null}
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
  empty: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 40,
  },
});
