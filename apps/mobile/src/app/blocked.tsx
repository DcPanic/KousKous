import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { useAppState } from '@/state/app-state';
import { Avatar } from '@/components/avatar';

export default function BlockedScreen() {
  const router = useRouter();
  const { blockedNames, toggleBlocked } = useAppState();

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
        <Text style={styles.headerTitle}>Αποκλεισμένες</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {blockedNames.length > 0 ? (
          <>
            <Text style={styles.intro}>
              Δεν βλέπεις τις δημοσιεύσεις τους και δεν μπορούν να σου στείλουν μήνυμα.
            </Text>
            {blockedNames.map((name) => (
              <View key={name} style={styles.row}>
                <Avatar size={40} />
                <Text style={styles.name} numberOfLines={1}>
                  {name}
                </Text>
                <Pressable
                  onPress={() => toggleBlocked(name)}
                  style={styles.unblock}
                  accessibilityRole="button"
                  accessibilityLabel={`Άρση αποκλεισμού ${name}`}
                >
                  <Text style={styles.unblockLabel}>Άρση</Text>
                </Pressable>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <ShieldCheck size={22} color={colors.success} />
            </View>
            <Text style={styles.emptyTitle}>Καμία αποκλεισμένη</Text>
            <Text style={styles.emptyBody}>
              Αν κάποια σε ενοχλεί, πάτα τις τρεις τελείες στη δημοσίευσή της και διάλεξε
              «Αποκλεισμός».
            </Text>
          </View>
        )}
      </ScrollView>
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
    flexGrow: 1,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  intro: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    boxShadow: shadows.card,
  },
  name: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  unblock: {
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    paddingVertical: 7,
    paddingHorizontal: spacing.lg,
  },
  unblockLabel: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: '#E4F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15.5,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  emptyBody: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
});
