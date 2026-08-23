/**
 * Forum threads per community.
 *
 * Categories without hand-written content fall back to a generic set, so
 * every community opens with something to look at while the real data is
 * still mocked.
 */

/** Placeholder attachment. `uri` is set once a real file is picked. */
export interface Attachment {
  id: string;
  kind: 'image' | 'video';
  /** Local file URI from the picker, absent for seeded placeholders. */
  uri?: string;
  /** Tint used to stand in for a photo that has no file yet. */
  tint?: string;
}

export interface ForumReply {
  id: string;
  /** Set on database rows; absent on seeded content. */
  authorId?: string;
  author: string;
  verified: boolean;
  timeAgo: string;
  body: string;
  likes: number;
  attachments: Attachment[];
}

export interface ForumThread {
  id: string;
  categoryId: string;
  /** Set on database rows; absent on seeded content. */
  authorId?: string;
  author: string;
  verified: boolean;
  timeAgo: string;
  title: string;
  excerpt: string;
  /** Full opening post, shown on the thread screen. */
  body: string;
  attachments: Attachment[];
  replies: ForumReply[];
  /**
   * How many replies exist, which is not always how many are loaded: the
   * forum list asks the database for the number only and fetches the
   * replies themselves when the thread is opened.
   */
  replyCount?: number;
  likes: number;
  /** Location id, so the shared location filter applies here too. */
  location: string;
  pinned: boolean;
}

/** Replies loaded, or the count the list was given. */
export function replyCountOf(thread: ForumThread): number {
  return thread.replyCount ?? thread.replies.length;
}

