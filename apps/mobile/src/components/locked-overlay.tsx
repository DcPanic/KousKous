import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { colors, paidMemberCta, radii, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';

interface LockedOverlayProps {
  title: string;
  subtitle: string;
  onUpgrade?: () => void;
}

/**
 * Paywall overlay shown to free members over Forums and Events (spec §3).
 * The content underneath stays rendered and readable at the top so the
 * value of upgrading is visible — it fades out rather than being hidden.
 */
export function LockedOverlay({ title, subtitle, onUpgrade }: LockedOverlayProps) {
  return (
    <LinearGradient
      colors={['rgba(255,246,248,0)', colors.cream]}
      locations={[0, 0.6]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.overlay}
    >
      <View style={styles.lockCircle}>
        <Lock size={17} color={colors.white} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Pressable style={styles.cta} onPress={onUpgrade} accessibilityRole="button">
        <Text style={styles.ctaLabel}>{paidMemberCta}</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xxl,
    paddingBottom: 28,
    // The fade is decorative; taps must reach the CTA but nothing else.
    pointerEvents: 'box-none',
  },
  lockCircle: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    backgroundColor: colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md + 2,
  },
  title: {
    fontSize: 16.5,
    fontFamily: font.extrabold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12.5,
    color: colors.textMuted,
    fontFamily: font.regular,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  cta: {
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: 26,
  },
  ctaLabel: {
    color: colors.white,
    fontSize: 13.5,
    fontFamily: font.extrabold,
  },
});
