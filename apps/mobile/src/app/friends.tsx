import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BadgeCheck, Search, UserPlus } from 'lucide-react-native';
import { colors, findPlace, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { useSocial } from '@/state/social';
import { useSession } from '@/state/session';
import { Avatar } from '@/components/avatar';

type FriendsTab = 'following' | 'followers' | 'suggested';

const TABS: [FriendsTab, string][] = [
  ['following', 'Ακολουθείς'],
  ['followers', 'Σε ακολουθούν'],
  ['suggested', 'Προτάσεις'],
];

/** Her people, from the follow graph. */
export default function FriendsScreen() {
  const router = useRouter();
  const { signedIn } = useSession();
  const {
    following,
    followers,
    suggested,
    loading,
    refresh,
    isFollowing,
    toggleFollowing,
  } = useSocial();
  const [tab, setTab] = useState<FriendsTab>('following');

  const listFor = (which: FriendsTab) => {
    if (which === 'following') return following;
    if (which === 'followers') return followers;
    return suggested;
  };

  const list = listFor(tab);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Πίσω"
        >
          <ArrowLeft size={17} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Φίλες</Text>
        <Pressable
          onPress={() => router.push('/search')}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Αναζήτηση"
        >
          <Search size={17} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {TABS.map(([key, label]) => {
          const active = key === tab;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {label} · {listFor(key).length}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => void refresh()} tintColor={colors.pink} />
        }
      >
        {list.map((person) => {
          const followed = isFollowing(person.id);
          return (
            <View key={person.id} style={styles.row}>
              <Pressable
                onPress={() => router.push({ pathname: '/u/[id]', params: { id: person.id } })}
                style={styles.rowTap}
                accessibilityRole="button"
                accessibilityLabel={`Προφίλ: ${person.name}`}
              >
                <Avatar size={44} uri={person.avatarUrl ?? undefined} />
                <View style={styles.rowText}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {person.name}
                    </Text>
                    {person.verified ? (
                      <BadgeCheck size={12} color={colors.pink} fill={colors.pinkTint} />
                    ) : null}
                  </View>
                  <Text style={styles.meta} numberOfLines={1}>
                    {person.bio ||
                      (person.location ? (findPlace(person.location)?.name ?? '') : '')}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => toggleFollowing(person.id)}
                style={[styles.follow, followed && styles.followActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: followed }}
                accessibilityLabel={`${followed ? 'Κατάργηση' : 'Ακολούθησε'} ${person.name}`}
              >
                {!followed ? <UserPlus size={13} color={colors.white} /> : null}
                <Text style={[styles.followLabel, followed && styles.followLabelActive]}>
                  {followed ? 'Ακολουθείς' : 'Ακολούθησε'}
                </Text>
              </Pressable>
            </View>
          );
        })}

        {list.length === 0 && !loading ? (
          <Text style={styles.empty}>
            {!signedIn
              ? 'Κάνε σύνδεση για να δεις τις φίλες σου.'
              : tab === 'following'
                ? 'Δεν ακολουθείς καμία ακόμα. Δες τις προτάσεις.'
                : tab === 'followers'
                  ? 'Δεν σε ακολουθεί καμία ακόμα.'
                  : 'Καμία πρόταση αυτή τη στιγμή.'}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  back: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.card,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  tabs: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
    paddingVertical: 8,
  },
  tabActive: {
    borderColor: colors.pink,
    backgroundColor: colors.pinkSoft,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.pinkDark,
  },
  list: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    boxShadow: shadows.card,
  },
  rowTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
    flexShrink: 1,
  },
  meta: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 1,
  },
  follow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.pink,
    borderRadius: radii.full,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
  },
  followActive: {
    backgroundColor: colors.surface,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
  },
  followLabel: {
    fontSize: 11,
    fontFamily: font.bold,
    color: colors.white,
  },
  followLabelActive: {
    color: colors.textMuted,
  },
  empty: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
