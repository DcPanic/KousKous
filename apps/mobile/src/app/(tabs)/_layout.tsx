import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@kouskous/shared';
import { AppHeader } from '@/components/app-header';
import { AppTabBar } from '@/components/tab-bar';

/**
 * Only the header is shared here. Filtering moved into each screen, since
 * the criteria differ: events also filter by date, category and price.
 */
export default function TabsLayout() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader />
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
