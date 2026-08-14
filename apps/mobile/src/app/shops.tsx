import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BadgeCheck, MapPin, Store } from 'lucide-react-native';
import { colors, findPlace, matchesPlaces, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { fetchShops, type Shop } from '@/lib/shops-repo';
import { useAppState } from '@/state/app-state';
import { useSession } from '@/state/session';
import { FilterBar } from '@/components/filter-bar';

/**
 * Every open shop.
 *
 * Shopping is open to all accounts, like the events hosts run — the
 * subscription buys the forums, the KousKous events and the rewards.
 */
export default function ShopsScreen() {
  const router = useRouter();
  const { signedIn } = useSession();
  const { selectedPlaces } = useAppState();

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!signedIn) return;

    setLoading(true);
    setError(false);

    try {
      setShops(await fetchShops());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [signedIn]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = shops.filter((shop) => matchesPlaces(shop.location ?? '', selectedPlaces));

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
        <Text style={styles.headerTitle}>Μαγαζιά</Text>
      </View>

      <FilterBar surface="feed" resultCount={visible.length} />

      <FlatList
        data={visible}
        keyExtractor={(shop) => shop.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => void load()} tintColor={colors.pink} />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/shop/[id]', params: { id: item.id } })}
            style={styles.card}
            accessibilityRole="button"
            accessibilityLabel={`Μαγαζί: ${item.name}`}
          >
            <View style={styles.logo}>
              {item.logoUrl ? (
                <Image
                  source={{ uri: item.logoUrl }}
                  style={styles.logoImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={160}
                />
              ) : (
                <Store size={20} color={colors.hostPurple} />
              )}
            </View>

            <View style={styles.cardText}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.hostVerified ? (
                  <BadgeCheck size={13} color={colors.pink} fill={colors.pinkTint} />
                ) : null}
              </View>
              <Text style={styles.host} numberOfLines={1}>
                {item.hostName}
              </Text>
              <View style={styles.metaRow}>
                {item.location ? (
                  <>
                    <MapPin size={11} color={colors.textMuted} />
                    <Text style={styles.meta}>{findPlace(item.location)?.name}</Text>
                  </>
                ) : null}
                <Text style={styles.meta}>
                  {item.productCount === 1 ? '1 προϊόν' : `${item.productCount} προϊόντα`}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {error
              ? 'Δεν φόρτωσαν τα μαγαζιά. Τράβα προς τα κάτω για να δοκιμάσεις ξανά.'
              : signedIn
                ? 'Κανένα μαγαζί ακόμα. Οι διοργανώτριες μπορούν να ανοίξουν το δικό τους.'
                : 'Κάνε σύνδεση για να δεις τα μαγαζιά.'}
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />
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
    fontSize: 16,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  list: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    boxShadow: shadows.card,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.hostPurpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  cardText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 13.5,
    fontFamily: font.bold,
    color: colors.text,
    flexShrink: 1,
  },
  host: {
    fontSize: 11.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  meta: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textFaint,
    marginRight: 6,
  },
  empty: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
});
