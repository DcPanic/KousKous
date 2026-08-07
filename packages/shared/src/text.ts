/**
 * Greek-aware text helpers.
 */

/**
 * Folds a string for searching: lower case, no accents, no diaeresis, and
 * final sigma normalised.
 *
 * Greek is typed without accents far more often than with them, and "ς"
 * versus "σ" is a position rule rather than a different letter, so a
 * search box that distinguishes either of them finds nothing.
 */
export function normalizeForSearch(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ς/g, 'σ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC');
}

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
