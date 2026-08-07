import { daysUntilSaturday, isoDaysFromNow } from '@/lib/date';

/**
 * Placeholder content for the UI build.
 *
 * Everything here is replaced by Supabase queries later; the shapes stay
 * close to the domain entities so swapping the source is a local change.
 */

export interface MockStory {
  id: string;
  name: string;
  live: boolean;
}

export interface MockComment {
  author: string;
  text: string;
}

export interface MockPost {
  id: string;
  author: string;
  verified: boolean;
  location: string;
  locationLabel: string;
  timeAgo: string;
  caption: string;
  hashtags: string;
  mediaCount: number;
  likes: number;
  comments: number;
  shares: number;
  likedByLabel: string;
  commentPreviews: MockComment[];
  totalComments: number;
}

export interface MockForum {
  categoryId: string;
  posts: string;
}

export const stories: MockStory[] = [
  { id: 's1', name: 'Ελένη', live: false },
  { id: 's2', name: 'Μαρία', live: true },
  { id: 's3', name: 'Κατερίνα', live: false },
  { id: 's4', name: 'Σοφία', live: false },
  { id: 's5', name: 'Νίκη', live: false },
];

export const posts: MockPost[] = [
  {
    id: 'p1',
    author: 'Άννα Μαρία',
    verified: true,
    location: 'athens',
    locationLabel: 'Αθήνα, Ελλάδα',
    timeAgo: '2 ώρες πριν',
    caption:
      'Τέλειο Σαββατοκύριακο με τα κορίτσια μου! 💕\nSometimes all you need is good vibes & coffee ☕️✨',
    hashtags: '#weekend #girls #athens',
    mediaCount: 4,
    likes: 128,
    comments: 32,
    shares: 8,
    likedByLabel: 'Αρέσει στην Ελένη και 127 ακόμα',
    commentPreviews: [
      { author: 'Ελένη', text: 'Φαίνεστε υπέροχες! Πότε ξανά; 😍' },
      { author: 'Μαρία', text: 'Τέλειες! Θέλω κι εγώ την επόμενη φορά 😍' },
    ],
    totalComments: 30,
  },
  {
    id: 'p2',
    author: 'Ραφαέλα Κ.',
    verified: false,
    location: 'thessaloniki',
    locationLabel: 'Θεσσαλονίκη, Ελλάδα',
    timeAgo: '5 ώρες πριν',
    caption: 'Νέο αγαπημένο brunch spot στη Θεσσαλονίκη — και ο καφές τέλειος ☕️',
    hashtags: '#brunch #thessaloniki #foodie',
    mediaCount: 2,
    likes: 74,
    comments: 11,
    shares: 3,
    likedByLabel: 'Αρέσει στην Κατερίνα και 73 ακόμα',
    commentPreviews: [{ author: 'Κατερίνα', text: 'Πού είναι αυτό; 🙌' }],
    totalComments: 11,
  },
  {
    id: 'p3',
    author: 'Χριστίνα Α.',
    verified: false,
    location: 'limassol',
    locationLabel: 'Λεμεσός, Κύπρος',
    timeAgo: '1 μέρα πριν',
    caption: 'Ηλιοβασίλεμα στη Λεμεσό. Δεν το χορταίνω ποτέ 🌅',
    hashtags: '#limassol #cyprus #sunset',
    mediaCount: 1,
    likes: 203,
    comments: 24,
    shares: 12,
    likedByLabel: 'Αρέσει στην Άννα Μαρία και 202 ακόμα',
    commentPreviews: [{ author: 'Σοφία', text: 'Ονειρικό! 😍' }],
    totalComments: 24,
  },
];

export const forums: MockForum[] = [
  { categoryId: 'beauty', posts: '1.2k posts' },
  { categoryId: 'travel', posts: '890 posts' },
  { categoryId: 'home', posts: '540 posts' },
  { categoryId: 'relationships', posts: '2.1k posts' },
  { categoryId: 'fitness', posts: '760 posts' },
  { categoryId: 'recipes', posts: '1.5k posts' },
  { categoryId: 'moms', posts: '980 posts' },
  { categoryId: 'career', posts: '430 posts' },
];

