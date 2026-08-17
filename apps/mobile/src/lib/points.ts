import { supabase } from '@/lib/supabase';

/**
 * Her points balance.
 *
 * `profiles.points` is the running total the triggers keep; point_entries
 * is the ledger that explains it. Reading the column is one lookup rather
 * than a sum over the whole history.
 */
export async function fetchMyPoints(profileId: string): Promise<number> {
  const { data } = await supabase.from('profiles').select('points').eq('id', profileId).maybeSingle();

  return data?.points ?? 0;
}
