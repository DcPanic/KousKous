/**
 * Event filters.
 *
 * The set is deliberately small. Every filter here answers a question a
 * woman actually asks when she is deciding whether to go somewhere —
 * where, when, what kind, how much, and is there still room. Filters that
 * look thorough but nobody uses just make the sheet longer.
 */

export interface EventCategory {
  id: string;
  name: string;
  emoji: string;
}

export const eventCategories: EventCategory[] = [
  { id: 'beach', name: 'Θάλασσα', emoji: '🏖️' },
  { id: 'drinks', name: 'Ποτό & Μπαράκι', emoji: '🍹' },
  { id: 'food', name: 'Φαγητό', emoji: '🍽️' },
  { id: 'coffee', name: 'Καφές & Brunch', emoji: '☕' },
  { id: 'trip', name: 'Ταξίδι & Εκδρομή', emoji: '✈️' },
  { id: 'wellness', name: 'Ευεξία & Yoga', emoji: '🧘' },
  { id: 'fitness', name: 'Άθληση', emoji: '🏋️' },
  { id: 'culture', name: 'Πολιτισμός', emoji: '🎭' },
  { id: 'workshop', name: 'Workshop', emoji: '🎨' },
  { id: 'networking', name: 'Networking', emoji: '💼' },
  { id: 'party', name: 'Πάρτι', emoji: '🎉' },
  { id: 'moms', name: 'Μαμάδες & παιδιά', emoji: '👶' },
  { id: 'nature', name: 'Φύση & Πεζοπορία', emoji: '🥾' },
  { id: 'music', name: 'Μουσική & Συναυλίες', emoji: '🎶' },
  { id: 'cinema', name: 'Σινεμά & Θέατρο', emoji: '🎬' },
  { id: 'books', name: 'Book club', emoji: '📚' },
  { id: 'beauty', name: 'Beauty & Στιλ', emoji: '💄' },
  { id: 'volunteering', name: 'Εθελοντισμός', emoji: '🤝' },
];

export function findEventCategory(id: string): EventCategory | undefined {
  return eventCategories.find((category) => category.id === id);
}

export interface DateRange {
  /** ISO date, inclusive. Null means unbounded on that side. */
  start: string | null;
  end: string | null;
}

export const emptyDateRange: DateRange = { start: null, end: null };

export function hasDateRange(range: DateRange): boolean {
  return range.start !== null || range.end !== null;
}

function dayNumber(iso: string): number {
  const date = new Date(iso);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Whether an event falls inside the chosen range, comparing whole days so
 * an event later on the end date still counts.
 *
 * A single chosen day means exactly that day: picking a start without an
 * end is a complete answer ("this Saturday"), not a half-finished one.
 */
export function matchesDateRange(isoDate: string, range: DateRange): boolean {
  if (!hasDateRange(range)) return true;

  const day = dayNumber(isoDate);
  if (Number.isNaN(day)) return false;

  const from = range.start ? dayNumber(range.start) : null;
  const to = range.end ? dayNumber(range.end) : from;

  if (from !== null && day < from) return false;
  if (to !== null && day > to) return false;
  return true;
}

export type PriceBand = 'any' | 'free' | 'upTo15' | 'upTo30' | 'over30';

export const priceBandLabels: Record<PriceBand, string> = {
  any: 'Οποιαδήποτε',
  free: 'Δωρεάν',
  upTo15: 'Έως €15',
  upTo30: '€15 – €30',
  over30: 'Πάνω από €30',
};

export const priceBandOrder: PriceBand[] = ['any', 'free', 'upTo15', 'upTo30', 'over30'];

export function matchesPrice(price: number, band: PriceBand): boolean {
  switch (band) {
    case 'free':
      return price === 0;
    case 'upTo15':
      return price > 0 && price <= 15;
    case 'upTo30':
      return price > 15 && price <= 30;
    case 'over30':
      return price > 30;
    default:
      return true;
  }
}
