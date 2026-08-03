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

export function categoriesByGroup(group: CategoryGroup): Category[] {
  return categories.filter((category) => category.group === group);
}

export function findCategory(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}
