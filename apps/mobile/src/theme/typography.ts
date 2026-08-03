/**
 * Font family names.
 *
 * React Native cannot synthesise weights for custom fonts, so every weight
 * is its own family. Always pick a family from here instead of pairing a
 * single family with `fontWeight`.
 */
export const font = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
  logo: 'Pacifico_400Regular',
} as const;

export type FontFamily = (typeof font)[keyof typeof font];
