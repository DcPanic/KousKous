import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  Calendar,
  Eye,
  Gift,
  Megaphone,
  Plus,
  Radio,
  UserPlus,
  type LucideIcon,
} from 'lucide-react-native';
import { colors, gradients, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import {
  officialAnnouncements,
  officialAudienceLabel,
  officialEvents,
  officialGiveaways,
  officialStats,
} from '@/data/dashboard-mock';
import { DiagonalGradient } from '@/components/gradient';
import {
  DashboardEyebrow,
  StatCard,
  dashboardStyles as shared,
} from '@/components/dashboard/dashboard-chrome';

/** Eyebrows and primary buttons use the darker aubergine, not the gold. */
const ACCENT = colors.aubergine;

export function OfficialOverviewTab() {
  return (
    <ScrollView contentContainerStyle={shared.content} showsVerticalScrollIndicator={false}>
      <View style={shared.statRow}>
        <StatCard label="Νέα Μέλη (μήνα)" value={officialStats.newMembers} icon={UserPlus} tint={colors.success} />
        <StatCard label="Ενεργά Events" value={officialStats.activeEvents} icon={Calendar} tint={colors.pink} />
      </View>
      <View style={[shared.statRow, styles.statRowLast]}>
        <StatCard
          label="Reach Ανακοινώσεων"
          value={officialStats.announcementReach}
          icon={Eye}
          tint={colors.hostPurple}
        />
        <StatCard label="Ενεργά Giveaways" value={officialStats.activeGiveaways} icon={Gift} tint={colors.gold} />
      </View>

      <DashboardEyebrow accent={ACCENT}>Γρήγορες Ενέργειες</DashboardEyebrow>
      <View style={styles.quickGrid}>
        <QuickAction icon={Calendar} label="Νέο Official Event" tint={colors.pink} />
        <QuickAction icon={Gift} label="Νέο Giveaway" tint={colors.gold} />
        <QuickAction icon={Megaphone} label="Ανακοίνωση" tint={colors.hostPurple} />
        <QuickAction icon={Radio} label="Live Session" tint={colors.live} />
      </View>
    </ScrollView>
  );
}

function QuickAction({ icon: Icon, label, tint }: { icon: LucideIcon; label: string; tint: string }) {
  return (
    <Pressable style={styles.quickAction} accessibilityRole="button">
      <View style={[styles.quickIcon, { backgroundColor: `${tint}1A` }]}>
        <Icon size={16} color={tint} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

export function OfficialEventsTab() {
  return (
    <ScrollView contentContainerStyle={shared.content} showsVerticalScrollIndicator={false}>
      <Pressable style={[shared.primaryButton, { backgroundColor: ACCENT }]} accessibilityRole="button">
        <Plus size={16} color={colors.white} strokeWidth={2.6} />
        <Text style={shared.primaryButtonLabel}>Νέο Official Event</Text>
      </Pressable>

      {officialEvents.map((event) => (
        <View key={event.id} style={styles.eventCard}>
          <DiagonalGradient colors={gradients.officialCover} style={styles.eventCover} />
          <View style={styles.eventBody}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.eventMeta}>
              <Text style={styles.meta}>{event.date}</Text>
              <Text style={styles.metaStrong}>{event.spots}</Text>
            </View>
            {event.sponsor ? <Text style={styles.sponsor}>{event.sponsor}</Text> : null}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export function OfficialRewardsTab() {
  return (
    <ScrollView contentContainerStyle={shared.content} showsVerticalScrollIndicator={false}>
      <Pressable style={[shared.primaryButton, { backgroundColor: colors.gold }]} accessibilityRole="button">
        <Plus size={16} color={colors.white} strokeWidth={2.6} />
        <Text style={shared.primaryButtonLabel}>Νέο Giveaway / Προσφορά</Text>
      </Pressable>

      {officialGiveaways.map((giveaway) => (
        <View key={giveaway.id} style={shared.card}>
          <View style={styles.giveawayHeader}>
            <View style={styles.giveawayIcon}>
              <Gift size={18} color={colors.gold} />
            </View>
            <Text style={styles.giveawayTitle}>{giveaway.title}</Text>
          </View>
          <View style={styles.eventMeta}>
            <Text style={styles.metaSmall}>{giveaway.entries}</Text>
            <Text style={styles.endsLabel}>{giveaway.ends}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

export function OfficialAnnouncementsTab() {
  const [draft, setDraft] = useState('');

  return (
    <ScrollView contentContainerStyle={shared.content} showsVerticalScrollIndicator={false}>
      <View style={shared.card}>
        <Text style={styles.composerLabel}>ΝΕΑ ΑΝΑΚΟΙΝΩΣΗ</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          multiline
          placeholder="Γράψε το μήνυμα που θα σταλεί push notification σε όλες τις χρήστριες..."
          placeholderTextColor={colors.textMuted}
          style={styles.composerInput}
        />
        <Pressable
          style={[styles.sendButton, draft.trim().length === 0 && styles.sendButtonDisabled]}
          disabled={draft.trim().length === 0}
          accessibilityRole="button"
        >
          <Text style={styles.sendLabel}>Αποστολή σε {officialAudienceLabel}</Text>
        </Pressable>
      </View>

      <DashboardEyebrow accent={ACCENT}>Ιστορικό</DashboardEyebrow>
      {officialAnnouncements.map((announcement) => (
        <View key={announcement.id} style={styles.announcementCard}>
          <Text style={styles.announcementText}>{announcement.text}</Text>
          <View style={styles.reachRow}>
            <Eye size={11} color={colors.textMuted} />
            <Text style={styles.metaSmall}>{announcement.reach}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statRowLast: {
    marginBottom: spacing.xl,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickAction: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.screen,
    boxShadow: shadows.card,
  },
  quickIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm + 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  quickLabel: {
    fontSize: 12.5,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: spacing.md + 2,
    boxShadow: shadows.card,
  },
  eventCover: {
    height: 78,
  },
  eventBody: {
    padding: 13,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: font.extrabold,
    color: colors.text,
    marginBottom: 5,
  },
  eventMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
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
  metaSmall: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  sponsor: {
    fontSize: 10.5,
    fontFamily: font.bold,
    color: colors.gold,
  },
  giveawayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  giveawayIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giveawayTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  endsLabel: {
    fontSize: 11,
    fontFamily: font.bold,
    color: colors.pink,
  },
  composerLabel: {
    fontSize: 11,
    fontFamily: font.extrabold,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  composerInput: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 12,
    fontFamily: font.regular,
    color: colors.text,
    minHeight: 74,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  sendButton: {
    backgroundColor: colors.hostPurple,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendLabel: {
    fontSize: 12.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  announcementCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.sm,
    boxShadow: shadows.card,
  },
  announcementText: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.text,
    marginBottom: 5,
  },
  reachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
