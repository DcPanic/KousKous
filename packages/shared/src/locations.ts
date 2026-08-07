/**
 * Places (master prompt §4).
 *
 * A place is NOT a forum. It is a cross-cutting filter applied to the
 * Feed, Forums and Events alike. Selecting nothing means "everywhere".
 *
 * Places form a hierarchy — country, region, city, area — so a member can
 * be as broad as "Κύπρος" or as narrow as "Βουλιαγμένη". Selecting a
 * parent includes everything under it, which is why content only ever
 * stores the most specific place id.
 */

import { normalizeForSearch } from './text';

export type Country = 'GR' | 'CY';
export type PlaceKind = 'country' | 'region' | 'city' | 'area';

export interface Place {
  id: string;
  name: string;
  kind: PlaceKind;
  country: Country;
  /** Absent only for countries. */
  parentId?: string;
}

export const places: Place[] = [
  { id: 'gr', name: 'Ελλάδα', kind: 'country', country: 'GR' },
  { id: 'cy', name: 'Κύπρος', kind: 'country', country: 'CY' },

  // --- Greece ---
  { id: 'attica', name: 'Αττική', kind: 'region', country: 'GR', parentId: 'gr' },
  { id: 'athens', name: 'Αθήνα', kind: 'city', country: 'GR', parentId: 'attica' },
  { id: 'piraeus', name: 'Πειραιάς', kind: 'city', country: 'GR', parentId: 'attica' },
  { id: 'glyfada', name: 'Γλυφάδα', kind: 'area', country: 'GR', parentId: 'attica' },
  { id: 'kifisia', name: 'Κηφισιά', kind: 'area', country: 'GR', parentId: 'attica' },
  { id: 'marousi', name: 'Μαρούσι', kind: 'area', country: 'GR', parentId: 'attica' },
  { id: 'vouliagmeni', name: 'Βουλιαγμένη', kind: 'area', country: 'GR', parentId: 'attica' },
  { id: 'kolonaki', name: 'Κολωνάκι', kind: 'area', country: 'GR', parentId: 'attica' },

  { id: 'macedonia', name: 'Κεντρική Μακεδονία', kind: 'region', country: 'GR', parentId: 'gr' },
  { id: 'thessaloniki', name: 'Θεσσαλονίκη', kind: 'city', country: 'GR', parentId: 'macedonia' },
  { id: 'kalamaria', name: 'Καλαμαριά', kind: 'area', country: 'GR', parentId: 'macedonia' },
  { id: 'halkidiki', name: 'Χαλκιδική', kind: 'city', country: 'GR', parentId: 'macedonia' },

  { id: 'thessaly', name: 'Θεσσαλία', kind: 'region', country: 'GR', parentId: 'gr' },
  { id: 'larisa', name: 'Λάρισα', kind: 'city', country: 'GR', parentId: 'thessaly' },
  { id: 'volos', name: 'Βόλος', kind: 'city', country: 'GR', parentId: 'thessaly' },

  { id: 'crete', name: 'Κρήτη', kind: 'region', country: 'GR', parentId: 'gr' },
  { id: 'heraklion', name: 'Ηράκλειο', kind: 'city', country: 'GR', parentId: 'crete' },
  { id: 'chania', name: 'Χανιά', kind: 'city', country: 'GR', parentId: 'crete' },
  { id: 'rethymno', name: 'Ρέθυμνο', kind: 'city', country: 'GR', parentId: 'crete' },

  { id: 'peloponnese', name: 'Πελοπόννησος', kind: 'region', country: 'GR', parentId: 'gr' },
  { id: 'patra', name: 'Πάτρα', kind: 'city', country: 'GR', parentId: 'peloponnese' },
  { id: 'nafplio', name: 'Ναύπλιο', kind: 'city', country: 'GR', parentId: 'peloponnese' },
  { id: 'kalamata', name: 'Καλαμάτα', kind: 'city', country: 'GR', parentId: 'peloponnese' },

  { id: 'epirus', name: 'Ήπειρος', kind: 'region', country: 'GR', parentId: 'gr' },
  { id: 'ioannina', name: 'Ιωάννινα', kind: 'city', country: 'GR', parentId: 'epirus' },

  { id: 'aegean', name: 'Νησιά Αιγαίου', kind: 'region', country: 'GR', parentId: 'gr' },
  { id: 'mykonos', name: 'Μύκονος', kind: 'city', country: 'GR', parentId: 'aegean' },
  { id: 'santorini', name: 'Σαντορίνη', kind: 'city', country: 'GR', parentId: 'aegean' },
  { id: 'rhodes', name: 'Ρόδος', kind: 'city', country: 'GR', parentId: 'aegean' },
  { id: 'paros', name: 'Πάρος', kind: 'city', country: 'GR', parentId: 'aegean' },

  { id: 'ionian', name: 'Ιόνια Νησιά', kind: 'region', country: 'GR', parentId: 'gr' },
  { id: 'corfu', name: 'Κέρκυρα', kind: 'city', country: 'GR', parentId: 'ionian' },
  { id: 'zakynthos', name: 'Ζάκυνθος', kind: 'city', country: 'GR', parentId: 'ionian' },
  { id: 'lefkada', name: 'Λευκάδα', kind: 'city', country: 'GR', parentId: 'ionian' },

  // --- Cyprus ---
  { id: 'nicosia-d', name: 'Επαρχία Λευκωσίας', kind: 'region', country: 'CY', parentId: 'cy' },
  { id: 'nicosia', name: 'Λευκωσία', kind: 'city', country: 'CY', parentId: 'nicosia-d' },

  { id: 'limassol-d', name: 'Επαρχία Λεμεσού', kind: 'region', country: 'CY', parentId: 'cy' },
  { id: 'limassol', name: 'Λεμεσός', kind: 'city', country: 'CY', parentId: 'limassol-d' },

  { id: 'larnaca-d', name: 'Επαρχία Λάρνακας', kind: 'region', country: 'CY', parentId: 'cy' },
  { id: 'larnaca', name: 'Λάρνακα', kind: 'city', country: 'CY', parentId: 'larnaca-d' },

  { id: 'paphos-d', name: 'Επαρχία Πάφου', kind: 'region', country: 'CY', parentId: 'cy' },
  { id: 'paphos', name: 'Πάφος', kind: 'city', country: 'CY', parentId: 'paphos-d' },

  { id: 'famagusta-d', name: 'Επαρχία Αμμοχώστου', kind: 'region', country: 'CY', parentId: 'cy' },
  { id: 'ayia-napa', name: 'Αγία Νάπα', kind: 'city', country: 'CY', parentId: 'famagusta-d' },
  { id: 'protaras', name: 'Πρωταράς', kind: 'area', country: 'CY', parentId: 'famagusta-d' },
  { id: 'paralimni', name: 'Παραλίμνι', kind: 'area', country: 'CY', parentId: 'famagusta-d' },
];

