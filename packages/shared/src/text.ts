/**
 * Greek-aware text helpers.
 */

/**
 * Uppercase for display labels.
 *
 * Greek drops the tonos when text is set in capitals — ΚΟΙΝΟΤΗΤΕΣ, not
 * ΚΟΙΝΌΤΗΤΕΣ — but keeps the diaeresis, so ΐ becomes Ϊ rather than Ι.
 * A plain `toUpperCase()` gets this wrong and reads as a typo to any
 * Greek speaker, so every uppercase label goes through here.
 */
export function toGreekUpperCase(value: string): string {
  return (
    value
      .toUpperCase()
      // Decompose so accents become standalone combining marks.
      .normalize('NFD')
      // Drop tonos/oxia, varia, perispomeni and ypogegrammeni.
      // U+0308 (diaeresis) is deliberately absent — it survives.
      .replace(/[\u0301\u0300\u0342\u0345]/g, '')
      .normalize('NFC')
  );
}
