import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, BadgeCheck, Info, MapPin, Package, Store } from 'lucide-react-native';
import { colors, findPlace, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { euro } from '@/lib/money';
import { fetchProducts, fetchShop, type Product, type Shop } from '@/lib/shops-repo';
import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function ShopScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  const shopId = typeof id === 'string' ? id : '';

  const load = useCallback(async () => {
    if (!shopId) return;

    // A failed fetch has to land in the same "loaded" state as an empty
    // one, otherwise the header renders around a shop that never arrived.
    try {
      const found = await fetchShop(shopId);
      setShop(found);

      if (found) {
        try {
          setProducts(await fetchProducts(shopId));
        } catch {
          setProducts([]);
        }
      }
    } catch {
      setShop(null);
    } finally {
      setLoaded(true);
    }
  }, [shopId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!loaded) {
    return (
      <SafeAreaView style={[styles.screen, styles.centre]} edges={['top']}>
        <ActivityIndicator color={colors.hostPurple} />
      </SafeAreaView>
    );
  }

  if (!shop) {
    return (
      <PlaceholderScreen
        title="Το μαγαζί δεν βρέθηκε"
        subtitle="Άγνωστο μαγαζί"
        body="Ίσως έκλεισε ή ο σύνδεσμος είναι λάθος."
      />
    );
  }

  const header = (
    <View>
      <View style={styles.shopHeader}>
        <View style={styles.logo}>
          {shop?.logoUrl ? (
            <Image
              source={{ uri: shop.logoUrl }}
              style={styles.logoImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={160}
            />
          ) : (
            <Store size={24} color={colors.hostPurple} />
          )}
        </View>

        <View style={styles.shopText}>
          <View style={styles.nameRow}>
            <Text style={styles.shopName} numberOfLines={2}>
              {shop?.name}
            </Text>
            {shop?.hostVerified ? (
              <BadgeCheck size={14} color={colors.pink} fill={colors.pinkTint} />
            ) : null}
          </View>
          <Text style={styles.host}>{shop?.hostName}</Text>
          {shop?.location ? (
            <View style={styles.metaRow}>
              <MapPin size={12} color={colors.textMuted} />
              <Text style={styles.meta}>{findPlace(shop.location)?.name}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {shop?.description ? <Text style={styles.description}>{shop.description}</Text> : null}

      {/* A shop can list before it can charge — the two gates are
          independent, so this state is normal rather than an error. */}
      {shop && !shop.hostCanSell ? (
        <View style={styles.notice}>
          <Info size={15} color={colors.hostPurpleDark} />
          <Text style={styles.noticeLabel}>
            Το μαγαζί δεν δέχεται ακόμα παραγγελίες — η διοργανώτρια δεν έχει συνδέσει λογαριασμό
            πληρωμών.
          </Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>
        {products.length === 1 ? '1 προϊόν' : `${products.length} προϊόντα`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Πίσω"
        >
          <ArrowLeft size={17} color={colors.text} />
        </Pressable>
      </View>

      <FlatList
        data={products}
        keyExtractor={(product) => product.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
            style={styles.product}
            accessibilityRole="button"
            accessibilityLabel={item.title}
          >
            <View style={styles.productImage}>
              {item.images[0]?.uri ? (
                <Image
                  source={{ uri: item.images[0].uri }}
                  style={styles.logoImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={160}
                />
              ) : (
                <Package size={22} color={colors.hostPurple} />
              )}
            </View>
            <Text style={styles.productTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.productPrice}>{euro(item.priceCents)}</Text>
            {item.stock === 0 ? <Text style={styles.soldOut}>Εξαντλήθηκε</Text> : null}
          </Pressable>
        )}
        ListEmptyComponent={
          loaded ? <Text style={styles.empty}>Δεν υπάρχουν προϊόντα ακόμα.</Text> : null
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
  centre: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
  list: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  column: {
    gap: spacing.sm,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 64,
    height: 64,
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
  shopText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  shopName: {
    fontSize: 17,
    fontFamily: font.extrabold,
    color: colors.text,
    flexShrink: 1,
  },
  host: {
    fontSize: 12,
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
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  description: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 19,
    marginTop: spacing.md,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.hostPurpleTint,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noticeLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: font.medium,
    color: colors.hostPurpleDark,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: colors.hostPurple,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  product: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    boxShadow: shadows.card,
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.md,
    backgroundColor: colors.hostPurpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productTitle: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  productPrice: {
    fontSize: 13,
    fontFamily: font.extrabold,
    color: colors.hostPurpleDark,
    marginTop: 2,
  },
  soldOut: {
    fontSize: 10.5,
    fontFamily: font.bold,
    color: colors.danger,
    marginTop: 1,
  },
  empty: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xxl,
  },
});
