import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Crown, MapPin, Pencil } from 'lucide-react-native';
import {
  colors,
  findLocation,
  gradients,
  layout,
  PAID_MEMBER_PRICE_EUR,
  radii,
  spacing,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import { profileStats } from '@/data/mock';
import { useAppState } from '@/state/app-state';
import { useFeed } from '@/state/feed';
import { useSession } from '@/state/session';
import { Avatar } from '@/components/avatar';
import { PostCard } from '@/components/post-card';

export default function ProfileScreen() {
  const { user, tier, signedIn } = useSession();
  const { posts } = useFeed();
  const { savedPostIds, joinedEventIds } = useAppState();
  const router = useRouter();
  const [tab, setTab] = useState<'mine' | 'saved'>('mine');

  const cityName = user.location ? findLocation(user.location)?.name : null;
  const isOfficial = tier === 'official';

  // Seeded content has no author id, so the preview account shows nothing
  // of its own rather than claiming someone else's posts.
  const myPosts = useMemo(
    () => (signedIn ? posts.filter((post) => post.authorId === user.id) : []),
    [posts, signedIn, user.id],
  );

  const savedPosts = useMemo(
    () => posts.filter((post) => savedPostIds.includes(post.id)),
    [posts, savedPostIds],
  );

  // One line rather than three stat columns, which is what makes the
  // header feel like a dashboard instead of a profile.
  const countsLine = signedIn
    ? [
        `${myPosts.length} δημοσιεύσεις`,
        `${savedPostIds.length} αποθηκευμένα`,
        `${joinedEventIds.length} events`,
      ].join('  ·  ')
    : profileStats.map(([value, label]) => `${value} ${label.toLowerCase()}`).join('  ·  ');

  const header = (
    <View>
      <View style={styles.identityRow}>
        <View style={styles.identityText}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.name}</Text>
            {isOfficial ? (
              <View style={styles.officialBadge}>
                <Crown size={9} color={colors.white} fill={colors.white} />
              </View>
            ) : null}
          </View>

          {isOfficial ? <Text style={styles.officialLabel}>Official Account</Text> : null}

          {cityName ? (
            <View style={styles.locationRow}>
              <MapPin size={12} color={colors.textMuted} />
              <Text style={styles.location}>{cityName}</Text>
            </View>
          ) : null}
        </View>

        <Avatar
          size={isOfficial ? 74 : 66}
          uri={user.avatar_url ?? undefined}
          initial={isOfficial ? 'K' : undefined}
          ringColor={isOfficial ? colors.gold : undefined}
          gradient={isOfficial ? gradients.officialCover : undefined}
        />
      </View>

      {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

      <Text style={styles.counts}>{countsLine}</Text>

      <View style={styles.buttons}>
        {/* Her own profile only — /u/[id] is someone else's and has follow
            and message instead. */}
        <Pressable
          style={styles.editProfile}
          onPress={() => router.push('/edit-profile')}
          accessibilityRole="button"
          accessibilityLabel="Επεξεργασία προφίλ"
        >
          <Pencil size={14} color={colors.text} />
          <Text style={styles.editProfileLabel}>Επεξεργασία προφίλ</Text>
        </Pressable>

        {tier === 'free' ? (
          <Pressable
            style={styles.upgrade}
            onPress={() => router.push('/membership')}
            accessibilityRole="button"
          >
            <Text style={styles.upgradeLabel}>
              Μέλος · €{PAID_MEMBER_PRICE_EUR.toFixed(2).replace('.', ',')}
            </Text>
          </Pressable>
        ) : null}

        {tier === 'host' ? (
          <Pressable style={styles.hostCta} onPress={() => router.push('/host')} accessibilityRole="button">
            <Text style={styles.upgradeLabel}>Dashboard</Text>
          </Pressable>
        ) : null}

        {isOfficial ? (
          <Pressable style={styles.officialCta} onPress={() => router.push('/official')} accessibilityRole="button">
            <Crown size={15} color={colors.gold} />
            <Text style={styles.upgradeLabel}>Dashboard</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.tabs}>
        {(
          [
            ['mine', 'Δημοσιεύσεις'],
            ['saved', 'Αποθηκευμένα'],
          ] as const
        ).map(([key, label]) => {
          const active = key === tab;
          return (
            <Pressable
              key={key}
              onPress={() => setTab(key)}
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const shown = tab === 'mine' ? myPosts : savedPosts;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={shown}
      keyExtractor={(post) => post.id}
      renderItem={({ item }) => <PostCard post={item} />}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <Text style={styles.empty}>
          {tab === 'saved'
            ? 'Δεν έχεις αποθηκεύσει καμία δημοσίευση.'
            : signedIn
              ? 'Δεν έχεις δημοσιεύσει τίποτα ακόμα. Πάτα το + για την πρώτη σου δημοσίευση.'
              : 'Κάνε σύνδεση για να δεις τις δημοσιεύσεις σου.'}
        </Text>
      }
      showsVerticalScrollIndicator={false}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    // White, so the hairlines between posts read as separators rather
    // than as edges of floating cards.
    backgroundColor: colors.surface,
  },
  content: {
    paddingBottom: layout.tabBarHeight,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.screen,
  },
  identityText: {
    flex: 1,
  },
  counts: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    paddingHorizontal: spacing.screen,
    marginTop: spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.screen,
    marginTop: spacing.md,
  },
  empty: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 19,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  officialBadge: {
    width: 16,
    height: 16,
    borderRadius: radii.full,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  officialLabel: {
    fontSize: 12,
    fontFamily: font.bold,
    color: colors.hostPurple,
    marginTop: 3,
  },
  bio: {
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.textSecondary,
    lineHeight: 19,
    paddingHorizontal: spacing.screen,
    marginTop: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  location: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  editProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: radii.md,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md - 1,
  },
  editProfileLabel: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  upgrade: {
    flex: 1,
    backgroundColor: colors.pink,
    borderRadius: radii.md,
    paddingVertical: 11,
    alignItems: 'center',
  },
  hostCta: {
    flex: 1,
    backgroundColor: colors.hostPurple,
    borderRadius: radii.md,
    paddingVertical: 11,
    alignItems: 'center',
  },
  officialCta: {
    flex: 1,
    backgroundColor: colors.aubergine,
    borderRadius: radii.lg,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  upgradeLabel: {
    fontSize: 13,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    marginTop: spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.pink,
  },
  tabLabel: {
    fontSize: 12.5,
    fontFamily: font.extrabold,
    color: colors.textFaint,
  },
  tabLabelActive: {
    color: colors.pink,
  },
});
