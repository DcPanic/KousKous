import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  MapPin,
  Megaphone,
  MessageCircle,
  Star,
  Users,
} from 'lucide-react-native';
import {
  can,
  colors,
  findLocation,
  gradients,
  paidMemberCta,
  radii,
  shadows,
  spacing,
  toGreekUpperCase,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import { findEventDetail, type EventDetail } from '@/data/event-detail';
import { useAppState } from '@/state/app-state';
import { useSession } from '@/state/session';
import { Avatar } from '@/components/avatar';
import { DiagonalGradient } from '@/components/gradient';
import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useSession();
  const { hasJoined, toggleJoined } = useAppState();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const event = typeof id === 'string' ? findEventDetail(id) : undefined;

  if (!event) {
    return (
      <PlaceholderScreen
        title="Το event δεν βρέθηκε"
        subtitle="Άγνωστο event"
        body="Ίσως ακυρώθηκε ή ο σύνδεσμος είναι λάθος."
      />
    );
  }

  const canJoin = can(user, 'events_join');
  const isFree = event.price === 0;
  const spotsLeft = event.spotsTotal - event.spotsTaken;
  const cityName = findLocation(event.location)?.name ?? '';

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 108 }]}
        showsVerticalScrollIndicator={false}
      >
        <DiagonalGradient colors={gradients.eventCover} style={styles.cover}>
          <SafeAreaView edges={['top']}>
            <Pressable
              onPress={() => router.back()}
              style={styles.back}
              accessibilityRole="button"
              accessibilityLabel="Πίσω"
            >
              <ArrowLeft size={18} color={colors.text} />
            </Pressable>
          </SafeAreaView>
        </DiagonalGradient>

        <View style={styles.body}>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.hostRow}>
            <Avatar size={38} />
            <View style={styles.hostText}>
              <View style={styles.hostNameRow}>
                <Text style={styles.hostName}>{event.hostName}</Text>
                {event.hostVerified ? (
                  <BadgeCheck size={13} color={colors.pink} fill={colors.pinkTint} />
                ) : null}
              </View>
              <Text style={styles.hostLabel}>Διοργανώτρια</Text>
            </View>
            {event.reviewCount > 0 ? (
              <View style={styles.ratingChip}>
                <Star size={11} color={colors.gold} fill={colors.gold} />
                <Text style={styles.ratingValue}>{event.rating}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.factCard}>
            <Fact icon={CalendarDays} label={event.date} />
            <Fact icon={Clock} label={event.time} />
            <Fact icon={MapPin} label={`${event.venue} · ${cityName}`} />
            <Fact
              icon={Users}
              label={
                spotsLeft > 0
                  ? `${event.spotsTaken}/${event.spotsTotal} θέσεις · ${spotsLeft} διαθέσιμες`
                  : 'Συμπληρώθηκε'
              }
            />
          </View>

          <Section title="Περιγραφή">
            <Text style={styles.paragraph}>{event.description}</Text>
          </Section>

          <Section title="Τοποθεσία">
            <View style={styles.map}>
              <MapPin size={20} color={colors.pink} />
              <Text style={styles.mapLabel}>{event.address}</Text>
              <Text style={styles.mapHint}>Ο χάρτης ενεργοποιείται μαζί με τα πραγματικά events.</Text>
            </View>
          </Section>

          <Section title="Φωτογραφίες">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
              {event.gallery.map((tint, index) => (
                <View key={`${tint}-${index}`} style={[styles.galleryItem, { backgroundColor: tint }]} />
              ))}
            </ScrollView>
          </Section>

          {event.announcements.length > 0 ? (
            <Section title="Ανακοινώσεις">
              {event.announcements.map((announcement) => (
                <View key={announcement.id} style={styles.announcement}>
                  <Megaphone size={15} color={colors.hostPurple} />
                  <View style={styles.announcementText}>
                    <Text style={styles.announcementBody}>{announcement.text}</Text>
                    <Text style={styles.muted}>{announcement.postedAt}</Text>
                  </View>
                </View>
              ))}
            </Section>
          ) : null}

          <Section title="Συζήτηση συμμετεχουσών">
            <View style={styles.chatCard}>
              <MessageCircle size={18} color={canJoin ? colors.pink : colors.textMuted} />
              <Text style={styles.chatLabel}>
                {canJoin
                  ? `${event.attendees} συμμετέχουσες συζητούν εδώ`
                  : 'Η συζήτηση είναι διαθέσιμη στα μέλη'}
              </Text>
              {!canJoin ? <Lock size={14} color={colors.textMuted} /> : null}
            </View>
          </Section>

          <Section title="Συχνές ερωτήσεις">
            {event.faq.map((item) => (
              <FaqRow key={item.id} question={item.question} answer={item.answer} />
            ))}
          </Section>

          {event.reviews.length > 0 ? (
            <Section title={`Αξιολογήσεις (${event.reviewCount})`}>
              {event.reviews.map((review) => (
                <View key={review.id} style={styles.review}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{review.author}</Text>
                    <Text style={styles.stars}>{'★'.repeat(review.rating)}</Text>
                  </View>
                  <Text style={styles.reviewBody}>{review.comment}</Text>
                </View>
              ))}
            </Section>
          ) : null}
        </View>
      </ScrollView>

      <JoinBar
        canJoin={canJoin}
        isFree={isFree}
        price={event.price}
        soldOut={spotsLeft <= 0}
        joined={hasJoined(event.id)}
        onUpgrade={() => router.push('/membership')}
        onJoin={() => toggleJoined(event.id)}
      />
    </View>
  );
}

