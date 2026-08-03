import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import {
  BadgeCheck,
  CalendarDays,
  LayoutDashboard,
  ShieldAlert,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { OverviewPage } from './pages/overview';
import { HostApprovalsPage } from './pages/host-approvals';
import { PlaceholderPage } from './pages/placeholder';

interface NavEntry {
  to: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Platform administration lives here rather than in the mobile app
 * (spec §2.4): host approvals, moderation, users and finance.
 */
const NAV: NavEntry[] = [
  { to: '/', label: 'Επισκόπηση', icon: LayoutDashboard },
  { to: '/hosts', label: 'Αιτήσεις Host', icon: BadgeCheck },
  { to: '/users', label: 'Χρήστριες', icon: Users },
  { to: '/moderation', label: 'Moderation', icon: ShieldAlert },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/finance', label: 'Οικονομικά', icon: Wallet },
];

export function App() {
  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo">KousKous</div>
        <div className="logo-sub">Admin Panel</div>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Icon size={17} strokeWidth={1.9} />
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="content">
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/hosts" element={<HostApprovalsPage />} />
          <Route
            path="/users"
            element={
              <PlaceholderPage
                title="Χρήστριες"
                subtitle="Αναζήτηση, ρόλοι, αναστολές λογαριασμών"
                body="Συνδέεται με τον πίνακα users μόλις στηθεί το Supabase schema."
              />
            }
          />
          <Route
            path="/moderation"
            element={
              <PlaceholderPage
                title="Moderation"
                subtitle="Αναφορές σε posts, σχόλια και προφίλ"
                body="Η ουρά αναφορών ενεργοποιείται μαζί με τα forums."
              />
            }
          />
          <Route
            path="/events"
            element={
              <PlaceholderPage
                title="Events"
                subtitle="Όλα τα events της πλατφόρμας"
                body="Περιλαμβάνει official events και events διοργανωτριών."
              />
            }
          />
          <Route
            path="/finance"
            element={
              <PlaceholderPage
                title="Οικονομικά"
                subtitle="Συνδρομές και ροή πληρωμών εισιτηρίων"
                body="Τα έσοδα εισιτηρίων πηγαίνουν απευθείας στις διοργανώτριες — εδώ φαίνονται μόνο αναφορές, όχι υπόλοιπα."
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
