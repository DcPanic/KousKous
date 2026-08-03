import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { colors, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';

interface PlaceholderScreenProps {
  title: string;
  subtitle: string;
  body: string;
}

/**
 * Stand-in for screens later in the MVP roadmap (spec §11 steps 9-12).
 * Keeps navigation entry points honest instead of leaving dead buttons.
 */
export function PlaceholderScreen({ title, subtitle, body }: PlaceholderScreenProps) {
  const router = useRouter();

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
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.bodyText}>{body}</Text>
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
    gap: spacing.md + 2,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  title: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  bodyText: {
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
