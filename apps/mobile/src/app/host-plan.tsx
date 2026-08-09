import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  BarChart3,
  BadgeCheck,
  QrCode,
  Star,
  Ticket,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import {
  accountTier,
  colors,
  gradients,
  HOST_PRICE_MAX_EUR,
  HOST_PRICE_MIN_EUR,
  radii,
  shadows,
  spacing,
  toGreekUpperCase,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import { useSession } from '@/state/session';
import { DiagonalGradient } from '@/components/gradient';

function euro(value: number): string {
  return `€${value.toFixed(2).replace('.', ',')}`;
}

const PERKS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Ticket,
    title: 'Events με εισιτήριο',
    body: 'Ορίζεις τιμή, θέσεις και πολιτική ακύρωσης.',
  },
  {
    icon: Wallet,
    title: '0% προμήθεια',
    body: 'Τα χρήματα των εισιτηρίων πάνε κατευθείαν στον λογαριασμό σου.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard διοργανώτριας',
    body: 'Συμμετοχές, έσοδα και reviews σε ένα σημείο.',
  },
  {
    icon: QrCode,
    title: 'Check-in με QR',
    body: 'Σκανάρεις στην είσοδο, χωρίς λίστες σε χαρτί.',
  },
  {
    icon: BadgeCheck,
    title: 'Επαληθευμένο προφίλ',
    body: 'Το σήμα διοργανώτριας δίπλα στο όνομά σου.',
  },
  {
    icon: Star,
    title: 'Προβολή',
    body: 'Τα events σου προτείνονται στις γυναίκες της περιοχής σου.',
  },
];

/** The two gates from §2.3, kept separate on purpose. */
const STEPS = [
  'Στέλνεις αίτημα με το προφίλ και το είδος των events σου.',
  'Η ομάδα του KousKous εγκρίνει τον λογαριασμό σου.',
  'Συνδέεις τον τραπεζικό σου λογαριασμό μέσω Stripe για να πληρώνεσαι.',
  'Δημοσιεύεις το πρώτο σου event.',
];

export default function HostPlanScreen() {
  const router = useRouter();
  const { user } = useSession();
  const tier = accountTier(user);
  const alreadyHost = tier === 'host' || tier === 'official';

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
        <Text style={styles.headerTitle}>Premium Host</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <DiagonalGradient colors={gradients.host} style={styles.hero}>
          <Text style={styles.heroTitle}>Κάνε τα events σου δουλειά</Text>
          <Text style={styles.heroBody}>
            Για γυναίκες που διοργανώνουν — ταξίδια, workshops, βραδιές, retreats.
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {euro(HOST_PRICE_MIN_EUR)}–{euro(HOST_PRICE_MAX_EUR)}
            </Text>
            <Text style={styles.per}>/μήνα</Text>
          </View>
          <View style={styles.commissionPill}>
            <Text style={styles.commissionLabel}>0% προμήθεια στα εισιτήρια</Text>
          </View>
        </DiagonalGradient>

        <Text style={styles.sectionTitle}>{toGreekUpperCase('Τι περιλαμβάνει')}</Text>
        {PERKS.map(({ icon: Icon, title, body }) => (
          <View key={title} style={styles.perk}>
            <View style={styles.perkIcon}>
              <Icon size={17} color={colors.hostPurple} />
            </View>
            <View style={styles.perkText}>
              <Text style={styles.perkTitle}>{title}</Text>
              <Text style={styles.perkBody}>{body}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>{toGreekUpperCase('Πώς ξεκινάς')}</Text>
        {STEPS.map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberLabel}>{index + 1}</Text>
            </View>
            <Text style={styles.stepLabel}>{step}</Text>
          </View>
        ))}

        <Text style={styles.finePrint}>
          Το KousKous δεν κρατάει ποτέ τα χρήματα των events. Οι πληρωμές των συμμετεχουσών πάνε
          απευθείας στη διοργανώτρια μέσω του δικού της λογαριασμού Stripe.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        {alreadyHost ? (
          <Pressable
            onPress={() => router.push('/host')}
            style={styles.cta}
            accessibilityRole="button"
          >
            <Text style={styles.ctaLabel}>Άνοιξε το dashboard σου</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push({ pathname: '/checkout', params: { plan: 'host' } })}
            style={styles.cta}
            accessibilityRole="button"
          >
            <Text style={styles.ctaLabel}>Κάνε αίτηση για Premium Host</Text>
          </Pressable>
        )}
      </View>
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
  headerTitle: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  hero: {
    borderRadius: radii.card,
    padding: spacing.lg,
  },
  heroTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  heroBody: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.white,
    opacity: 0.9,
    lineHeight: 19,
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginTop: spacing.lg,
  },
  price: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  per: {
    fontSize: 13,
    fontFamily: font.medium,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  commissionPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.full,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  commissionLabel: {
    fontSize: 11,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.hostPurple,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.sm,
    boxShadow: shadows.card,
  },
  perkIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.hostPurpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    flex: 1,
  },
  perkTitle: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  perkBody: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 1,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    backgroundColor: colors.hostPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberLabel: {
    fontSize: 11,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  stepLabel: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 19,
  },
  finePrint: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textFaint,
    lineHeight: 16,
    marginTop: spacing.lg,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  cta: {
    alignItems: 'center',
    backgroundColor: colors.hostPurple,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 3,
  },
  ctaLabel: {
    fontSize: 14,
    fontFamily: font.extrabold,
    color: colors.white,
  },
});
