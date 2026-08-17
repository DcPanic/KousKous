import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  MapPin,
  MessageSquareText,
  Sparkles,
  UserPlus,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  colors,
  findCategory,
  findPlace,
  radii,
  shadows,
  spacing,
  toGreekUpperCase,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import { findPerson } from '@/data/people';
import { fetchPostCount, fetchProfile, type PublicProfile } from '@/lib/profiles-repo';
import { useChat } from '@/state/chat';
import { useFeed } from '@/state/feed';
import { Avatar } from '@/components/avatar';
import { PlaceholderScreen } from '@/components/placeholder-screen';

const GRID_COLUMNS = 3;
const GRID_GAP = 2;

export default function PersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { openWith } = useChat();
  const { posts } = useFeed();
  const { width } = useWindowDimensions();

  const [following, setFollowing] = useState(false);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [postCount, setPostCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [opening, setOpening] = useState(false);

  const profileId = typeof id === 'string' ? id : '';
  // Seeded ids belong to the signed-out preview; a real one is a uuid.
  const seeded = findPerson(profileId);

  const load = useCallback(async () => {
    if (!profileId || seeded) {
      setLoaded(true);
      return;
    }

    const [found, count] = await Promise.all([
      fetchProfile(profileId),
      fetchPostCount(profileId),
    ]);

    setProfile(found);
    setPostCount(count);
    setLoaded(true);
  }, [profileId, seeded]);

  useEffect(() => {
    void load();
  }, [load]);

  // One shape for both, so the screen below does not branch.
  const person = seeded
    ? {
        id: seeded.id,
        name: seeded.name,
        bio: seeded.bio,
        avatarUrl: null as string | null,
        location: seeded.location,
        verified: seeded.verified,
        host: seeded.host,
        joined: seeded.joined,
        posts: seeded.posts,
        followers: seeded.followers,
        following: seeded.following,
        interests: seeded.interests,
        grid: seeded.grid,
      }
    : profile
      ? {
          ...profile,
          posts: postCount,
          // Following is not stored yet, so the profile leaves the two
          // counts out rather than inventing them.
          followers: '—',
          following: '—',
          interests: [] as string[],
          grid: [] as string[],
        }
      : null;

  if (!person && !loaded) {
    return (
      <View style={[styles.screen, styles.centre]}>
        <ActivityIndicator color={colors.pink} />
      </View>
    );
  }

  if (!person) {
    return (
      <PlaceholderScreen
        title="Το προφίλ δεν βρέθηκε"
        subtitle="Άγνωστη χρήστρια"
        body="Ίσως ο λογαριασμός διαγράφηκε ή ο σύνδεσμος είναι λάθος."
      />
    );
  }

  const tileSize = (width - GRID_GAP * (GRID_COLUMNS + 1)) / GRID_COLUMNS;
  const place = person.location ? findPlace(person.location) : undefined;
  const herPosts = posts.filter((post) => post.authorId === person.id);

  // Opens the thread the two already have, or starts one.
  const message = async () => {
    if (seeded || opening) {
      router.push('/chat');
      return;
    }

    setOpening(true);
    const conversationId = await openWith(person.id);
    setOpening(false);

    if (conversationId) {
      router.push({ pathname: '/chat/[id]', params: { id: conversationId } });
    }
  };

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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {person.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <Avatar size={74} uri={person.avatarUrl ?? undefined} />
          <View style={styles.stats}>
            <Stat value={String(person.posts)} label="posts" />
            <Stat value={person.followers} label="followers" />
            <Stat value={person.following} label="following" />
          </View>
        </View>

        <View style={styles.nameRow}>
          <Text style={styles.name}>{person.name}</Text>
          {person.verified ? (
            <BadgeCheck size={15} color={colors.pink} fill={colors.pinkTint} />
          ) : null}
          {person.host ? (
            <View style={styles.hostBadge}>
              <Sparkles size={10} color={colors.white} />
              <Text style={styles.hostBadgeLabel}>HOST</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.bio}>{person.bio}</Text>

        <View style={styles.metaRow}>
          {place ? (
            <>
              <MapPin size={13} color={colors.textMuted} />
              <Text style={styles.meta}>{place.name}</Text>
            </>
          ) : null}
          <CalendarDays size={13} color={colors.textMuted} />
          <Text style={styles.meta}>Μέλος από {person.joined}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => setFollowing((value) => !value)}
            style={[styles.follow, following && styles.followActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: following }}
          >
            {!following ? <UserPlus size={15} color={colors.white} /> : null}
            <Text style={[styles.followLabel, following && styles.followLabelActive]}>
              {following ? 'Ακολουθείς' : 'Ακολούθησε'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => void message()}
            disabled={opening}
            style={styles.messageButton}
            accessibilityRole="button"
            accessibilityLabel={`Στείλε μήνυμα στη ${person.name}`}
          >
            <MessageSquareText size={16} color={colors.pink} />
            <Text style={styles.messageLabel}>Μήνυμα</Text>
          </Pressable>
        </View>

        {person.interests.length > 0 ? (
          <>
        <Text style={styles.sectionTitle}>{toGreekUpperCase('Κοινότητες')}</Text>
        <View style={styles.chipWrap}>
          {person.interests.map((interestId) => {
            const category = findCategory(interestId);
            if (!category) return null;
            return (
              <Pressable
                key={interestId}
                onPress={() =>
                  router.push({ pathname: '/community/[id]', params: { id: interestId } })
                }
                style={styles.chip}
                accessibilityRole="button"
              >
                <Text style={styles.chipEmoji}>{category.emoji}</Text>
                <Text style={styles.chipLabel}>{category.name}</Text>
              </Pressable>
            );
          })}
        </View>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>{toGreekUpperCase('Δημοσιεύσεις')}</Text>
        <View style={styles.grid}>
          {person.grid.map((tint, index) => (
            <View
              key={`${tint}-${index}`}
              style={[styles.tile, { width: tileSize, height: tileSize, backgroundColor: tint }]}
            />
          ))}
          {herPosts.map((post) =>
            post.attachments?.[0]?.uri ? (
              <Pressable
                key={post.id}
                onPress={() => router.push({ pathname: '/post/[id]', params: { id: post.id } })}
                style={[styles.tile, { width: tileSize, height: tileSize }]}
                accessibilityRole="button"
                accessibilityLabel="Δημοσίευση"
              >
                <Image
                  source={{ uri: post.attachments[0]?.uri }}
                  style={styles.tileImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={160}
                />
              </Pressable>
            ) : null,
          )}
        </View>

        {person.grid.length === 0 && herPosts.length === 0 ? (
          <Text style={styles.emptyGrid}>Καμία δημοσίευση ακόμα.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  centre: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  emptyGrid: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
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
  body: {
    paddingBottom: spacing.xxl,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.screen,
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  statLabel: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.screen,
    marginTop: spacing.lg,
  },
  name: {
    fontSize: 15.5,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.hostPurple,
    borderRadius: radii.full,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  hostBadgeLabel: {
    fontSize: 9,
    fontFamily: font.extrabold,
    letterSpacing: 0.5,
    color: colors.white,
  },
  bio: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 19,
    paddingHorizontal: spacing.screen,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.screen,
    marginTop: spacing.sm,
  },
  meta: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.screen,
    marginTop: spacing.lg,
  },
  follow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.pink,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
  },
  followActive: {
    backgroundColor: colors.surface,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
  },
  followLabel: {
    fontSize: 12.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  followLabelActive: {
    color: colors.textMuted,
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.pinkSoft,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
  },
  messageLabel: {
    fontSize: 12.5,
    fontFamily: font.extrabold,
    color: colors.pinkDark,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.pink,
    paddingHorizontal: spacing.screen,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    paddingHorizontal: spacing.screen,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
  },
  chipEmoji: {
    fontSize: 13,
  },
  chipLabel: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    paddingHorizontal: GRID_GAP,
  },
  tile: {
    borderRadius: 2,
  },
});