export interface MockEvent {
  id: string;
  title: string;
  /** ISO date, so the date filter can compare properly. */
  isoDate: string;
  time: string;
  spotsTaken: number;
  spotsTotal: number;
  price: number;
  /** Place id — the most specific one the event belongs to. */
  location: string;
  categoryId: string;
  isOfficial: boolean;
}

/**
 * Dates are generated relative to today so the "Σήμερα" and
 * "Σαββατοκύριακο" filters always have something to match in the preview.
 * Real events will carry fixed dates from the database.
 */
export const events: MockEvent[] = [
  {
    id: 'e1',
    title: 'Wine Night στο Κολωνάκι',
    isoDate: isoDaysFromNow(daysUntilSaturday()),
    time: '20:00',
    spotsTaken: 18,
    spotsTotal: 30,
    price: 25,
    location: 'kolonaki',
    categoryId: 'drinks',
    isOfficial: false,
  },
  {
    id: 'e2',
    title: 'Πρωινή Yoga στη Βουλιαγμένη',
    isoDate: isoDaysFromNow(daysUntilSaturday() + 1),
    time: '08:30',
    spotsTaken: 18,
    spotsTotal: 24,
    price: 15,
    location: 'vouliagmeni',
    categoryId: 'wellness',
    isOfficial: false,
  },
  {
    id: 'e3',
    title: 'Brunch & Networking',
    isoDate: isoDaysFromNow(9),
    time: '11:00',
    spotsTaken: 12,
    spotsTotal: 32,
    price: 0,
    location: 'thessaloniki',
    categoryId: 'networking',
    isOfficial: true,
  },
  {
    id: 'e4',
    title: 'Sunset Yoga στη Λεμεσό',
    isoDate: isoDaysFromNow(15),
    time: '19:00',
    spotsTaken: 6,
    spotsTotal: 15,
    price: 12,
    location: 'limassol',
    categoryId: 'wellness',
    isOfficial: false,
  },
  {
    id: 'e5',
    title: 'Καφές γνωριμίας στο Κολωνάκι',
    isoDate: isoDaysFromNow(0),
    time: '18:30',
    spotsTaken: 7,
    spotsTotal: 12,
    price: 0,
    location: 'kolonaki',
    categoryId: 'food',
    isOfficial: false,
  },
  {
    id: 'e6',
    title: 'Ημερήσια εκδρομή στη Χαλκιδική',
    isoDate: isoDaysFromNow(1),
    time: '07:30',
    spotsTaken: 22,
    spotsTotal: 22,
    price: 45,
    location: 'halkidiki',
    categoryId: 'trip',
    isOfficial: true,
  },
  {
    id: 'e7',
    title: 'Beach day στην Αγία Νάπα',
    isoDate: isoDaysFromNow(daysUntilSaturday()),
    time: '11:00',
    spotsTaken: 9,
    spotsTotal: 40,
    price: 10,
    location: 'ayia-napa',
    categoryId: 'beach',
    isOfficial: false,
  },
  {
    id: 'e8',
    title: 'Κεραμική για αρχάριες',
    isoDate: isoDaysFromNow(4),
    time: '17:00',
    spotsTaken: 5,
    spotsTotal: 10,
    price: 28,
    location: 'chania',
    categoryId: 'workshop',
    isOfficial: false,
  },
  {
    id: 'e9',
    title: 'Πεζοπορία στο φαράγγι',
    isoDate: isoDaysFromNow(21),
    time: '09:00',
    spotsTaken: 4,
    spotsTotal: 18,
    price: 0,
    location: 'ioannina',
    categoryId: 'nature',
    isOfficial: false,
  },
];

/** Placeholder tiles for the profile photo grid. */
export const profileGridColors = [
  '#FBE1E9',
  '#F5E6BE',
  '#E7C9D3',
  '#EADFF0',
  '#F0E4D8',
  '#F3B6C8',
  '#FBE1E9',
  '#C9A227',
  '#E7C9D3',
];

export const profileStats: [string, string][] = [
  ['48', 'Posts'],
  ['312', 'Φίλες'],
  ['0', 'Events'],
];
