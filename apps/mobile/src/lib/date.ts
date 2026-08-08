const WEEKDAYS = ['Κυρ', 'Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ'];
const MONTHS = [
  'Ιαν',
  'Φεβ',
  'Μαρ',
  'Απρ',
  'Μαΐ',
  'Ιουν',
  'Ιουλ',
  'Αυγ',
  'Σεπ',
  'Οκτ',
  'Νοε',
  'Δεκ',
];

/** "Σάβ 9 Αυγ" — the short form used on event cards. */
export function formatEventDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** Days from today, as an ISO date. Used to keep mock events current. */
export function isoDaysFromNow(days: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/** Days until the coming Saturday; 0 when today is already Saturday. */
export function daysUntilSaturday(today = new Date()): number {
  const weekday = today.getDay();
  return weekday === 6 ? 0 : (6 - weekday + 7) % 7;
}

/** "9 Αυγ" — compact form used in the date-range summary. */
export function formatShortDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}
