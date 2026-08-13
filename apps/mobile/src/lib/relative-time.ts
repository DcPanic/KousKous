/**
 * "πριν 2 ώρες" from a timestamp.
 *
 * Greek needs the accusative for the plural of ώρα and μέρα, so the forms
 * are written out rather than assembled from a singular.
 */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));

  if (seconds < 60) return 'μόλις τώρα';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes === 1 ? '1 λεπτό πριν' : `${minutes} λεπτά πριν`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? '1 ώρα πριν' : `${hours} ώρες πριν`;

  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? 'χθες' : `${days} μέρες πριν`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks === 1 ? '1 εβδομάδα πριν' : `${weeks} εβδομάδες πριν`;

  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? '1 μήνα πριν' : `${months} μήνες πριν`;

  const years = Math.floor(days / 365);
  return years === 1 ? '1 χρόνο πριν' : `${years} χρόνια πριν`;
}
