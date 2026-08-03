import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, Star, Ticket, Wallet } from 'lucide-react-native';
import { canCreatePaidEvents, colors, can } from '@kouskous/shared';
import { useSession } from '@/state/session';
import {
  DashboardHeader,
  DashboardTabBar,
  dashboardStyles,
  type DashboardTab,
} from '@/components/dashboard/dashboard-chrome';
import {
  HostEventsTab,
  HostOverviewTab,
  HostPaymentsTab,
  HostReviewsTab,
} from '@/features/host-dashboard';
import { PlaceholderScreen } from '@/components/placeholder-screen';

type HostTab = 'overview' | 'events' | 'payments' | 'reviews';

const TABS: DashboardTab<HostTab>[] = [
  { key: 'overview', label: 'Επισκόπηση', icon: BarChart3 },
  { key: 'events', label: 'Events', icon: Ticket },
  { key: 'payments', label: 'Πληρωμές', icon: Wallet },
  { key: 'reviews', label: 'Reviews', icon: Star },
];

export default function HostDashboardScreen() {
  const { user } = useSession();
  const [tab, setTab] = useState<HostTab>('overview');
  // Real verification arrives via the provider webhook; until that exists
  // the onboarding button flips this locally so the flow can be reviewed.
  const [paymentConnected, setPaymentConnected] = useState(() => canCreatePaidEvents(user));

  // Reachable by direct link, so the gate is enforced here too and not
  // only by hiding the drawer entry.
  if (!can(user, 'host_dashboard')) {
    return (
      <PlaceholderScreen
        title="Dashboard Διοργανώτριας"
        subtitle="Χωρίς πρόσβαση"
        body="Το dashboard είναι διαθέσιμο μόνο σε εγκεκριμένες διοργανώτριες."
      />
    );
  }

  return (
    <SafeAreaView style={dashboardStyles.screen} edges={['top']}>
      <DashboardHeader title="Dashboard Διοργανώτριας" subtitle={user.name} />

      <View style={dashboardStyles.screen}>
        {tab === 'overview' ? <HostOverviewTab paymentVerified={paymentConnected} /> : null}
        {tab === 'events' ? <HostEventsTab /> : null}
        {tab === 'payments' ? (
          <HostPaymentsTab paymentVerified={paymentConnected} onConnect={() => setPaymentConnected(true)} />
        ) : null}
        {tab === 'reviews' ? <HostReviewsTab /> : null}
      </View>

      <DashboardTabBar tabs={TABS} value={tab} onChange={setTab} accent={colors.hostPurple} />
    </SafeAreaView>
  );
}
