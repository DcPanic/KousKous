import { StyleSheet, Text } from 'react-native';
import { colors, spacing, toGreekUpperCase } from '@kouskous/shared';
import { font } from '@/theme/typography';

/** Small uppercase label that introduces a screen section. */
export function SectionEyebrow({ children }: { children: string }) {
  return <Text style={styles.text}>{toGreekUpperCase(children)}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.9,
    color: colors.pink,
    marginTop: 6,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.screen,
  },
});
