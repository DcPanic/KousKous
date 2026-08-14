/**
 * Forum categories (master prompt §4).
 *
 * There are deliberately no per-city forums — a single set of categories
 * is combined with the separate location filter (see `locations.ts`).
 */

export type CategoryGroup = 'lifestyle' | 'life_relationships' | 'travel';

export interface Category {
  id: string;
  /** Display name, shown to users in Greek. */
  name: string;
  emoji: string;
  group: CategoryGroup;
}

export const categoryGroupLabels: Record<CategoryGroup, string> = {
  lifestyle: 'Lifestyle & Ενδιαφέροντα',
  life_relationships: 'Ζωή & Σχέσεις',
  travel: 'Ταξίδι',
};

/** Order matters — the drawer menu renders groups in this sequence. */
export const categoryGroupOrder: CategoryGroup[] = [
  'lifestyle',
  'life_relationships',
  'travel',
];

export const categories: Category[] = [
  { id: 'beauty', name: 'Beauty', emoji: '💄', group: 'lifestyle' },
  { id: 'fashion', name: 'Fashion', emoji: '👗', group: 'lifestyle' },
  { id: 'fitness', name: 'Fitness', emoji: '🏋️', group: 'lifestyle' },
  { id: 'recipes', name: 'Συνταγές', emoji: '🍳', group: 'lifestyle' },
  { id: 'home', name: 'Home', emoji: '🏡', group: 'lifestyle' },
  { id: 'books', name: 'Books', emoji: '📚', group: 'lifestyle' },
  { id: 'movies', name: 'Movies', emoji: '🎬', group: 'lifestyle' },
  { id: 'gaming', name: 'Gaming', emoji: '🎮', group: 'lifestyle' },

  { id: 'relationships', name: 'Σχέσεις', emoji: '❤️', group: 'life_relationships' },
  { id: 'moms', name: 'Moms', emoji: '👶', group: 'life_relationships' },
  { id: 'students', name: 'Students', emoji: '🎓', group: 'life_relationships' },
  { id: 'career', name: 'Career', emoji: '💼', group: 'life_relationships' },
  { id: 'pets', name: 'Pets', emoji: '🐶', group: 'life_relationships' },

  { id: 'travel', name: 'Travel', emoji: '✈️', group: 'travel' },
];

/**
 * Subcategories.
 *
 * The 14 categories above are the forums and stay as they are (§4); these
 * only narrow a post, an event or an interest. Keeping them out of the
 * forum list means the community structure does not fragment into
 * dozens of half-empty rooms.
 */
export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
}

const SUBCATEGORY_NAMES: Record<string, string[]> = {
  beauty: [
    'Περιποίηση προσώπου',
    'Μακιγιάζ',
    'Μαλλιά',
    'Νύχια',
    'Αντηλιακά',
    'Αρώματα',
    'Αισθητικός & θεραπείες',
  ],
  fashion: [
    'Καθημερινό στιλ',
    'Βραδινά',
    'Παπούτσια',
    'Τσάντες',
    'Κοσμήματα',
    'Second-hand & vintage',
    'Νυφικά',
  ],
  fitness: ['Γυμναστήριο', 'Pilates', 'Yoga', 'Τρέξιμο', 'Χορός', 'Διατροφή', 'Κολύμβηση'],
  recipes: [
    'Γλυκά & ζαχαροπλαστική',
    'Ζυμαρικά',
    'Σαλάτες',
    'Vegan & χορτοφαγικά',
    'Ψήσιμο & ψωμί',
    'Γρήγορα γεύματα',
    'Παραδοσιακά',
  ],
  home: ['Διακόσμηση', 'Καθαριότητα & οργάνωση', 'Φυτά', 'DIY', 'Μετακόμιση', 'Ανακαίνιση'],
  books: [
    'Μυθιστόρημα',
    'Αστυνομικό & θρίλερ',
    'Ψυχολογία & αυτοβελτίωση',
    'Ελληνική λογοτεχνία',
    'Ποίηση',
    'Book club',
  ],
  movies: ['Σειρές', 'Ταινίες', 'Ντοκιμαντέρ', 'Ελληνικά', 'Έξοδος στο σινεμά'],
  gaming: ['Mobile games', 'Κονσόλες', 'PC', 'Επιτραπέζια'],

  relationships: [
    'Γνωριμίες & ραντεβού',
    'Σχέση & συμβίωση',
    'Γάμος',
    'Χωρισμός',
    'Φιλίες',
    'Οικογένεια',
  ],
  moms: [
    'Εγκυμοσύνη',
    'Γέννα',
    'Βρέφη 0-2',
    'Νηπιαγωγείο',
    'Σχολείο',
    'Εφηβεία',
    'Μαμά & καριέρα',
    'Μόνη μαμά',
  ],
  students: [
    'Πανεπιστήμιο',
    'Εξετάσεις',
    'Φοιτητική ζωή',
    'Erasmus',
    'Φοιτητικό σπίτι',
    'Μεταπτυχιακά',
  ],
  career: [
    'Αναζήτηση εργασίας',
    'Επιχειρηματικότητα',
    'Freelance',
    'Μισθοί & διαπραγμάτευση',
    'Ισορροπία ζωής',
    'Αλλαγή καριέρας',
  ],
  pets: ['Σκύλοι', 'Γάτες', 'Υιοθεσία', 'Κτηνίατρος & υγεία', 'Εκπαίδευση'],

  travel: [
    'Ελλάδα',
    'Κύπρος',
    'Εξωτερικό',
    'Νησιά',
    'Σόλο ταξίδι',
    'Οδικά ταξίδια',
    'Οικονομικά ταξίδια',
    'City break',
  ],
};

/** Ids are derived so the list stays a single source of truth. */
export const subcategories: Subcategory[] = Object.entries(SUBCATEGORY_NAMES).flatMap(
  ([categoryId, names]) =>
    names.map((name, index) => ({
      id: `${categoryId}-${index + 1}`,
      categoryId,
      name,
    })),
);

export function subcategoriesFor(categoryId: string): Subcategory[] {
  return subcategories.filter((subcategory) => subcategory.categoryId === categoryId);
}

export function findSubcategory(id: string): Subcategory | undefined {
  return subcategories.find((subcategory) => subcategory.id === id);
}

export function categoriesByGroup(group: CategoryGroup): Category[] {
  return categories.filter((category) => category.group === group);
}

export function findCategory(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}