/** Shown on the filter button when nothing is selected. */
export const allPlacesLabel = 'Όλη η Ελλάδα & Κύπρος';

export const placeKindLabels: Record<PlaceKind, string> = {
  country: 'Χώρα',
  region: 'Περιοχή',
  city: 'Πόλη',
  area: 'Περιοχή/Προάστιο',
};

export function findPlace(id: string): Place | undefined {
  return places.find((place) => place.id === id);
}

/** Ancestors from the immediate parent upwards. */
export function placeAncestors(id: string): Place[] {
  const chain: Place[] = [];
  let current = findPlace(id);

  while (current?.parentId) {
    const parent = findPlace(current.parentId);
    if (!parent) break;
    chain.push(parent);
    current = parent;
  }

  return chain;
}

/** "Αθήνα · Αττική, Ελλάδα" — enough context to tell places apart. */
export function placeBreadcrumb(id: string): string {
  return placeAncestors(id)
    .map((place) => place.name)
    .join(', ');
}

/**
 * Whether a piece of content belongs to the current selection.
 *
 * Content stores its most specific place, so a selected country or region
 * matches by walking up the content's ancestry rather than expanding the
 * selection downwards.
 */
export function matchesPlaces(contentPlaceId: string | null, selectedIds: string[]): boolean {
  if (selectedIds.length === 0) return true;
  if (!contentPlaceId) return false;
  if (selectedIds.includes(contentPlaceId)) return true;

  return placeAncestors(contentPlaceId).some((ancestor) => selectedIds.includes(ancestor.id));
}

/**
 * Type-ahead over every place, accent- and case-insensitive because
 * nobody types accents into a search box.
 */
export function searchPlaces(query: string, limit = 12): Place[] {
  const needle = normalizeForSearch(query);
  if (needle.length === 0) return [];

  const matches = places.filter((place) => normalizeForSearch(place.name).includes(needle));

  // Names that start with the query are the ones being looked for.
  return matches
    .sort((a, b) => {
      const aStarts = normalizeForSearch(a.name).startsWith(needle) ? 0 : 1;
      const bStarts = normalizeForSearch(b.name).startsWith(needle) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return a.name.localeCompare(b.name, 'el');
    })
    .slice(0, limit);
}

/** Places grouped under each country, for browsing without searching. */
export function placesByCountry(country: Country): Place[] {
  return places.filter((place) => place.country === country && place.kind !== 'country');
}

export function placeChildren(parentId: string): Place[] {
  return places.filter((place) => place.parentId === parentId);
}

/**
 * Regions of a country, each with the places inside it — the shape the
 * browse list needs so a region reads as a heading rather than as a
 * sibling of its own cities.
 */
export function regionsWithPlaces(country: Country): { region: Place; children: Place[] }[] {
  return places
    .filter((place) => place.country === country && place.kind === 'region')
    .map((region) => ({ region, children: placeChildren(region.id) }));
}

export function placeFilterLabel(selectedIds: string[]): string {
  if (selectedIds.length === 0) return allPlacesLabel;
  if (selectedIds.length === 1) return findPlace(selectedIds[0])?.name ?? allPlacesLabel;
  return `${selectedIds.length} τοποθεσίες`;
}

// --- Backwards-compatible aliases -------------------------------------------
// Earlier screens referred to these names; keeping them avoids a rename
// sweep for identical behaviour.
export const locations = places.filter((place) => place.kind === 'city');
export const findLocation = findPlace;
export const locationFilterLabel = placeFilterLabel;
export const allLocationsLabel = allPlacesLabel;
export type Location = Place;
