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
  { id: 'trip', name: 'Ταξίδι & Εκδρομή', emoji: '✈️' },
  { id: 'wellness', name: 'Ευεξία & Yoga', emoji: '🧘' },
  { id: 'fitness', name: 'Άθληση', emoji: '🏋️' },
  { id: 'culture', name: 'Πολιτισμός', emoji: '🎭' },
  { id: 'workshop', name: 'Workshop', emoji: '🎨' },
  { id: 'networking', name: 'Networking', emoji: '💼' },
  { id: 'party', name: 'Πάρτι', emoji: '🎉' },
  { id: 'moms', name: 'Μαμάδες & παιδιά', emoji: '👶' },
  { id: 'nature', name: 'Φύση & Πεζοπορία', emoji: '🥾' },
];

export function findEventCategory(id: string): EventCategory | undefined {
  return eventCategories.find((category) => category.id === id);
}

export type DatePreset = 'any' | 'today' | 'tomorrow' | 'weekend' | 'week' | 'month';

export const datePresetLabels: Record<DatePreset, string> = {
  any: 'Οποτεδήποτε',
  today: 'Σήμερα',
  tomorrow: 'Αύριο',
  weekend: 'Σαββατοκύριακο',
  week: 'Αυτή την εβδομάδα',
  month: 'Αυτόν τον μήνα',
};

export const datePresetOrder: DatePreset[] = [
  'any',
  'today',
  'tomorrow',
  'weekend',
  'week',
  'month',
];

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

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/**
 * Whether an ISO date falls inside the preset, measured against `today`
 * so the caller controls "now" and the result stays testable.
 *
 * The weekend runs to Sunday inclusive; asking on a Saturday should still
 * return that same weekend rather than the next one.
 */
export function matchesDatePreset(isoDate: string, preset: DatePreset, today = new Date()): boolean {
  if (preset === 'any') return true;

  const day = startOfDay(new Date(isoDate));
  if (Number.isNaN(day.getTime())) return false;

  const base = startOfDay(today);

  if (preset === 'today') return day.getTime() === base.getTime();
  if (preset === 'tomorrow') return day.getTime() === addDays(base, 1).getTime();

  if (preset === 'weekend') {
    // getDay: 0 Sunday … 6 Saturday.
    const weekday = base.getDay();
    const daysUntilSaturday = weekday === 0 ? 0 : 6 - weekday;
    const saturday = weekday === 0 ? addDays(base, -1) : addDays(base, daysUntilSaturday);
    const sunday = addDays(saturday, 1);
    return day >= saturday && day <= sunday;
  }

  if (preset === 'week') {
    return day >= base && day <= addDays(base, 7);
  }

  return day >= base && day <= addDays(base, 31);
}
