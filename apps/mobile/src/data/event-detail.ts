/**
 * Event detail content (spec §7 screen 4).
 *
 * Keyed by the ids used in `mock.ts` so tapping a card opens matching
 * content. Replaced by an Events query once Supabase is wired up.
 */

export interface EventAnnouncement {
  id: string;
  text: string;
  postedAt: string;
}

export interface EventFaq {
  id: string;
  question: string;
  answer: string;
}

export interface EventReviewSummary {
  id: string;
  author: string;
  rating: number;
  comment: string;
}

export interface EventDetail {
  id: string;
  title: string;
  hostName: string;
  hostVerified: boolean;
  /** Run by KousKous itself, which makes joining a members' benefit. */
  isOfficial: boolean;
  /** Location id from the shared locations list. */
  location: string;
  venue: string;
  address: string;
  date: string;
  time: string;
  /** Zero means a free event. */
  price: number;
  spotsTaken: number;
  spotsTotal: number;
  description: string;
  /** Placeholder tints until media storage exists. */
  gallery: string[];
  attendees: number;
  announcements: EventAnnouncement[];
  faq: EventFaq[];
  reviews: EventReviewSummary[];
  rating: number;
  reviewCount: number;
}

const DEFAULT_FAQ: EventFaq[] = [
  {
    id: 'f1',
    question: 'Τι πρέπει να φέρω μαζί μου;',
    answer: 'Μόνο τον εαυτό σου και άνετα ρούχα. Ό,τι άλλο χρειάζεται το παρέχουμε εμείς.',
  },
  {
    id: 'f2',
    question: 'Μπορώ να ακυρώσω;',
    answer:
      'Ναι, έως 48 ώρες πριν. Το αίτημα πάει απευθείας στη διοργανώτρια, που διαχειρίζεται την επιστροφή χρημάτων.',
  },
  {
    id: 'f3',
    question: 'Μπορώ να φέρω φίλη;',
    answer: 'Φυσικά — αρκεί να κλείσει και εκείνη θέση, εφόσον υπάρχει διαθεσιμότητα.',
  },
];