function Fact({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <View style={styles.fact}>
      <Icon size={15} color={colors.pink} />
      <Text style={styles.factLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{toGreekUpperCase(title)}</Text>
      {children}
    </View>
  );
}

function FaqRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Pressable
      style={styles.faq}
      onPress={() => setOpen((value) => !value)}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        {open ? (
          <ChevronUp size={16} color={colors.textMuted} />
        ) : (
          <ChevronDown size={16} color={colors.textMuted} />
        )}
      </View>
      {open ? <Text style={styles.faqAnswer}>{answer}</Text> : null}
    </Pressable>
  );
}

interface JoinBarProps {
  canJoin: boolean;
  joined: boolean;
  onUpgrade: () => void;
  onJoin: () => void;
  isFree: boolean;
  price: number;
  soldOut: boolean;
}

/**
 * Sticky action bar. Free members see the upgrade CTA instead of the join
 * button — joining an event is a paid-member feature (spec §3).
 */
function JoinBar({ canJoin, isFree, price, soldOut, joined, onUpgrade, onJoin }: JoinBarProps) {
  const insets = useSafeAreaInsets();
  const formattedPrice = `€${price.toFixed(2).replace('.', ',')}`;

  let label: string;
  if (!canJoin) label = paidMemberCta;
  else if (joined) label = 'Δήλωσες συμμετοχή ✓';
  else if (soldOut) label = 'Συμπληρώθηκε';
  else if (isFree) label = 'Δήλωσε συμμετοχή · Δωρεάν';
  else label = `Κλείσε θέση · ${formattedPrice}`;

  // A sold-out event is only closed to women who are not already in.
  const disabled = canJoin && soldOut && !joined;

  return (
    <View style={[styles.joinBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {canJoin ? (
        <View style={styles.priceColumn}>
          <Text style={styles.priceValue}>{isFree ? 'Δωρεάν' : formattedPrice}</Text>
          <Text style={styles.muted}>ανά άτομο</Text>
        </View>
      ) : null}
      <Pressable
        onPress={canJoin ? onJoin : onUpgrade}
        style={[
          styles.joinButton,
          disabled && styles.joinButtonDisabled,
          joined && styles.joinButtonJoined,
        ]}
        disabled={disabled}
        accessibilityRole="button"
      >
        {!canJoin ? <Lock size={14} color={colors.white} /> : null}
        <Text style={styles.joinLabel}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    paddingBottom: 108,
  },
  cover: {
    height: 220,
    paddingHorizontal: spacing.screen,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    boxShadow: shadows.card,
  },
  body: {
    paddingHorizontal: spacing.screen,
    marginTop: -spacing.xl,
  },
  title: {
    fontSize: 21,
    fontFamily: font.extrabold,
    color: colors.text,
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingTop: spacing.xl,
    marginHorizontal: -spacing.screen,
    paddingHorizontal: spacing.screen,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  hostText: {
    flex: 1,
  },
  hostNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  hostName: {
    fontSize: 13.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  hostLabel: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.goldSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  ratingValue: {
    fontSize: 12,
    fontFamily: font.extrabold,
    color: colors.gold,
  },
  factCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
    boxShadow: shadows.card,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  factLabel: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: font.medium,
    color: colors.textBody,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.pink,
    marginBottom: spacing.md,
  },
  paragraph: {
    fontSize: 13.5,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 21,
  },
  map: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 6,
    boxShadow: shadows.card,
  },
  mapLabel: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
    textAlign: 'center',
  },
  mapHint: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
  },
  gallery: {
    gap: spacing.md,
  },
  galleryItem: {
    width: 132,
    height: 96,
    borderRadius: radii.lg,
  },
  announcement: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.sm,
    boxShadow: shadows.card,
  },
  announcementText: {
    flex: 1,
  },
  announcementBody: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textBody,
    marginBottom: 3,
  },
  muted: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    boxShadow: shadows.card,
  },
  chatLabel: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: font.medium,
    color: colors.textBody,
  },
  faq: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    boxShadow: shadows.card,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  faqAnswer: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textSecondary,
    lineHeight: 19,
    marginTop: spacing.md,
  },
  review: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    boxShadow: shadows.card,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  reviewAuthor: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  stars: {
    fontSize: 11,
    color: colors.gold,
  },
  reviewBody: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  joinBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md + 2,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceColumn: {
    justifyContent: 'center',
  },
  priceValue: {
    fontSize: 17,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
    paddingVertical: spacing.lg,
  },
  joinButtonJoined: {
    backgroundColor: colors.success,
  },
  joinButtonDisabled: {
    backgroundColor: colors.textInactive,
  },
  joinLabel: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
});
