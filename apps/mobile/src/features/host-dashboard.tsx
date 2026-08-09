import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Plus,
  QrCode,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react-native';
import { colors, gradients, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import {
  hostEvents,
  hostNextEvent,
  hostPayments,
  hostRatingSummary,
  hostReviews,
  hostStats,
} from '@/data/dashboard-mock';
import { CheckInSheet } from '@/components/check-in-sheet';
import { DiagonalGradient } from '@/components/gradient';
import {
  DashboardEyebrow,
  StatCard,
  dashboardStyles as shared,
} from '@/components/dashboard/dashboard-chrome';

const ACCENT = colors.hostPurple;

interface TabProps {
  /** Drives whether paid events can be created (spec §5). */
  paymentVerified: boolean;
}

interface PaymentsTabProps extends TabProps {
  onConnect: () => void;
}

export function HostOverviewTab({ paymentVerified }: TabProps) {
  const progress = hostNextEvent.booked / hostNextEvent.capacity;

  return (
    <ScrollView contentContainerStyle={shared.content} showsVerticalScrollIndicator={false}>
      {!paymentVerified ? (
        <View style={styles.warning}>
          <AlertCircle size={17} color={colors.warningIcon} />
          <Text style={styles.warningText}>
            Δεν έχεις συνδέσει λογαριασμό πληρωμών ακόμα — δεν μπορείς να δημιουργήσεις paid events.{' '}
            <Text style={styles.warningStrong}>Σύνδεσε τώρα στο tab Πληρωμές.</Text>
          </Text>
        </View>
      ) : null}

      <View style={shared.statRow}>
        <StatCard label="Έσοδα (Ιούλιος)" value={hostStats.revenue} icon={TrendingUp} tint={ACCENT} />
        <StatCard label="Ενεργά Events" value={hostStats.activeEvents} icon={Calendar} tint={colors.pink} />
      </View>
      <View style={[shared.statRow, styles.statRowLast]}>
        <StatCard label="Συν. Κρατήσεις" value={hostStats.bookings} icon={Users} tint={colors.success} />
        <StatCard label="Μ.Ο. Rating" value={hostStats.rating} icon={Star} tint={colors.gold} />
      </View>

      <DashboardEyebrow accent={ACCENT}>Επόμενο Event</DashboardEyebrow>
      <View style={styles.nextEvent}>
        <DiagonalGradient colors={gradients.hostEventCover} style={styles.nextEventCover}>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeLabel}>ΕΝΕΡΓΟ</Text>
          </View>
        </DiagonalGradient>
        <View style={styles.nextEventBody}>
          <Text style={styles.nextEventTitle}>{hostNextEvent.title}</Text>
          <View style={styles.nextEventMeta}>
            <Text style={styles.meta}>{hostNextEvent.date}</Text>
            <Text style={styles.metaStrong}>
              {hostNextEvent.booked}/{hostNextEvent.capacity} θέσεις
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export function HostEventsTab() {
  const router = useRouter();
  const [scope, setScope] = useState<'upcoming' | 'past'>('upcoming');
  // Which event's door list is open, and whether the QR button opened it.
  const [checkIn, setCheckIn] = useState<{ title: string; scanning: boolean } | null>(null);

  return (
    <ScrollView contentContainerStyle={shared.content} showsVerticalScrollIndicator={false}>
      <Pressable
        onPress={() => router.push('/create-event')}
        style={[shared.primaryButton, { backgroundColor: ACCENT }]}
        accessibilityRole="button"
      >
        <Plus size={16} color={colors.white} strokeWidth={2.6} />
        <Text style={shared.primaryButtonLabel}>Νέο Event</Text>
      </Pressable>

      <View style={styles.segmented}>
        {(['upcoming', 'past'] as const).map((key) => {
          const active = scope === key;
          return (
            <Pressable
              key={key}
              onPress={() => setScope(key)}
              style={[styles.segment, active && { backgroundColor: ACCENT, borderColor: ACCENT }]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                {key === 'upcoming' ? 'Επερχόμενα' : 'Ολοκληρωμένα'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {hostEvents[scope].map((event) => (
        <View key={event.id} style={shared.card}>
          <Text style={styles.cardTitle}>{event.title}</Text>
          <View style={styles.nextEventMeta}>
            <Text style={styles.meta}>{event.date}</Text>
            <Text style={styles.meta}>{event.spots} θέσεις</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.revenue}>{event.revenue}</Text>
            <View style={styles.iconButtons}>
              <Pressable
                onPress={() => setCheckIn({ title: event.title, scanning: true })}
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel="QR check-in"
              >
                <QrCode size={14} color={ACCENT} />
              </Pressable>
              <Pressable
                onPress={() => setCheckIn({ title: event.title, scanning: false })}
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel="Λίστα συμμετεχουσών"
              >
                <Users size={14} color={ACCENT} />
              </Pressable>
            </View>
          </View>
        </View>
      ))}

      <CheckInSheet
        visible={checkIn !== null}
        onClose={() => setCheckIn(null)}
        eventTitle={checkIn?.title ?? ''}
        scanning={checkIn?.scanning}
      />
    </ScrollView>
  );
}

export function HostPaymentsTab({ paymentVerified, onConnect }: PaymentsTabProps) {
  return (
    <ScrollView contentContainerStyle={shared.content} showsVerticalScrollIndicator={false}>
      {paymentVerified ? (
        <View style={styles.connectedCard}>
          <View style={styles.connectedHeader}>
            <CheckCircle2 size={18} color={colors.success} />
            <Text style={styles.connectedTitle}>Λογαριασμός συνδεδεμένος</Text>
          </View>
          <Text style={styles.meta}>Πάροχος: Viva Wallet</Text>
          <Text style={[styles.meta, styles.ibanSpacing]}>IBAN: GR•• •••• •••• •••• 4471</Text>
          <Text style={styles.note}>
            Οι πληρωμές των εισιτηρίων κατευθύνονται απευθείας στον λογαριασμό σου. Το KousKous δεν
            κρατά προμήθεια αυτή τη στιγμή.
          </Text>
        </View>
      ) : (
        <DiagonalGradient colors={gradients.host} style={styles.connectCard}>
          <Wallet size={22} color={colors.white} />
          <Text style={styles.connectTitle}>Σύνδεσε λογαριασμό πληρωμών</Text>
          <Text style={styles.connectBody}>
            Χρειάζεται για να δέχεσαι πληρωμές εισιτηρίων απευθείας. Παίρνει ~5 λεπτά μέσω Viva Wallet.
          </Text>
          <Pressable style={styles.connectButton} onPress={onConnect} accessibilityRole="button">
            <Text style={[styles.connectButtonLabel, { color: colors.hostPurpleDark }]}>
              Ξεκίνα σύνδεση →
            </Text>
          </Pressable>
        </DiagonalGradient>
      )}

      <DashboardEyebrow accent={ACCENT}>Πρόσφατες Πληρωμές</DashboardEyebrow>
      {hostPayments.map((payment) => (
        <View key={payment.id} style={styles.paymentRow}>
          <DiagonalGradient colors={gradients.avatar} style={styles.paymentAvatar} />
          <View style={styles.paymentText}>
            <Text style={styles.paymentName}>{payment.name}</Text>
            <Text style={styles.paymentEvent}>{payment.event}</Text>
          </View>
          <Text style={styles.revenue}>{payment.amount}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

export function HostReviewsTab() {
  return (
    <ScrollView contentContainerStyle={shared.content} showsVerticalScrollIndicator={false}>
      <View style={[shared.card, styles.ratingCard]}>
        <Text style={styles.ratingValue}>{hostRatingSummary.average}</Text>
        <Text style={styles.ratingStars}>★★★★★</Text>
        <Text style={styles.meta}>από {hostRatingSummary.count} αξιολογήσεις</Text>
      </View>

      {hostReviews.map((review) => (
        <View key={review.id} style={shared.card}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewName}>{review.name}</Text>
            <Text style={styles.reviewStars}>{'★'.repeat(review.stars)}</Text>
          </View>
          <Text style={styles.reviewText}>{review.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  warning: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.lg,
  },
  warningText: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.warningText,
    lineHeight: 17,
  },
  warningStrong: {
    fontFamily: font.bold,
  },
  statRowLast: {
    marginBottom: spacing.xl,
  },
  nextEvent: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    boxShadow: shadows.card,
  },
  nextEventCover: {
    height: 90,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  activeBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  activeBadgeLabel: {
    color: colors.white,
    fontSize: 10,
    fontFamily: font.extrabold,
  },
  nextEventBody: {
    padding: spacing.lg,
  },
  nextEventTitle: {
    fontSize: 14.5,
    fontFamily: font.extrabold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  nextEventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  meta: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  metaStrong: {
    fontSize: 11.5,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  track: {
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: colors.pink,
  },
  segmented: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
  },
  segmentLabel: {
    fontSize: 12,
    fontFamily: font.extrabold,
    color: colors.textMuted,
  },
  segmentLabelActive: {
    color: colors.white,
  },
  cardTitle: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.text,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenue: {
    fontSize: 13,
    fontFamily: font.extrabold,
    color: colors.success,
  },
  iconButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: radii.sm,
    backgroundColor: colors.hostPurpleTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectedCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.lg + 4,
    marginBottom: spacing.lg + 4,
    boxShadow: shadows.card,
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  connectedTitle: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  ibanSpacing: {
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  note: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textSecondary,
    lineHeight: 17,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  connectCard: {
    borderRadius: radii.xxl,
    padding: spacing.lg + 4,
    marginBottom: spacing.lg + 4,
  },
  connectTitle: {
    fontSize: 15,
    fontFamily: font.extrabold,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: 6,
  },
  connectBody: {
    fontSize: 12,
    fontFamily: font.regular,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  connectButton: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingVertical: 11,
    alignItems: 'center',
  },
  connectButtonLabel: {
    fontSize: 13,
    fontFamily: font.extrabold,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.sm,
    boxShadow: shadows.card,
  },
  paymentAvatar: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
  },
  paymentText: {
    flex: 1,
  },
  paymentName: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  paymentEvent: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  ratingCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg + 4,
  },
  ratingValue: {
    fontSize: 30,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  ratingStars: {
    fontSize: 15,
    color: colors.gold,
    marginBottom: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  reviewName: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  reviewStars: {
    fontSize: 11,
    color: colors.gold,
  },
  reviewText: {
    fontSize: 12,
    fontFamily: font.regular,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