const seededThreads: ForumThread[] = [
  {
    id: 'b1',
    categoryId: 'beauty',
    author: 'Μαρία Λ.',
    verified: true,
    timeAgo: '3 ώρες πριν',
    title: 'Ποιο αντηλιακό προσώπου δεν αφήνει λευκά ίχνη;',
    excerpt: 'Ψάχνω κάτι για καθημερινή χρήση κάτω από make-up.',
    body: 'Ψάχνω κάτι για καθημερινή χρήση κάτω από make-up. Έχω δοκιμάσει τρία και όλα αφήνουν γκρίζα απόχρωση στο δέρμα μου.\n\nΒάζω φωτογραφία για να δείτε τι εννοώ — αριστερά χωρίς, δεξιά με το αντηλιακό.',
    attachments: [{ id: 'b1a', kind: 'image', tint: '#FBE1E9' }],
    likes: 61,
    location: 'athens',
    pinned: true,
    replies: [
      {
        id: 'b1r1',
        author: 'Κατερίνα Ν.',
        verified: false,
        timeAgo: '2 ώρες πριν',
        body: 'Δοκίμασε κάποιο με χημικά φίλτρα αντί για φυσικά — τα φυσικά (ψευδάργυρος, τιτάνιο) είναι που αφήνουν λευκό.',
        likes: 34,
        attachments: [],
      },
      {
        id: 'b1r2',
        author: 'Ζωή Μ.',
        verified: false,
        timeAgo: '1 ώρα πριν',
        body: 'Αυτό χρησιμοποιώ εγώ εδώ και έναν χρόνο, μηδέν ίχνη ακόμα και σε σκούρο δέρμα.',
        likes: 52,
        attachments: [{ id: 'b1r2a', kind: 'image', tint: '#F5E6BE' }],
      },
      {
        id: 'b1r3',
        author: 'Δανάη Π.',
        verified: false,
        timeAgo: '40 λεπτά πριν',
        body: 'Ευχαριστώ και τις δύο! Παραγγέλνω σήμερα.',
        likes: 8,
        attachments: [],
      },
    ],
  },
  {
    id: 'b2',
    categoryId: 'beauty',
    author: 'Κατερίνα Ν.',
    verified: false,
    timeAgo: '1 μέρα πριν',
    title: 'Ρουτίνα για ευαίσθητη επιδερμίδα — τι δούλεψε τελικά',
    excerpt: 'Μετά από δύο χρόνια δοκιμών κατέληξα σε τέσσερα προϊόντα.',
    body: 'Μετά από δύο χρόνια δοκιμών κατέληξα σε τέσσερα προϊόντα. Τα γράφω μήπως βοηθήσουν κάποια άλλη που παλεύει με το ίδιο.\n\nΚαθαριστικό χωρίς άρωμα, ενυδατική με κεραμίδια, αντηλιακό, και τίποτα άλλο. Όσο λιγότερα, τόσο καλύτερα.',
    attachments: [{ id: 'b2a', kind: 'image', tint: '#EADFF0' }],
    likes: 142,
    location: 'thessaloniki',
    pinned: false,
    replies: [
      {
        id: 'b2r1',
        author: 'Νίκη Σ.',
        verified: false,
        timeAgo: '20 ώρες πριν',
        body: 'Το «όσο λιγότερα τόσο καλύτερα» είναι η καλύτερη συμβουλή που έχω διαβάσει εδώ μέσα.',
        likes: 41,
        attachments: [],
      },
    ],
  },
  {
    id: 'b3',
    categoryId: 'beauty',
    author: 'Δανάη Π.',
    verified: false,
    timeAgo: '2 μέρες πριν',
    title: 'Καλό κομμωτήριο για μπαλαγιάζ στη Λευκωσία;',
    excerpt: 'Μόλις μετακόμισα και ψάχνω κάποια που ξέρει να δουλεύει σκούρα μαλλιά.',
    body: 'Μόλις μετακόμισα και ψάχνω κάποια που ξέρει να δουλεύει σκούρα μαλλιά. Δέχομαι προτάσεις!',
    attachments: [],
    likes: 9,
    location: 'nicosia',
    pinned: false,
    replies: [],
  },
  {
    id: 't1',
    categoryId: 'travel',
    author: 'Ελένη Κ.',
    verified: false,
    timeAgo: '5 ώρες πριν',
    title: 'Σόλο ταξίδι σε νησί τον Σεπτέμβρη — προτάσεις;',
    excerpt: 'Θέλω κάτι ήσυχο αλλά όχι έρημο, με καλές πεζοπορίες.',
    body: 'Θέλω κάτι ήσυχο αλλά όχι έρημο, με καλές πεζοπορίες. Πρώτη φορά ταξιδεύω μόνη μου και είμαι λίγο αγχωμένη, οπότε προτιμώ κάπου με κόσμο τριγύρω.',
    attachments: [{ id: 't1a', kind: 'image', tint: '#E7C9D3' }],
    likes: 203,
    location: 'athens',
    pinned: true,
    replies: [
      {
        id: 't1r1',
        author: 'Χριστίνα Α.',
        verified: false,
        timeAgo: '3 ώρες πριν',
        body: 'Πήγα πέρσι μόνη μου τον Σεπτέμβρη και ήταν η καλύτερη απόφαση της χρονιάς. Βάζω βίντεο από το μονοπάτι.',
        likes: 88,
        attachments: [{ id: 't1r1a', kind: 'video', tint: '#F0E4D8' }],
      },
    ],
  },
  {
    id: 't2',
    categoryId: 'travel',
    author: 'Χριστίνα Α.',
    verified: false,
    timeAgo: '3 μέρες πριν',
    title: 'Οδικώς από Λεμεσό σε Πάφο — αξιόλογες στάσεις',
    excerpt: 'Το κάναμε το Σαββατοκύριακο, σας γράφω τη διαδρομή.',
    body: 'Το κάναμε το Σαββατοκύριακο, σας γράφω τη διαδρομή με όλα τα μέρη που σταματήσαμε. Συνολικά τρεις ώρες με τις στάσεις.',
    attachments: [],
    likes: 58,
    location: 'limassol',
    pinned: false,
    replies: [],
  },
  {
    id: 'r1',
    categoryId: 'relationships',
    author: 'Ανώνυμη',
    verified: false,
    timeAgo: '1 ώρα πριν',
    title: 'Πώς ξέρεις ότι είναι ώρα να φύγεις;',
    excerpt: 'Έξι χρόνια μαζί. Δεν υπάρχει κάτι κακό, απλά δεν υπάρχει και τίποτα πια.',
    body: 'Έξι χρόνια μαζί. Δεν υπάρχει κάτι κακό — δεν με πληγώνει, δεν τσακωνόμαστε. Απλά δεν υπάρχει και τίποτα πια.\n\nΠώς το καταλάβατε εσείς;',
    attachments: [],
    likes: 310,
    location: 'athens',
    pinned: true,
    replies: [
      {
        id: 'r1r1',
        author: 'Σοφία Μ.',
        verified: false,
        timeAgo: '45 λεπτά πριν',
        body: 'Όταν άρχισα να σχεδιάζω το μέλλον μου και δεν τον έβαζα μέσα χωρίς να το σκεφτώ.',
        likes: 156,
        attachments: [],
      },
    ],
  },
  {
    id: 'c1',
    categoryId: 'recipes',
    author: 'Ζωή Μ.',
    verified: false,
    timeAgo: '4 ώρες πριν',
    title: 'Το μυστικό για αφράτη τυρόπιτα με χωριάτικο φύλλο',
    excerpt: 'Μου το έμαθε η γιαγιά μου και δεν το βρήκα πουθενά γραμμένο.',
    body: 'Μου το έμαθε η γιαγιά μου και δεν το βρήκα πουθενά γραμμένο. Το μυστικό είναι λίγο ανθρακούχο νερό στο μείγμα και ξεκούραση μισή ώρα.',
    attachments: [{ id: 'c1a', kind: 'image', tint: '#F0E4D8' }],
    likes: 176,
    location: 'thessaloniki',
    pinned: false,
    replies: [],
  },
];