const events: EventDetail[] = [
  {
    id: 'e1',
    isOfficial: false,
    title: 'Wine Night στο Κολωνάκι',
    hostName: 'Νατάσα Ιωάννου',
    hostVerified: true,
    location: 'athens',
    venue: 'Wine Bar Κολωνάκι',
    address: 'Σκουφά 52, Αθήνα',
    date: 'Σάββατο 9 Αυγούστου',
    time: '20:00 – 23:00',
    price: 25,
    spotsTaken: 18,
    spotsTotal: 30,
    description:
      'Μια χαλαρή βραδιά γνωριμίας με κρασί και μεζέδες στην καρδιά του Κολωνακίου.\n\nΘα δοκιμάσουμε πέντε ελληνικές ετικέτες με τη σομελιέ Μαρία Κ., που θα μας εξηγήσει τι ψάχνουμε σε κάθε ποτήρι. Δεν χρειάζεται καμία προηγούμενη γνώση — ερχόμαστε για να περάσουμε καλά.',
    gallery: ['#FBE1E9', '#F5E6BE', '#E7C9D3', '#EADFF0'],
    attendees: 18,
    announcements: [
      { id: 'a1', text: 'Προσθέσαμε 5 επιπλέον θέσεις μετά από αίτημά σας! 🍷', postedAt: '2 μέρες πριν' },
      { id: 'a2', text: 'Το μενού είναι και vegetarian friendly.', postedAt: '5 μέρες πριν' },
    ],
    faq: DEFAULT_FAQ,
    reviews: [
      { id: 'r1', author: 'Ελένη Κ.', rating: 5, comment: 'Καταπληκτική βραδιά, γνώρισα υπέροχα κορίτσια!' },
      { id: 'r2', author: 'Ζωή Μ.', rating: 5, comment: 'Άψογη οργάνωση και πολύ ωραίος χώρος.' },
    ],
    rating: 4.9,
    reviewCount: 64,
  },
  {
    id: 'e2',
    isOfficial: false,
    title: 'Πρωινή Yoga στη Βουλιαγμένη',
    hostName: 'Νατάσα Ιωάννου',
    hostVerified: true,
    location: 'athens',
    venue: 'Παραλία Βουλιαγμένης',
    address: 'Λεωφ. Ποσειδώνος, Βουλιαγμένη',
    date: 'Κυριακή 10 Αυγούστου',
    time: '08:30 – 10:00',
    price: 15,
    spotsTaken: 18,
    spotsTotal: 24,
    description:
      'Ξεκίνα την Κυριακή σου με ήπια yoga δίπλα στη θάλασσα, πριν ζεστάνει ο ήλιος.\n\nΚατάλληλο για όλα τα επίπεδα. Φέρε στρώμα και πετσέτα — μετά μένουμε για καφέ όσες θέλουν.',
    gallery: ['#EADFF0', '#FBE1E9', '#F0E4D8'],
    attendees: 18,
    announcements: [
      { id: 'a1', text: 'Ραντεβού στο parking της παραλίας στις 08:15.', postedAt: '1 μέρα πριν' },
    ],
    faq: DEFAULT_FAQ,
    reviews: [
      { id: 'r1', author: 'Κατερίνα Ν.', rating: 5, comment: 'Τέλειος τρόπος να ξεκινήσει η μέρα.' },
    ],
    rating: 4.9,
    reviewCount: 41,
  },
  {
    id: 'e3',
    isOfficial: true,
    title: 'Brunch & Networking',
    hostName: 'Ελένη Βασιλείου',
    hostVerified: false,
    location: 'thessaloniki',
    venue: 'Café Νέα Παραλία',
    address: 'Λεωφ. Μεγάλου Αλεξάνδρου, Θεσσαλονίκη',
    date: 'Σάββατο 16 Αυγούστου',
    time: '11:00 – 14:00',
    price: 0,
    spotsTaken: 12,
    spotsTotal: 32,
    description:
      'Χαλαρό brunch για γυναίκες που θέλουν να γνωρίσουν κόσμο εκτός δουλειάς.\n\nΧωρίς παρουσιάσεις και χωρίς κάρτες — απλώς καφές, φαγητό και κουβέντα. Δωρεάν συμμετοχή, ο καθένας πληρώνει ό,τι καταναλώσει.',
    gallery: ['#F0E4D8', '#FBE1E9', '#E7C9D3'],
    attendees: 12,
    announcements: [],
    faq: DEFAULT_FAQ,
    reviews: [],
    rating: 0,
    reviewCount: 0,
  },
  {
    id: 'e4',
    isOfficial: false,
    title: 'Sunset Yoga στη Λεμεσό',
    hostName: 'Μαρίνα Χατζή',
    hostVerified: true,
    location: 'limassol',
    venue: 'Dasoudi Beach',
    address: 'Dasoudi Beach, Λεμεσός',
    date: 'Παρασκευή 22 Αυγούστου',
    time: '19:00 – 20:30',
    price: 12,
    spotsTaken: 6,
    spotsTotal: 15,
    description:
      'Yoga με θέα το ηλιοβασίλεμα στην παραλία Dasoudi.\n\nΉπια ροή για να κλείσεις την εβδομάδα, με μουσική και θάλασσα. Φέρε στρώμα ή πετσέτα.',
    gallery: ['#F3B6C8', '#FBE1E9', '#F5E6BE'],
    attendees: 6,
    announcements: [],
    faq: DEFAULT_FAQ,
    reviews: [{ id: 'r1', author: 'Άννα Μ.', rating: 5, comment: 'Μαγικό ηλιοβασίλεμα!' }],
    rating: 5,
    reviewCount: 18,
  },
];

export function findEventDetail(id: string): EventDetail | undefined {
  return events.find((event) => event.id === id);
}
