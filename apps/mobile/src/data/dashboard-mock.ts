/**
 * Placeholder content for the Host and Official dashboards.
 * Mirrors the numbers used in the approved mockups.
 */

export interface HostEvent {
  id: string;
  title: string;
  date: string;
  spots: string;
  revenue: string;
}

export interface HostPayment {
  id: string;
  name: string;
  event: string;
  amount: string;
}

export interface HostReview {
  id: string;
  name: string;
  text: string;
  stars: number;
}

export const hostStats = {
  revenue: '€1.240',
  activeEvents: '3',
  bookings: '86',
  rating: '4.9 ★',
};

export const hostNextEvent = {
  title: 'Πρωινή Yoga στη Βουλιαγμένη',
  date: 'Κυρ 10 Αυγ · 08:30',
  booked: 18,
  capacity: 24,
};

export const hostEvents: Record<'upcoming' | 'past', HostEvent[]> = {
  upcoming: [
    { id: 'he1', title: 'Πρωινή Yoga στη Βουλιαγμένη', date: 'Κυρ 10 Αυγ', spots: '18/24', revenue: '€270' },
    { id: 'he2', title: 'Sunset Pilates', date: 'Τετ 13 Αυγ', spots: '6/15', revenue: '€90' },
  ],
  past: [{ id: 'he3', title: 'Boat Party Ιουλίου', date: '20 Ιουλ', spots: '40/40', revenue: '€1.200' }],
};

export const hostPayments: HostPayment[] = [
  { id: 'hp1', name: 'Ελένη Κ.', event: 'Πρωινή Yoga', amount: '€15' },
  { id: 'hp2', name: 'Μαρία Π.', event: 'Sunset Pilates', amount: '€15' },
  { id: 'hp3', name: 'Κατερίνα Ν.', event: 'Πρωινή Yoga', amount: '€15' },
];

export const hostReviews: HostReview[] = [
  { id: 'hr1', name: 'Ελένη Κ.', text: 'Καταπληκτική εμπειρία, θα ξανάρθω σίγουρα!', stars: 5 },
  { id: 'hr2', name: 'Ζωή Μ.', text: 'Πολύ καλή οργάνωση, ωραίος χώρος.', stars: 5 },
];

export const hostRatingSummary = { average: '4.9', count: 64 };

export const officialStats = {
  newMembers: '1.842',
  activeEvents: '9',
  announcementReach: '42.1k',
  activeGiveaways: '3',
};

export interface OfficialEvent {
  id: string;
  title: string;
  date: string;
  spots: string;
  sponsor: string | null;
}

export const officialEvents: OfficialEvent[] = [
  { id: 'oe1', title: 'Summer Boat Party', date: 'Σάβ 16 Αυγ', spots: '112/150', sponsor: 'Χορηγία: Aperol' },
  { id: 'oe2', title: 'Networking Night Αθήνα', date: 'Πέμ 21 Αυγ', spots: '34/80', sponsor: null },
];

export interface OfficialGiveaway {
  id: string;
  title: string;
  entries: string;
  ends: string;
}

export const officialGiveaways: OfficialGiveaway[] = [
  { id: 'og1', title: 'Δωρεάν Spa Day — Amara Wellness', entries: '3.204 συμμετοχές', ends: 'Λήγει σε 2 μέρες' },
  { id: 'og2', title: '-30% σε Beauty Boxes', entries: 'Ενεργή προσφορά', ends: 'Έως 31 Αυγ' },
];

export interface OfficialAnnouncement {
  id: string;
  text: string;
  reach: string;
}

export const officialAnnouncements: OfficialAnnouncement[] = [
  { id: 'oa1', text: '🎉 Νέο event στην Αθήνα αυτό το Σάββατο!', reach: '38.1k views' },
  { id: 'oa2', text: '✨ Το KousKous έφτασε τα 50.000 μέλη!', reach: '44.6k views' },
];

/** Audience size shown on the announcement send button. */
export const officialAudienceLabel = '48.2k χρήστριες';
