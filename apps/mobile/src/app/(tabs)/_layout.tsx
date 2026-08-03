import { usePathname } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@kouskous/shared';
import { AppHeader } from '@/components/app-header';
import { LocationFilterBar } from '@/components/location-filter-bar';
import { AppTabBar } from '@/components/tab-bar';

/**
 * The header and location filter live above the navigator because both are
 * shared by the Feed, Forums and Events tabs (spec §4). The profile tab is
 * the one place the filter does not apply.
 */
export default function TabsLayout() {
  const pathname = usePathname();
  const showsFilter = pathname !== '/profile';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader />
      {showsFilter ? <LocationFilterBar /> : null}
      <View style={styles.navigator}>
        <Tabs
          tabBar={(props) => <AppTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: colors.cream },
          }}
        >
          <Tabs.Screen name="index" options={{ title: 'Αρχική' }} />
          <Tabs.Screen name="communities" options={{ title: 'Κοινότητες' }} />
          <Tabs.Screen name="events" options={{ title: 'Events' }} />
          <Tabs.Screen name="profile" options={{ title: 'Προφίλ' }} />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  navigator: {
    flex: 1,
  },
});
