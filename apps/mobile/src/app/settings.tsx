import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  Globe,
  HelpCircle,
  LogOut,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import {
  accountTier,
  colors,
  findPlace,
  PAID_MEMBER_PRICE_EUR,
  radii,
  shadows,
  spacing,
  toGreekUpperCase,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import { setPrivacy } from '@/lib/profiles-repo';
import { useModeration } from '@/state/moderation';
import { useSession } from '@/state/session';
import { ConfirmSheet } from '@/components/confirm-sheet';
import { LanguageSheet } from '@/components/language-sheet';

const TIER_LABELS: Record<ReturnType<typeof accountTier>, string> = {
  free: 'Δωρεάν λογαριασμός',
  paid: 'Μέλος',
  host: 'Premium Host',
  official: 'Official',
};

const MONTHLY_PRICE = `€${PAID_MEMBER_PRICE_EUR.toFixed(2).replace('.', ',')}/μήνα`;

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signedIn, signOut, refreshProfile } = useSession();
  const { blocked } = useModeration();
  const tier = accountTier(user);

  // Push and email are still local: nothing sends either yet, so storing
  // the preference would be storing a promise the app cannot keep.
  const [pushEvents, setPushEvents] = useState(true);
  const [pushForums, setPushForums] = useState(true);
  const [pushMessages, setPushMessages] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  // These two are real: they change what other women can see, so they are
  // read from the account and written back to it.
  const [showLocation, setShowLocation] = useState(user.show_location ?? true);
  const [discoverable, setDiscoverable] = useState(user.discoverable ?? true);

  useEffect(() => {
    setShowLocation(user.show_location ?? true);
    setDiscoverable(user.discoverable ?? true);
  }, [user.show_location, user.discoverable]);

  const savePrivacy = (next: { showLocation?: boolean; discoverable?: boolean }) => {
    if (next.showLocation !== undefined) setShowLocation(next.showLocation);
    if (next.discoverable !== undefined) setDiscoverable(next.discoverable);

    if (!signedIn) return;

    void setPrivacy(user.id, next)
      .then(() => refreshProfile())
      .catch(() => {
        // Put the switch back rather than leaving it claiming something
        // the account does not actually say.
        if (next.showLocation !== undefined) setShowLocation(!next.showLocation);
        if (next.discoverable !== undefined) setDiscoverable(!next.discoverable);
      });
  };
  const [languageOpen, setLanguageOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
        <Text style={styles.headerTitle}>Ρυθμίσεις</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.identityCard}>
          <Text style={styles.identityName}>{user.name}</Text>
          <Text style={styles.identityMeta}>
            {TIER_LABELS[tier]}
            {user.location ? ` · ${findPlace(user.location)?.name}` : ''}
          </Text>
        </View>

        <Section label="Λογαριασμός" />
        <Row
          icon={UserRound}
          label="Επεξεργασία προφίλ"
          onPress={() => router.push('/edit-profile')}
        />
        <Row
          icon={Mail}
          label="Email"
          value={user.email ?? '—'}
          onPress={() => router.push('/edit-profile')}
        />
        <Row
          icon={MapPin}
          label="Περιοχή"
          value={findPlace(user.location ?? '')?.name ?? '—'}
          onPress={() => router.push('/edit-profile')}
        />

        <Section label="Συνδρομή" />
        {tier === 'free' ? (
          <Pressable
            onPress={() => router.push('/membership')}
            style={styles.upgradeCard}
            accessibilityRole="button"
          >
            <Sparkles size={19} color={colors.white} />
            <View style={styles.upgradeText}>
              <Text style={styles.upgradeTitle}>Γίνε μέλος</Text>
              <Text style={styles.upgradeBody}>
                Forums, μηνύματα, events και Rewards Club · {MONTHLY_PRICE}
              </Text>
            </View>
            <ChevronRight size={16} color={colors.white} />
          </Pressable>
        ) : (
          <>
            <Row icon={CreditCard} label="Τρόπος πληρωμής" value="•••• 4242" />
            <Row
              icon={FileText}
              label="Ανανέωση"
              value={user.paid_until ? formatDate(user.paid_until) : '—'}
            />
          </>
        )}

        <Section label="Ειδοποιήσεις" />
        <ToggleRow icon={Bell} label="Events που με αφορούν" value={pushEvents} onChange={setPushEvents} />
        <ToggleRow icon={Bell} label="Απαντήσεις στις συζητήσεις μου" value={pushForums} onChange={setPushForums} />
        <ToggleRow icon={Bell} label="Νέα μηνύματα" value={pushMessages} onChange={setPushMessages} />
        <ToggleRow icon={Mail} label="Εβδομαδιαίο email" value={emailDigest} onChange={setEmailDigest} />

        <Section label="Ιδιωτικότητα & ασφάλεια" />
        <ToggleRow
          icon={MapPin}
          label="Εμφάνιση περιοχής στο προφίλ"
          value={showLocation}
          onChange={(value) => savePrivacy({ showLocation: value })}
        />
        <ToggleRow
          icon={Eye}
          label="Να με βρίσκουν στην αναζήτηση"
          value={discoverable}
          onChange={(value) => savePrivacy({ discoverable: value })}
        />
        <Row
          icon={ShieldCheck}
          label="Αποκλεισμένες χρήστριες"
          value={String(blocked.length)}
          onPress={() => router.push('/blocked')}
        />
        <Text style={styles.note}>
          Το KousKous είναι κοινότητα μόνο για γυναίκες. Κάθε αναφορά ελέγχεται από την ομάδα μας.
        </Text>

        <Section label="Εφαρμογή" />
        <Row icon={Globe} label="Γλώσσα" value="Ελληνικά" onPress={() => setLanguageOpen(true)} />
        <Row
          icon={HelpCircle}
          label="Βοήθεια & επικοινωνία"
          onPress={() => router.push('/help')}
        />
        <Row icon={FileText} label="Όροι χρήσης & απόρρητο" onPress={() => router.push('/legal')} />

        <Section label="" />
        <Pressable
          onPress={() => {
            void signOut().then(() => router.replace('/welcome'));
          }}
          style={styles.dangerRow}
          accessibilityRole="button"
        >
          <LogOut size={17} color={colors.text} />
          <Text style={styles.dangerLabel}>
            {signedIn ? 'Αποσύνδεση' : 'Σύνδεση σε λογαριασμό'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setDeleteOpen(true)}
          style={styles.dangerRow}
          accessibilityRole="button"
        >
          <Trash2 size={17} color={colors.danger} />
          <Text style={[styles.dangerLabel, styles.deleteLabel]}>Διαγραφή λογαριασμού</Text>
        </Pressable>

        <Text style={styles.version}>KousKous · έκδοση 0.1.0</Text>
      </ScrollView>

      <LanguageSheet visible={languageOpen} onClose={() => setLanguageOpen(false)} />

      <ConfirmSheet
        visible={deleteOpen}
        title="Διαγραφή λογαριασμού"
        body="Θα σβηστούν το προφίλ, οι δημοσιεύσεις και οι συζητήσεις σου. Δεν γίνεται αναίρεση."
        confirmLabel="Διαγραφή οριστικά"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          void signOut().then(() => router.replace('/welcome'));
        }}
      />
    </SafeAreaView>
  );
}

