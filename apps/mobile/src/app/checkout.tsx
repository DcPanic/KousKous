import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, Info, Lock, RotateCcw, ShieldCheck } from 'lucide-react-native';
import {
  colors,
  HOST_PRICE_MIN_EUR,
  PAID_MEMBER_PRICE_EUR,
  radii,
  shadows,
  spacing,
  toGreekUpperCase,
} from '@kouskous/shared';
import { font } from '@/theme/typography';

function euro(value: number): string {
  return `€${value.toFixed(2).replace('.', ',')}`;
}

/**
 * Order summary before payment.
 *
 * Stripe is the chosen provider but no keys exist yet, so the pay button
 * is deliberately inert and says so. Nothing here should ever pretend a
 * charge happened.
 */
export default function CheckoutScreen() {
  const router = useRouter();
  const { plan } = useLocalSearchParams<{ plan?: string }>();

  const isHost = plan === 'host';
  const title = isHost ? 'Premium Host' : 'Μέλος KousKous';
  const price = isHost ? HOST_PRICE_MIN_EUR : PAID_MEMBER_PRICE_EUR;

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
        <Text style={styles.headerTitle}>Ολοκλήρωση</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{toGreekUpperCase('Η συνδρομή σου')}</Text>
        <View style={styles.card}>
          <View style={styles.line}>
            <Text style={styles.lineLabel}>{title}</Text>
            <Text style={styles.lineValue}>{euro(price)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.line}>
            <Text style={styles.totalLabel}>Σύνολο / μήνα</Text>
            <Text style={styles.totalValue}>{euro(price)}</Text>
          </View>
          <Text style={styles.vat}>Οι τιμές περιλαμβάνουν ΦΠΑ.</Text>
        </View>

        <Text style={styles.sectionTitle}>{toGreekUpperCase('Πληρωμή')}</Text>
        <View style={styles.card}>
          <View style={styles.providerRow}>
            <View style={styles.providerIcon}>
              <CreditCard size={17} color={colors.pink} />
            </View>
            <View style={styles.providerText}>
              <Text style={styles.providerName}>Κάρτα μέσω Stripe</Text>
              <Text style={styles.providerBody}>Visa, Mastercard, Apple Pay, Google Pay</Text>
            </View>
          </View>
        </View>

        <View style={styles.assurances}>
          <Assurance icon={ShieldCheck} label="Τα στοιχεία της κάρτας δεν περνούν ποτέ από το KousKous." />
          <Assurance icon={RotateCcw} label="Ακυρώνεις όποτε θες, χωρίς δέσμευση." />
        </View>

        <View style={styles.notice}>
          <Info size={15} color={colors.pinkDark} />
          <Text style={styles.noticeLabel}>
            Η σύνδεση με το Stripe δεν έχει ενεργοποιηθεί ακόμα. Μόλις μπουν τα κλειδιά του
            λογαριασμού, το κουμπί παρακάτω ανοίγει την κανονική πληρωμή.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.payButton}>
          <Lock size={15} color={colors.white} />
          <Text style={styles.payLabel}>Πληρωμή {euro(price)}/μήνα</Text>
        </View>
        <Text style={styles.pendingLabel}>Ενεργοποιείται με τη σύνδεση του Stripe</Text>
      </View>
    </SafeAreaView>
  );
}

function Assurance({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <View style={styles.assurance}>
      <Icon size={15} color={colors.success} />
      <Text style={styles.assuranceLabel}>{label}</Text>
    </View>
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
  headerTitle: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.pink,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    boxShadow: shadows.card,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lineLabel: {
    fontSize: 13,
    fontFamily: font.medium,
    color: colors.textBody,
  },
  lineValue: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.pink,
  },
  vat: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textFaint,
    marginTop: spacing.sm,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  providerIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.pinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerText: {
    flex: 1,
  },
  providerName: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  providerBody: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 1,
  },
  assurances: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  assurance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  assuranceLabel: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    lineHeight: 17,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  noticeLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: font.medium,
    color: colors.pinkDark,
    lineHeight: 16,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    alignSelf: 'stretch',
    backgroundColor: colors.textInactive,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 3,
  },
  payLabel: {
    fontSize: 14,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  pendingLabel: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
