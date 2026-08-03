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

export interface MockEvent {
  id: string;
  title: string;
  date: string;
  spots: string;
  location: string;
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

export const events: MockEvent[] = [
  {
    id: 'e1',
    title: 'Wine Night στο Κολωνάκι',
    date: 'Σάβ 9 Αυγ · 20:00',
    spots: '12 θέσεις',
    location: 'athens',
  },
  {
    id: 'e2',
    title: 'Πρωινή Yoga στη Βουλιαγμένη',
    date: 'Κυρ 10 Αυγ · 08:30',
    spots: '6 θέσεις',
    location: 'athens',
  },
  {
    id: 'e3',
    title: 'Brunch & Networking',
    date: 'Σάβ 16 Αυγ · 11:00',
    spots: '20 θέσεις',
    location: 'thessaloniki',
  },
  {
    id: 'e4',
    title: 'Sunset Yoga στη Λεμεσό',
    date: 'Παρ 22 Αυγ · 19:00',
    spots: '9 θέσεις',
    location: 'limassol',
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
