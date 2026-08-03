import { BadgeCheck, TrendingUp, UserPlus, Users } from 'lucide-react';
import { colors } from '@kouskous/shared';
import { platformStats } from '../data/mock';

const STAT_TINTS = [colors.pink, colors.success, colors.hostPurple, colors.gold];
const STAT_ICONS = [Users, UserPlus, TrendingUp, BadgeCheck];

export function OverviewPage() {
  return (
    <>
      <h1 className="page-title">Επισκόπηση</h1>
      <p className="page-subtitle">Κατάσταση πλατφόρμας — Ελλάδα &amp; Κύπρος</p>

      <div className="stat-grid">
        {platformStats.map((stat, index) => {
          const Icon = STAT_ICONS[index];
          const tint = STAT_TINTS[index];
          return (
            <div key={stat.label} className="card">
              <div className="icon-chip" style={{ background: `${tint}1A` }}>
                <Icon size={16} color={tint} />
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="section-title">Σημείωση</div>
      <div className="card">
        <p style={{ fontSize: 13, lineHeight: 1.65, color: colors.textSecondary }}>
          Τα νούμερα είναι placeholder. Θα αντικατασταθούν με πραγματικά queries μόλις συνδεθεί το
          Supabase. Η διαχείριση χρημάτων events δεν περνά από το KousKous — οι πληρωμές εισιτηρίων
          κατευθύνονται απευθείας στις διοργανώτριες μέσω του marketplace provider.
        </p>
      </div>
    </>
  );
}