/** Used by communities that have no hand-written threads yet. */
function fallbackThreads(categoryId: string): ForumThread[] {
  return [
    {
      id: `${categoryId}-g1`,
      categoryId,
      author: 'Άννα Μαρία',
      verified: true,
      timeAgo: '6 ώρες πριν',
      title: 'Ξεκινάμε! Συστηθείτε εδώ 👋',
      excerpt: 'Πείτε μας ποια είστε, από πού, και τι σας έφερε εδώ.',
      body: 'Πείτε μας ποια είστε, από πού, και τι σας έφερε σε αυτή την κοινότητα. Καλωσορίσατε!',
      attachments: [],
      likes: 118,
      location: 'athens',
      pinned: true,
      replies: [],
    },
    {
      id: `${categoryId}-g2`,
      categoryId,
      author: 'Νίκη Σ.',
      verified: false,
      timeAgo: '1 μέρα πριν',
      title: 'Τι θα θέλατε να συζητάμε εδώ;',
      excerpt: 'Ας φτιάξουμε μαζί τα θέματα που αξίζουν.',
      body: 'Ας φτιάξουμε μαζί τα θέματα που αξίζουν. Γράψτε ιδέες και τις καρφιτσώνουμε.',
      attachments: [],
      likes: 27,
      location: 'limassol',
      pinned: false,
      replies: [],
    },
  ];
}

const fallbackCache = new Map<string, ForumThread[]>();

export function threadsForCategory(categoryId: string): ForumThread[] {
  const seeded = seededThreads.filter((thread) => thread.categoryId === categoryId);
  if (seeded.length > 0) return seeded;

  // Cached so the generated ids stay stable between renders.
  if (!fallbackCache.has(categoryId)) {
    fallbackCache.set(categoryId, fallbackThreads(categoryId));
  }
  return fallbackCache.get(categoryId) as ForumThread[];
}

export function findThread(threadId: string): ForumThread | undefined {
  const seeded = seededThreads.find((thread) => thread.id === threadId);
  if (seeded) return seeded;

  for (const threads of fallbackCache.values()) {
    const match = threads.find((thread) => thread.id === threadId);
    if (match) return match;
  }

  // A saved thread can be opened before its community has been visited,
  // so the fallback set is generated on demand from the id prefix.
  const categoryId = threadId.replace(/-g\d+$/, '');
  if (categoryId !== threadId) {
    return threadsForCategory(categoryId).find((thread) => thread.id === threadId);
  }
  return undefined;
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
    return threads.filter((thread) => replyCountOf(thread) === 0);
  }

  const ordered =
    sort === 'popular' ? [...threads].sort((a, b) => b.likes - a.likes) : [...threads];

  return [...ordered].sort((a, b) => Number(b.pinned) - Number(a.pinned));
}
