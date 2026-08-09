/**
 * Public profiles of other members (spec §7 screen 3).
 *
 * Posts, threads and conversations reference women by display name, so
 * the directory is keyed by a slug derived from that name. Once Supabase
 * exists these become user rows and the slug becomes the user id.
 */

import { normalizeForSearch } from '@kouskous/shared';

export interface Person {
  id: string;
  name: string;
  verified: boolean;
  /** Place id from the shared locations list. */
  location: string;
  bio: string;
  /** Whether she is an approved Premium Host. */
  host: boolean;
  posts: number;
  followers: string;
  following: string;
  joined: string;
  /** Interests, shown as chips. Ids from the shared categories list. */
  interests: string[];
  /** Flat tints standing in for her grid until media storage exists. */
  grid: string[];
}

const GRID_A = ['#FBE1E9', '#F5E6BE', '#EADFF0', '#DCEAF5', '#F0E4D8', '#E4F0E8'];
const GRID_B = ['#EADFF0', '#DCEAF5', '#FBE1E9', '#E4F0E8', '#F5E6BE', '#F0E4D8'];

export const people: Person[] = [
  {
    id: 'eleni-k',
    name: 'Ελένη Κ.',
    verified: false,
    location: 'athens',
    bio: 'Αθήνα · φωτογραφία, θάλασσα και πολύ καφέ ☕',
    host: false,
    posts: 34,
    followers: '1.2k',
    following: '312',
    joined: 'Μάρτιος 2026',
    interests: ['beauty', 'travel', 'books'],
    grid: GRID_A,
  },
  {
    id: 'maria-p',
    name: 'Μαρία Π.',
    verified: true,
    location: 'thessaloniki',
    bio: 'Θεσσαλονίκη · brunch hunter, βιβλιοφάγος, mama of two 👶',
    host: false,
    posts: 128,
    followers: '4.8k',
    following: '540',
    joined: 'Ιανουάριος 2026',
    interests: ['recipes', 'moms', 'books'],
    grid: GRID_B,
  },
  {
    id: 'natasa-ioannou',
    name: 'Νατάσα Ιωάννου',
    verified: true,
    location: 'athens',
    bio: 'Διοργανώνω yoga retreats και πρωινές παρέες στην Αθήνα 🧘',
    host: true,
    posts: 76,
    followers: '9.1k',
    following: '208',
    joined: 'Νοέμβριος 2025',
    interests: ['fitness', 'travel', 'relationships'],
    grid: GRID_A,
  },
  {
    id: 'anna-maria',
    name: 'Άννα Μαρία',
    verified: true,
    location: 'athens',
    bio: 'Πάντα έτοιμη για ταξίδι της τελευταίας στιγμής ✈️',
    host: false,
    posts: 212,
    followers: '12.4k',
    following: '389',
    joined: 'Οκτώβριος 2025',
    interests: ['travel', 'fashion', 'movies'],
    grid: GRID_B,
  },
  {
    id: 'rafaela-k',
    name: 'Ραφαέλα Κ.',
    verified: false,
    location: 'limassol',
    bio: 'Λεμεσός · skincare, ήλιος και κυριακάτικα brunch 🌞',
    host: false,
    posts: 58,
    followers: '2.3k',
    following: '412',
    joined: 'Φεβρουάριος 2026',
    interests: ['beauty', 'recipes', 'home'],
    grid: GRID_A,
  },
  {
    id: 'christina-a',
    name: 'Χριστίνα Α.',
    verified: false,
    location: 'chania',
    bio: 'Χανιά · πεζοπορία, φύση και σπιτικά γλυκά 🥾',
    host: false,
    posts: 41,
    followers: '890',
    following: '265',
    joined: 'Απρίλιος 2026',
    interests: ['recipes', 'pets', 'fitness'],
    grid: GRID_B,
  },
  {
    id: 'maria-l',
    name: 'Μαρία Λ.',
    verified: true,
    location: 'athens',
    bio: 'Beauty editor. Δοκιμάζω τα πάντα ώστε να μη χρειάζεται εσύ 💄',
    host: false,
    posts: 305,
    followers: '18.7k',
    following: '146',
    joined: 'Σεπτέμβριος 2025',
    interests: ['beauty', 'fashion', 'career'],
    grid: GRID_A,
  },
];

export function findPerson(id: string): Person | undefined {
  return people.find((person) => person.id === id);
}

/**
 * Resolve a display name to a profile. Names are compared accent- and
 * case-insensitively so «Ελένη Κ.» matches however it was typed.
 */
export function findPersonByName(name: string): Person | undefined {
  const wanted = normalizeForSearch(name);
  return people.find((person) => normalizeForSearch(person.name) === wanted);
}
