import { StyleSheet, Text, View } from 'react-native';
import { colors, gradients } from '@kouskous/shared';
import { DiagonalGradient } from './gradient';
import { font } from '@/theme/typography';

interface AvatarProps {
  size: number;
  /** Rendered centred in the circle — used by the Official account logo. */
  initial?: string;
  /** Ring drawn around the avatar, e.g. gold for the Official account. */
  ringColor?: string;
  ringWidth?: number;
  gradient?: readonly [string, string, ...string[]];
}

/**
 * Placeholder avatar. Real photos replace the gradient once media storage
 * is wired up; the gradient stays as the fallback for users without one.
 */
export function Avatar({
  size,
  initial,
  ringColor,
  ringWidth = 3,
  gradient = gradients.avatar,
}: AvatarProps) {
  return (
    <DiagonalGradient
      colors={gradient}
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: ringColor ?? 'transparent',
          borderWidth: ringColor ? ringWidth : 0,
        },
      ]}
    >
      {initial ? (
        <Text style={[styles.initial, { fontSize: size * 0.25 }]}>{initial}</Text>
      ) : null}
    </DiagonalGradient>
  );
}

/** Overlapping avatar pair used by the "liked by" social proof row. */
export function AvatarStack({ tints }: { tints: [string, string] }) {
  return (
    <View style={styles.stack}>
      {tints.map((tint, index) => (
        <View
          key={tint}
          style={[styles.stackItem, { backgroundColor: tint }, index > 0 && styles.stackOverlap]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initial: {
    color: colors.white,
    fontFamily: font.logo,
  },
  stack: {
    flexDirection: 'row',
  },
  stackItem: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  stackOverlap: {
    marginLeft: -6,
  },
});
