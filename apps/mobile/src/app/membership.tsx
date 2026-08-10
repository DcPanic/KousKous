import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CalendarHeart,
  Check,
  Gift,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import {
  accountTier,
  colors,
  gradients,
  HOST_PRICE_MAX_EUR,
  HOST_PRICE_MIN_EUR,
  PAID_MEMBER_PRICE_EUR,
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

interface Benefit {
  icon: LucideIcon;
  title: string;
  body: string;
}

/** The paid side of the §3 feature matrix, in the members' own words. */
const BENEFITS: Benefit[] = [
  {
    icon: Users,
    title: 'Όλα τα forums',
    body: '14 κοινότητες — γράφεις, απαντάς, ρωτάς ό,τι θες.',
  },
  {
    icon: MessageSquareText,
    title: 'Προσωπικά μηνύματα',
    body: 'Μίλα με γυναίκες που γνώρισες σε events και συζητήσεις.',
  },
  {
    icon: CalendarHeart,
    title: 'Events του KousKous',
    body: 'Συμμετοχή στα events που διοργανώνουμε εμείς, σε όλη την Ελλάδα και την Κύπρο.',
  },
  {
    icon: Gift,
    title: 'Διαγωνισμοί & δώρα',
    body: 'Πόντοι από κάθε συμμετοχή, giveaways και προσφορές συνεργατών.',
  },
  {
    icon: ShieldCheck,
    title: 'Επαληθευμένη κοινότητα',
    body: 'Μόνο γυναίκες, με έλεγχο σε κάθε αναφορά.',
  },
];

/** What stays free, so the offer is honest about the difference. */
const FREE_INCLUDES = [
  'Feed και stories',
  'Like, σχόλια, δημοσιεύσεις',
  'Όλα τα events των διοργανωτριών — και συμμετοχή σε αυτά',
  'Προβολή των forums',
];

export default function MembershipScreen() {
  const router = useRouter();
  const { user } = useSession();
  const tier = accountTier(user);
  const alreadyMember = tier !== 'free';

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
        <Text style={styles.headerTitle}>Συνδρομή</Text>
        <View style={styles.closeSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <DiagonalGradient colors={gradients.officialCover} style={styles.hero}>
          <View style={styles.heroBadge}>
            <Sparkles size={14} color={colors.white} />
            <Text style={styles.heroBadgeLabel}>ΜΕΛΟΣ</Text>
          </View>
          <Text style={styles.heroTitle}>Μπες μέσα στην κοινότητα</Text>
          <Text style={styles.heroBody}>
            Forums, τα δικά μας events και τα δώρα — όλα όσα κάνουν το KousKous κοινότητα.
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{euro(PAID_MEMBER_PRICE_EUR)}</Text>
            <Text style={styles.per}>/μήνα</Text>
          </View>
          <Text style={styles.cancel}>Ακυρώνεις όποτε θες.</Text>
        </DiagonalGradient>

        <Text style={styles.sectionTitle}>{toGreekUpperCase('Τι παίρνεις')}</Text>
        {BENEFITS.map(({ icon: Icon, title, body }) => (
          <View key={title} style={styles.benefit}>
            <View style={styles.benefitIcon}>
              <Icon size={17} color={colors.pink} />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>{title}</Text>
              <Text style={styles.benefitBody}>{body}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>{toGreekUpperCase('Δωρεάν λογαριασμός')}</Text>
        <View style={styles.freeCard}>
          {FREE_INCLUDES.map((item) => (
            <View key={item} style={styles.freeRow}>
              <Check size={14} color={colors.textMuted} />
              <Text style={styles.freeLabel}>{item}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{toGreekUpperCase('Διοργανώνεις events;')}</Text>
        <Pressable
          onPress={() => router.push('/host-plan')}
          style={styles.hostCard}
          accessibilityRole="button"
        >
          <View style={styles.hostIcon}>
            <CalendarHeart size={18} color={colors.hostPurple} />
          </View>
          <View style={styles.hostText}>
            <Text style={styles.hostTitle}>Premium Host</Text>
            <Text style={styles.hostBody}>
              Δικά σου events με εισιτήριο, dashboard και check-in ·{' '}
              {euro(HOST_PRICE_MIN_EUR)}–{euro(HOST_PRICE_MAX_EUR)}/μήνα
            </Text>
          </View>
        </Pressable>

        <Text style={styles.finePrint}>
          Η χρέωση γίνεται με ασφάλεια μέσω Stripe. Το KousKous δεν αποθηκεύει ποτέ τα στοιχεία της
          κάρτας σου.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        {alreadyMember ? (
          <View style={[styles.subscribe, styles.subscribeDone]}>
            <Check size={16} color={colors.white} />
            <Text style={styles.subscribeLabel}>Είσαι ήδη μέλος</Text>
          </View>
        ) : (
          <Pressable
            onPress={() => router.push('/checkout')}
            style={styles.subscribe}
            accessibilityRole="button"
          >
            <Text style={styles.subscribeLabel}>
              Γίνε μέλος · {euro(PAID_MEMBER_PRICE_EUR)}/μήνα
            </Text>
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
    justifyContent: 'space-between',
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
    boxShadow: shadows.card,
  },
  closeSpacer: {
    width: 34,
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
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radii.full,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
  },
  heroBadgeLabel: {
    fontSize: 10,
    fontFamily: font.extrabold,
    letterSpacing: 1,
    color: colors.white,
  },
  heroTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontFamily: font.extrabold,
    color: colors.white,
    marginTop: spacing.md,
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
    fontSize: 34,
    lineHeight: 40,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  per: {
    fontSize: 13,
    fontFamily: font.medium,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 5,
  },
  cancel: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.white,
    opacity: 0.85,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.pink,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md + 2,
    marginBottom: spacing.sm,
    boxShadow: shadows.card,
  },
  benefitIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.pinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  benefitBody: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 1,
  },
  freeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    boxShadow: shadows.card,
  },
  freeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  freeLabel: {
    fontSize: 12,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.hostPurpleTint,
    borderRadius: radii.xl,
    padding: spacing.md + 2,
  },
  hostIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.hostPurpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostText: {
    flex: 1,
  },
  hostTitle: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.hostPurpleDark,
  },
  hostBody: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 1,
  },
  finePrint: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textFaint,
    lineHeight: 16,
    marginTop: spacing.xl,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  subscribe: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 3,
  },
  subscribeDone: {
    backgroundColor: colors.success,
  },
  subscribeLabel: {
    fontSize: 14,
    fontFamily: font.extrabold,
    color: colors.white,
  },
});
