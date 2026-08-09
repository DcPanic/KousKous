/**
 * Supabase auth errors are English and written for developers. These are
 * the ones a woman can actually hit, in words she can act on.
 */
export function greekAuthError(message: string): string {
  const text = message.toLowerCase();

  if (text.includes('invalid login credentials')) {
    return 'Λάθος email ή κωδικός.';
  }
  if (text.includes('email not confirmed')) {
    return 'Επιβεβαίωσε πρώτα το email σου — σου στείλαμε σύνδεσμο.';
  }
  if (text.includes('user already registered') || text.includes('already been registered')) {
    return 'Υπάρχει ήδη λογαριασμός με αυτό το email. Δοκίμασε σύνδεση.';
  }
  if (text.includes('password should be')) {
    return 'Ο κωδικός είναι πολύ αδύναμος. Βάλε τουλάχιστον 8 χαρακτήρες.';
  }
  if (text.includes('unable to validate email') || text.includes('invalid email')) {
    return 'Το email δεν φαίνεται σωστό.';
  }
  if (text.includes('rate limit') || text.includes('too many')) {
    return 'Πολλές προσπάθειες. Δοκίμασε ξανά σε λίγο.';
  }
  if (text.includes('network') || text.includes('fetch')) {
    return 'Δεν υπάρχει σύνδεση. Έλεγξε το internet σου.';
  }

  return 'Κάτι πήγε στραβά. Δοκίμασε ξανά.';
}
