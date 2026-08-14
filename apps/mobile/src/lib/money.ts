/** Cents to the way prices are written in Greece: €12,50. */
export function euro(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace('.', ',')}`;
}

/** Parses "12,50" or "12.50" into cents. Returns null when unusable. */
export function parseEuro(input: string): number | null {
  const normalised = input.trim().replace(',', '.');
  if (normalised.length === 0) return null;

  const value = Number(normalised);
  if (!Number.isFinite(value) || value < 0) return null;

  return Math.round(value * 100);
}
