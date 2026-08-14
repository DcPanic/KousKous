import { useCallback, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Info, Minus, Plus, Store } from 'lucide-react-native';
import { colors, findCategory, findSubcategory, radii, shadows, spacing } from '@kouskous/shared';
import { font } from '@/theme/typography';
import { euro } from '@/lib/money';
import { fetchProduct, fetchShop, placeOrder, type Product, type Shop } from '@/lib/shops-repo';
import { useSession } from '@/state/session';
import { AttachmentGrid } from '@/components/attachments';
import { PlaceholderScreen } from '@/components/placeholder-screen';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, signedIn } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loaded, setLoaded] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const productId = typeof id === 'string' ? id : '';

  const load = useCallback(async () => {
    if (!productId) return;

    // A failed fetch has to land in the same "loaded" state as an empty
    // one, otherwise the screen renders the empty product — €0,00 and all.
    try {
      const found = await fetchProduct(productId);
      setProduct(found);
      if (found) setShop(await fetchShop(found.shopId));
    } catch {
      setProduct(null);
    } finally {
      setLoaded(true);
    }
  }, [productId]);

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

  if (!product) {
    return (
      <PlaceholderScreen
        title="Το προϊόν δεν βρέθηκε"
        subtitle="Άγνωστο προϊόν"
        body="Ίσως αφαιρέθηκε από το μαγαζί."
      />
    );
  }

  const soldOut = product?.stock === 0;
  const canOrder = Boolean(signedIn && shop?.hostCanSell && !soldOut && product);
  const total = (product?.priceCents ?? 0) * quantity;

  const order = async () => {
    if (!product || !canOrder || ordering) return;

    setOrdering(true);
    setError(null);

    try {
      const created = await placeOrder(user.id, product.shopId, [{ product, quantity }], note.trim());
      setOrderId(created);
    } catch {
      setError('Η παραγγελία δεν καταχωρήθηκε. Δοκίμασε ξανά.');
    } finally {
      setOrdering(false);
    }
  };

  const category = product?.categoryId ? findCategory(product.categoryId) : undefined;
  const subcategory = product?.subcategoryId ? findSubcategory(product.subcategoryId) : undefined;

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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {product?.images.length ? (
            <AttachmentGrid attachments={product.images} height={280} />
          ) : (
            <View style={styles.placeholder}>
              <Store size={26} color={colors.hostPurple} />
            </View>
          )}

          <Text style={styles.title}>{product?.title}</Text>
          <Text style={styles.price}>{euro(product?.priceCents ?? 0)}</Text>

          {category ? (
            <Text style={styles.category}>
              {category.emoji} {category.name}
              {subcategory ? ` · ${subcategory.name}` : ''}
            </Text>
          ) : null}

          {shop ? (
            <Pressable
              onPress={() => router.push({ pathname: '/shop/[id]', params: { id: shop.id } })}
              style={styles.shopRow}
              accessibilityRole="button"
            >
              <Store size={15} color={colors.hostPurple} />
              <Text style={styles.shopName}>{shop.name}</Text>
              <Text style={styles.shopAction}>άνοιγμα</Text>
            </Pressable>
          ) : null}

          {product?.description ? (
            <Text style={styles.description}>{product.description}</Text>
          ) : null}

          <Text style={styles.stock}>
            {product?.stock === null
              ? 'Κατόπιν παραγγελίας'
              : soldOut
                ? 'Εξαντλήθηκε'
                : `${product?.stock} διαθέσιμα`}
          </Text>

          {orderId ? (
            <View style={styles.done}>
              <Check size={16} color={colors.success} />
              <Text style={styles.doneLabel}>
                Η παραγγελία στάλθηκε στη διοργανώτρια. Θα σε βρει με μήνυμα για την πληρωμή και την
                παράδοση.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.quantityRow}>
                <Text style={styles.quantityLabel}>Ποσότητα</Text>
                <Pressable
                  onPress={() => setQuantity((value) => Math.max(1, value - 1))}
                  style={styles.stepper}
                  accessibilityRole="button"
                  accessibilityLabel="Λιγότερα"
                >
                  <Minus size={15} color={colors.text} />
                </Pressable>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <Pressable
                  onPress={() =>
                    setQuantity((value) =>
                      product?.stock === null ? value + 1 : Math.min(product?.stock ?? 1, value + 1),
                    )
                  }
                  style={styles.stepper}
                  accessibilityRole="button"
                  accessibilityLabel="Περισσότερα"
                >
                  <Plus size={15} color={colors.text} />
                </Pressable>
              </View>

              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Σημείωση για τη διοργανώτρια (μέγεθος, χρώμα...)"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                multiline
              />
            </>
          )}

          <View style={styles.notice}>
            <Info size={15} color={colors.hostPurpleDark} />
            <Text style={styles.noticeLabel}>
              Η πληρωμή γίνεται απευθείας στη διοργανώτρια μέσω του δικού της λογαριασμού Stripe. Το
              KousKous δεν κρατάει προμήθεια και δεν διαχειρίζεται τα χρήματα.
            </Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        {!orderId ? (
          <View style={styles.footer}>
            <View style={styles.totalColumn}>
              <Text style={styles.totalValue}>{euro(total)}</Text>
              <Text style={styles.totalLabel}>σύνολο</Text>
            </View>
            <Pressable
              onPress={() => void order()}
              disabled={!canOrder || ordering}
              style={[styles.orderButton, (!canOrder || ordering) && styles.orderButtonDisabled]}
              accessibilityRole="button"
            >
              <Text style={styles.orderLabel}>
                {ordering
                  ? 'Αποστολή...'
                  : soldOut
                    ? 'Εξαντλήθηκε'
                    : !signedIn
                      ? 'Κάνε σύνδεση'
                      : !shop?.hostCanSell
                        ? 'Δεν δέχεται παραγγελίες'
                        : 'Παραγγελία'}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
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
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xl,
  },
  placeholder: {
    width: '100%',
    height: 220,
    borderRadius: radii.lg,
    backgroundColor: colors.hostPurpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 19,
    fontFamily: font.extrabold,
    color: colors.text,
    marginTop: spacing.lg,
  },
  price: {
    fontSize: 17,
    fontFamily: font.extrabold,
    color: colors.hostPurpleDark,
    marginTop: 2,
  },
  category: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textMuted,
    marginTop: 4,
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  shopName: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  shopAction: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.hostPurple,
  },
  description: {
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.textBody,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  stock: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  quantityLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  stepper: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    minWidth: 22,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    minHeight: 70,
    textAlignVertical: 'top',
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.text,
    marginTop: spacing.md,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.hostPurpleTint,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  noticeLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: font.medium,
    color: colors.hostPurpleDark,
    lineHeight: 16,
  },
  done: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#E4F0E8',
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  doneLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: font.medium,
    color: colors.success,
    lineHeight: 18,
  },
  error: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.danger,
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  totalColumn: {
    minWidth: 76,
  },
  totalValue: {
    fontSize: 17,
    fontFamily: font.extrabold,
    color: colors.text,
  },
  totalLabel: {
    fontSize: 10.5,
    fontFamily: font.regular,
    color: colors.textMuted,
  },
  orderButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.hostPurple,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 2,
  },
  orderButtonDisabled: {
    backgroundColor: colors.textInactive,
  },
  orderLabel: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
});
