/**
 * Forum threads per community.
 *
 * Categories without hand-written content fall back to a generic set, so
 * every community opens with something to look at while the real data is
 * still mocked.
 */

export interface ForumThread {
  id: string;
  author: string;
  verified: boolean;
  timeAgo: string;
  title: string;
  excerpt: string;
  replies: number;
  likes: number;
  /** Location id, so the shared location filter applies here too. */
  location: string;
  pinned: boolean;
}

const threadsByCategory: Record<string, ForumThread[]> = {
  beauty: [
    {
      id: 'b1',
      author: 'Μαρία Λ.',
      verified: true,
      timeAgo: '3 ώρες πριν',
      title: 'Ποιο αντηλιακό προσώπου δεν αφήνει λευκά ίχνη;',
      excerpt:
        'Ψάχνω κάτι για καθημερινή χρήση κάτω από make-up. Έχω δοκιμάσει τρία και όλα αφήνουν γκρίζα απόχρωση.',
      replies: 24,
      likes: 61,
      location: 'athens',
      pinned: true,
    },
    {
      id: 'b2',
      author: 'Κατερίνα Ν.',
      verified: false,
      timeAgo: '1 μέρα πριν',
      title: 'Ρουτίνα για ευαίσθητη επιδερμίδα — τι δούλεψε τελικά',
      excerpt: 'Μετά από δύο χρόνια δοκιμών κατέληξα σε τέσσερα προϊόντα. Τα γράφω μήπως βοηθήσουν.',
      replies: 38,
      likes: 142,
      location: 'thessaloniki',
      pinned: false,
    },
    {
      id: 'b3',
      author: 'Δανάη Π.',
      verified: false,
      timeAgo: '2 μέρες πριν',
      title: 'Καλό κομμωτήριο για μπαλαγιάζ στη Λευκωσία;',
      excerpt: 'Μόλις μετακόμισα και ψάχνω κάποια που ξέρει να δουλεύει σκούρα μαλλιά.',
      replies: 0,
      likes: 9,
      location: 'nicosia',
      pinned: false,
    },
  ],
  travel: [
    {
      id: 't1',
      author: 'Ελένη Κ.',
      verified: false,
      timeAgo: '5 ώρες πριν',
      title: 'Σόλο ταξίδι σε νησί τον Σεπτέμβρη — προτάσεις;',
      excerpt: 'Θέλω κάτι ήσυχο αλλά όχι έρημο, με καλές πεζοπορίες. Πρώτη φορά ταξιδεύω μόνη μου.',
      replies: 47,
      likes: 203,
      location: 'athens',
      pinned: true,
    },
    {
      id: 't2',
      author: 'Χριστίνα Α.',
      verified: false,
      timeAgo: '3 μέρες πριν',
      title: 'Οδικώς από Λεμεσό σε Πάφο — αξιόλογες στάσεις',
      excerpt: 'Το κάναμε το Σαββατοκύριακο, σας γράφω τη διαδρομή με όλα τα μέρη που σταματήσαμε.',
      replies: 12,
      likes: 58,
      location: 'limassol',
      pinned: false,
    },
  ],
  relationships: [
    {
      id: 'r1',
      author: 'Ανώνυμη',
      verified: false,
      timeAgo: '1 ώρα πριν',
      title: 'Πώς ξέρεις ότι είναι ώρα να φύγεις;',
      excerpt: 'Έξι χρόνια μαζί. Δεν υπάρχει κάτι κακό, απλά δεν υπάρχει και τίποτα πια.',
      replies: 89,
      likes: 310,
      location: 'athens',
      pinned: true,
    },
    {
      id: 'r2',
      author: 'Σοφία Μ.',
      verified: false,
      timeAgo: '2 μέρες πριν',
      title: 'Φιλίες μετά τα 30 — γιατί είναι τόσο δύσκολο;',
      excerpt: 'Έχω δουλειά, σπίτι, σχέση. Αλλά να κάνω καινούργιες φίλες μου φαίνεται βουνό.',
      replies: 54,
      likes: 187,
      location: 'thessaloniki',
      pinned: false,
    },
  ],
  recipes: [
    {
      id: 'c1',
      author: 'Ζωή Μ.',
      verified: false,
      timeAgo: '4 ώρες πριν',
      title: 'Το μυστικό για αφράτη τυρόπιτα με χωριάτικο φύλλο',
      excerpt: 'Μου το έμαθε η γιαγιά μου και δεν το βρήκα πουθενά γραμμένο. Το μοιράζομαι.',
      replies: 31,
      likes: 176,
      location: 'thessaloniki',
      pinned: false,
    },
  ],
};

const fallbackThreads: ForumThread[] = [
  {
    id: 'g1',
    author: 'Άννα Μαρία',
    verified: true,
    timeAgo: '6 ώρες πριν',
    title: 'Ξεκινάμε! Συστηθείτε εδώ 👋',
    excerpt: 'Πείτε μας ποια είστε, από πού, και τι σας έφερε σε αυτή την κοινότητα.',
    replies: 42,
    likes: 118,
    location: 'athens',
    pinned: true,
  },
  {
    id: 'g2',
    author: 'Νίκη Σ.',
    verified: false,
    timeAgo: '1 μέρα πριν',
    title: 'Τι θα θέλατε να συζητάμε εδώ;',
    excerpt: 'Ας φτιάξουμε μαζί τα θέματα που αξίζουν. Γράψτε ιδέες.',
    replies: 0,
    likes: 27,
    location: 'limassol',
    pinned: false,
  },
];

export function threadsForCategory(categoryId: string): ForumThread[] {
  return threadsByCategory[categoryId] ?? fallbackThreads;
}

export type ForumSort = 'recent' | 'popular' | 'unanswered';

export const forumSortLabels: Record<ForumSort, string> = {
  recent: 'Πρόσφατα',
  popular: 'Δημοφιλή',
  unanswered: 'Αναπάντητα',
};

/**
 * Applies the sort filter. Pinned threads stay on top regardless, except
 * under "unanswered", where pinning would fight the filter's purpose.
 */
export function sortThreads(threads: ForumThread[], sort: ForumSort): ForumThread[] {
  if (sort === 'unanswered') {
    return threads.filter((thread) => thread.replies === 0);
  }

  const ordered =
    sort === 'popular' ? [...threads].sort((a, b) => b.likes - a.likes) : [...threads];

  return [...ordered].sort((a, b) => Number(b.pinned) - Number(a.pinned));
}
