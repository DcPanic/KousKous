/**
 * Location filter (master prompt §4).
 *
 * A location is NOT a forum. It is a cross-cutting filter applied to the
 * Feed, Forums and Events alike. Selecting nothing means "everything".
 */

export type Country = 'GR' | 'CY';

export interface Location {
  id: string;
  name: string;
  country: Country;
}

export const locations: Location[] = [
  { id: 'athens', name: 'Αθήνα', country: 'GR' },
  { id: 'thessaloniki', name: 'Θεσσαλονίκη', country: 'GR' },
  { id: 'nicosia', name: 'Λευκωσία', country: 'CY' },
  { id: 'limassol', name: 'Λεμεσός', country: 'CY' },
  { id: 'larnaca', name: 'Λάρνακα', country: 'CY' },
  { id: 'paphos', name: 'Πάφος', country: 'CY' },
];

/** Shown on the filter pill when no location is selected. */
export const allLocationsLabel = 'Όλη η Ελλάδα & Κύπρος';

export function findLocation(id: string): Location | undefined {
  return locations.find((location) => location.id === id);
}

/**
 * Label for the location filter pill.
 * One selection shows its name; several show a count.
 */
export function locationFilterLabel(selectedIds: string[]): string {
  if (selectedIds.length === 0) return allLocationsLabel;
  if (selectedIds.length === 1) {
    return findLocation(selectedIds[0])?.name ?? allLocationsLabel;
  }
  return `${selectedIds.length} τοποθεσίες`;
}