function Section({ label }: { label: string }) {
  if (label.length === 0) return <View style={styles.sectionSpacer} />;
  return <Text style={styles.section}>{toGreekUpperCase(label)}</Text>;
}

function Row({
  icon: Icon,
  label,
  value,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} accessibilityRole="button">
      <Icon size={17} color={colors.text} strokeWidth={1.8} />
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      <ChevronRight size={15} color={colors.textInactive} />
    </Pressable>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Icon size={17} color={colors.text} strokeWidth={1.8} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.borderChip, true: colors.pink }}
        thumbColor={colors.white}
        accessibilityLabel={label}
      />
    </View>
  );
}

/** Renewal dates are stored as ISO; the UI shows them the Greek way. */
function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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
  headerTitle: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  identityCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    boxShadow: shadows.card,
  },
  identityName: {
    fontSize: 15,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  identityMeta: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.pink,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  sectionSpacer: {
    height: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
    marginBottom: 6,
  },
  rowLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.medium,
    color: colors.text,
  },
  rowValue: {
    maxWidth: 130,
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.pink,
    borderRadius: radii.xl,
    padding: spacing.lg,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  upgradeBody: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.white,
    opacity: 0.9,
    marginTop: 2,
  },
  note: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: spacing.sm,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
    marginBottom: 6,
  },
  dangerLabel: {
    fontSize: 13,
    fontFamily: font.medium,
    color: colors.text,
  },
  deleteLabel: {
    color: colors.danger,
  },
  version: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
