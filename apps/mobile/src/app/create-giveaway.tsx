import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays, Info, X } from 'lucide-react-native';
import { can, colors, radii, shadows, spacing, toGreekUpperCase } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { rewardsLevels } from '@/data/rewards';
import { useSession } from '@/state/session';
import { DateRangeCalendar } from '@/components/date-range-calendar';
import { PlaceholderScreen } from '@/components/placeholder-screen';

const MONTHS = ['Ιαν', 'Φεβ', 'Μαρ', 'Απρ', 'Μαΐ', 'Ιουν', 'Ιουλ', 'Αυγ', 'Σεπ', 'Οκτ', 'Νοε', 'Δεκ'];

function formatGreekDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/**
 * Official-only: publish a giveaway or partner offer to the Rewards Club.
 *
 * A giveaway costs points, never money — the Official account hands over a
 * code, it does not take payment (spec §9).
 */
export default function CreateGiveawayScreen() {
  const router = useRouter();
  const { user } = useSession();

  const [title, setTitle] = useState('');
  const [partner, setPartner] = useState('');
  const [cost, setCost] = useState('');
  const [minLevel, setMinLevel] = useState<string>(rewardsLevels[0].id);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [membersOnly, setMembersOnly] = useState(true);

  if (!can(user, 'official_dashboard')) {
    return (
      <PlaceholderScreen
        title="Μόνο για τον Official λογαριασμό"
        subtitle="Χωρίς πρόσβαση"
        body="Τα giveaways και οι προσφορές δημοσιεύονται από τον επίσημο λογαριασμό KousKous."
      />
    );
  }

  const canPublish = title.trim().length > 0 && partner.trim().length > 0 && endsAt !== null;
  const costValue = Number(cost.replace(',', '.'));
  const free = !Number.isFinite(costValue) || costValue <= 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.close}
          accessibilityRole="button"
          accessibilityLabel="Κλείσιμο"
        >
          <X size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Νέο giveaway</Text>
        <Pressable
          onPress={() => canPublish && router.back()}
          disabled={!canPublish}
          style={[styles.publish, !canPublish && styles.publishDisabled]}
          accessibilityRole="button"
        >
          <Text style={styles.publishLabel}>Δημοσίευση</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>{toGreekUpperCase('Τίτλος')}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="π.χ. Δωρεάν Spa Day για δύο"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.label}>{toGreekUpperCase('Συνεργάτιδα επιχείρηση')}</Text>
          <TextInput
            value={partner}
            onChangeText={setPartner}
            placeholder="π.χ. Amara Wellness"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.label}>{toGreekUpperCase('Κόστος σε πόντους')}</Text>
          <TextInput
            value={cost}
            onChangeText={setCost}
            placeholder="0 για δωρεάν συμμετοχή"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            style={styles.input}
          />
          <Text style={styles.hint}>
            {free ? 'Δωρεάν συμμετοχή για όλα τα μέλη.' : `${costValue} πόντοι ανά συμμετοχή.`}
          </Text>

          <Text style={styles.label}>{toGreekUpperCase('Ελάχιστο επίπεδο')}</Text>
          <View style={styles.chipWrap}>
            {rewardsLevels.map((level) => {
              const selected = level.id === minLevel;
              return (
                <Pressable
                  key={level.id}
                  onPress={() => setMinLevel(level.id)}
                  style={[styles.chip, selected && styles.chipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.chipLabel, selected && styles.chipLabelActive]}>
                    {level.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>{toGreekUpperCase('Λήγει')}</Text>
          <Pressable
            onPress={() => setDatePickerOpen((open) => !open)}
            style={styles.field}
            accessibilityRole="button"
          >
            <CalendarDays size={15} color={colors.gold} />
            <Text style={styles.fieldValue}>
              {endsAt ? formatGreekDate(endsAt) : 'Διάλεξε ημερομηνία λήξης'}
            </Text>
            <Text style={styles.fieldAction}>{datePickerOpen ? 'κλείσιμο' : 'αλλαγή'}</Text>
          </Pressable>

          {datePickerOpen ? (
            <View style={styles.calendarCard}>
              <DateRangeCalendar
                range={{ start: endsAt, end: endsAt }}
                onChange={(next) => {
                  setEndsAt(next.start);
                  if (next.start) setDatePickerOpen(false);
                }}
              />
            </View>
          ) : null}

          <View style={styles.toggleRow}>
            <View style={styles.toggleText}>
              <Text style={styles.toggleTitle}>Μόνο για συνδρομητικά μέλη</Text>
              <Text style={styles.toggleBody}>
                Οι δωρεάν λογαριασμοί βλέπουν το giveaway αλλά δεν συμμετέχουν.
              </Text>
            </View>
            <Switch
              value={membersOnly}
              onValueChange={setMembersOnly}
              trackColor={{ false: colors.borderChip, true: colors.gold }}
              thumbColor={colors.white}
              accessibilityLabel="Μόνο για συνδρομητικά μέλη"
            />
          </View>

          <View style={styles.notice}>
            <Info size={15} color={colors.pinkDark} />
            <Text style={styles.noticeLabel}>
              Το KousKous δεν εισπράττει χρήματα για τα giveaways. Η συμμετοχή γίνεται με πόντους
              και το δώρο το παρέχει η συνεργάτιδα επιχείρηση.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  publish: {
    backgroundColor: colors.gold,
    borderRadius: radii.full,
    paddingVertical: 9,
    paddingHorizontal: spacing.lg,
  },
  publishDisabled: {
    backgroundColor: colors.textInactive,
  },
  publishLabel: {
    fontSize: 12.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  label: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.gold,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.text,
  },
  hint: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 5,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
  },
  chipLabel: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  chipLabelActive: {
    color: colors.gold,
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
  fieldAction: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.gold,
  },
  calendarCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    boxShadow: shadows.card,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    marginTop: spacing.xl,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  toggleBody: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 1,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  noticeLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: font.medium,
    color: colors.pinkDark,
    lineHeight: 16,
  },
});
