import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarHeart, MessageSquareText, ShieldCheck, Users } from 'lucide-react-native';
import { colors, fontSizes, gradients, radii, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { DiagonalGradient } from '@/components/gradient';

const POINTS = [
  { icon: Users, label: '14 κοινότητες για ό,τι σε απασχολεί' },
  { icon: CalendarHeart, label: 'Events σε Ελλάδα και Κύπρο' },
  { icon: MessageSquareText, label: 'Γνωριμίες με γυναίκες δίπλα σου' },
  { icon: ShieldCheck, label: 'Κοινότητα μόνο για γυναίκες' },
];

/**
 * First screen a new woman sees. It sells the community, not the app —
 * everything below the fold is the §3 promise in four lines.
 */
export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <DiagonalGradient colors={gradients.officialCover} style={styles.screen}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.brand}>
          <Text style={styles.logo}>KousKous</Text>
          <Text style={styles.tagline}>Η παρέα σου, όπου κι αν είσαι</Text>
        </View>

        <View style={styles.points}>
          {POINTS.map(({ icon: Icon, label }) => (
            <View key={label} style={styles.point}>
              <View style={styles.pointIcon}>
                <Icon size={16} color={colors.white} />
              </View>
              <Text style={styles.pointLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push('/signup')}
            style={styles.primary}
            accessibilityRole="button"
          >
            <Text style={styles.primaryLabel}>Δημιουργία λογαριασμού</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/login')}
            style={styles.secondary}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryLabel}>Έχω ήδη λογαριασμό</Text>
          </Pressable>
          <Text style={styles.terms}>
            Συνεχίζοντας αποδέχεσαι τους όρους χρήσης και την πολιτική απορρήτου.
          </Text>
        </View>
      </SafeAreaView>
    </DiagonalGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  brand: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logo: {
    fontFamily: font.logo,
    fontSize: fontSizes.logo * 2.2,
    lineHeight: fontSizes.logo * 3,
    color: colors.white,
  },
  tagline: {
    fontSize: 14,
    fontFamily: font.medium,
    color: colors.white,
    opacity: 0.9,
  },
  points: {
    gap: spacing.md + 2,
  },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pointIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointLabel: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: font.medium,
    color: colors.white,
  },
  actions: {
    gap: spacing.sm,
  },
  primary: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 3,
  },
  primaryLabel: {
    fontSize: 14,
    fontFamily: font.extrabold,
    color: colors.pinkDark,
  },
  secondary: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1.4,
    borderColor: 'rgba(255,255,255,0.55)',
    paddingVertical: spacing.md + 3,
  },
  secondaryLabel: {
    fontSize: 14,
    fontFamily: font.bold,
    color: colors.white,
  },
  terms: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.white,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: spacing.sm,
  },
});
