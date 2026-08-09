import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, Megaphone, Ticket, Trophy } from 'lucide-react-native';
import { can, colors } from '@kouskous/shared';
import { useSession } from '@/state/session';
import {
  DashboardHeader,
  DashboardTabBar,
  dashboardStyles,
  type DashboardTab,
} from '@/components/dashboard/dashboard-chrome';
import {
  OfficialAnnouncementsTab,
  OfficialEventsTab,
  OfficialOverviewTab,
  OfficialRewardsTab,
} from '@/features/official-dashboard';
import { PlaceholderScreen } from '@/components/placeholder-screen';

type OfficialTab = 'overview' | 'events' | 'rewards' | 'announcements';

const TABS: DashboardTab<OfficialTab>[] = [
  { key: 'overview', label: 'Επισκόπηση', icon: BarChart3 },
  { key: 'events', label: 'Events', icon: Ticket },
  { key: 'rewards', label: 'Rewards', icon: Trophy },
  { key: 'announcements', label: 'Ανακοινώσεις', icon: Megaphone },
];

export default function OfficialDashboardScreen() {
  const { user } = useSession();
  const [tab, setTab] = useState<OfficialTab>('overview');

  if (!can(user, 'official_dashboard')) {
    return (
      <PlaceholderScreen
        title="Official Dashboard"
        subtitle="Χωρίς πρόσβαση"
        body="Το dashboard είναι διαθέσιμο μόνο στον επίσημο λογαριασμό KousKous."
      />
    );
  }

  return (
    <SafeAreaView style={dashboardStyles.screen} edges={['top']}>
      <DashboardHeader title="Official Dashboard" subtitle="KousKous" />

      <View style={dashboardStyles.screen}>
        {tab === 'overview' ? <OfficialOverviewTab onGoToTab={setTab} /> : null}
        {tab === 'events' ? <OfficialEventsTab /> : null}
        {tab === 'rewards' ? <OfficialRewardsTab /> : null}
        {tab === 'announcements' ? <OfficialAnnouncementsTab /> : null}
      </View>

      {/* Gold marks the Official account, matching its profile badge. */}
      <DashboardTabBar tabs={TABS} value={tab} onChange={setTab} accent={colors.gold} />
    </SafeAreaView>
  );
}
