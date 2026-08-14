import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ImagePlus,
  Info,
  Package,
  Plus,
  Search,
  Store,
  X,
} from 'lucide-react-native';
import {
  can,
  canSell,
  colors,
  findPlace,
  radii,
  searchPlaces,
  shadows,
  spacing,
  toGreekUpperCase,
} from '@kouskous/shared';
import { font } from '@/theme/typography';
import type { Attachment } from '@/data/forum';
import { pickMedia } from '@/lib/media';
import { euro, parseEuro } from '@/lib/money';
import {
  createProduct,
  fetchMyShop,
  fetchProducts,
  setProductActive,
  setShopOpen,
  upsertShop,
  type Product,
  type Shop,
} from '@/lib/shops-repo';
import { useSession } from '@/state/session';
import { AttachmentGrid } from '@/components/attachments';
import { CategoryPicker, type CategoryChoice } from '@/components/category-picker';
import { PlaceholderScreen } from '@/components/placeholder-screen';

const ACCENT = colors.hostPurple;

/**
 * The host's own shop: open it, list products, take it offline.
 *
 * Listing needs community approval; charging needs the payment account
 * too. The screen shows which of the two is missing rather than blocking
 * everything behind one gate.
 */
export default function MyShopScreen() {
  const router = useRouter();
  const { user, signedIn } = useSession();

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [placeId, setPlaceId] = useState<string | null>(user.location ?? null);
  const [placeQuery, setPlaceQuery] = useState('');
  const [editingPlace, setEditingPlace] = useState(false);
  const [logoUri, setLogoUri] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productOpen, setProductOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState<CategoryChoice | null>(null);
  const [images, setImages] = useState<Attachment[]>([]);
  const [addingProduct, setAddingProduct] = useState(false);

  const load = useCallback(async () => {
    if (!signedIn) {
      setLoaded(true);
      return;
    }

    const mine = await fetchMyShop(user.id);
    setShop(mine);

    if (mine) {
      setName(mine.name);
      setDescription(mine.description);
      setPlaceId(mine.location);
      setLogoUri(mine.logoUrl);

      try {
        setProducts(await fetchProducts(mine.id));
      } catch {
        setProducts([]);
      }
    }

    setLoaded(true);
  }, [signedIn, user.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const suggestions = useMemo(() => {
    if (placeQuery.trim().length < 2) return [];
    return searchPlaces(placeQuery).slice(0, 6);
  }, [placeQuery]);

  if (!can(user, 'run_shop')) {
    return (
      <PlaceholderScreen
        title="Μόνο για διοργανώτριες"
        subtitle="Premium Host"
        body="Το μαγαζί είναι διαθέσιμο σε εγκεκριμένους λογαριασμούς Premium Host."
      />
    );
  }

  const saveShop = async () => {
    if (name.trim().length < 2 || saving) return;

    setSaving(true);
    setError(null);

    try {
      await upsertShop(user.id, {
        name: name.trim(),
        description: description.trim(),
        location: placeId,
        logoUri,
      });
      await load();
    } catch {
      setError('Το μαγαζί δεν αποθηκεύτηκε. Δοκίμασε ξανά.');
    } finally {
      setSaving(false);
    }
  };

  const addProduct = async () => {
    const cents = parseEuro(price);
    if (!shop || title.trim().length < 2 || cents === null || addingProduct) return;

    setAddingProduct(true);
    setError(null);

    try {
      await createProduct(user.id, shop.id, {
        title: title.trim(),
        description: productDescription.trim(),
        priceCents: cents,
        stock: stock.trim().length > 0 ? Number(stock) : null,
        categoryId: category?.categoryId ?? null,
        subcategoryId: category?.subcategoryId ?? null,
        images,
      });

      setTitle('');
      setProductDescription('');
      setPrice('');
      setStock('');
      setCategory(null);
      setImages([]);
      setProductOpen(false);
      await load();
    } catch {
      setError('Το προϊόν δεν προστέθηκε. Δοκίμασε ξανά.');
    } finally {
      setAddingProduct(false);
    }
  };

  const pickLogo = async () => {
    const picked = await pickMedia('image');
    if (picked[0]?.uri) setLogoUri(picked[0].uri);
  };

  const pickImages = async () => {
    const picked = await pickMedia('image');
    if (picked.length > 0) setImages((prev) => [...prev, ...picked]);
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
        <Text style={styles.headerTitle}>Το μαγαζί μου</Text>
        {shop ? (
          <Pressable
            onPress={() => void setShopOpen(shop.id, !shop.isOpen).then(load)}
            style={styles.toggleOpen}
            accessibilityRole="button"
            accessibilityLabel={shop.isOpen ? 'Κλείσιμο μαγαζιού' : 'Άνοιγμα μαγαζιού'}
          >
            {shop.isOpen ? (
              <Eye size={15} color={ACCENT} />
            ) : (
              <EyeOff size={15} color={colors.textMuted} />
            )}
            <Text style={styles.toggleLabel}>{shop.isOpen ? 'Ανοιχτό' : 'Κλειστό'}</Text>
          </Pressable>
        ) : null}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {!canSell(user) ? (
            <View style={styles.notice}>
              <Info size={15} color={colors.hostPurpleDark} />
              <Text style={styles.noticeLabel}>
                Μπορείς να στήσεις το μαγαζί και να προσθέσεις προϊόντα. Για να δέχεσαι παραγγελίες
                χρειάζεται να συνδέσεις λογαριασμό πληρωμών από το Dashboard.
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={pickLogo}
            style={styles.logoPicker}
            accessibilityRole="button"
            accessibilityLabel="Λογότυπο μαγαζιού"
          >
            {logoUri ? (
              <Image
                source={{ uri: logoUri }}
                style={styles.logoImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={160}
              />
            ) : (
              <>
                <ImagePlus size={20} color={ACCENT} />
                <Text style={styles.logoLabel}>Λογότυπο</Text>
              </>
            )}
          </Pressable>

          <Text style={styles.label}>{toGreekUpperCase('Όνομα μαγαζιού')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="π.χ. Handmade by Νατάσα"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.label}>{toGreekUpperCase('Περιγραφή')}</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Τι πουλάς, πώς φτιάχνεται, πόσο χρόνο θέλει η αποστολή..."
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.multiline]}
            multiline
          />

          <Text style={styles.label}>{toGreekUpperCase('Περιοχή')}</Text>
          {placeId && !editingPlace ? (
            <Pressable
              onPress={() => {
                setEditingPlace(true);
                setPlaceQuery('');
              }}
              style={styles.field}
              accessibilityRole="button"
            >
              <Text style={styles.fieldValue}>{findPlace(placeId)?.name}</Text>
              <Text style={styles.fieldAction}>αλλαγή</Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.inputRow}>
                <Search size={16} color={colors.textMuted} />
                <TextInput
                  value={placeQuery}
                  onChangeText={setPlaceQuery}
                  placeholder="Γράψε πόλη ή χωριό"
                  placeholderTextColor={colors.textMuted}
                  style={styles.inputFlex}
                />
              </View>
              {suggestions.map((place) => (
                <Pressable
                  key={place.id}
                  onPress={() => {
                    setPlaceId(place.id);
                    setEditingPlace(false);
                  }}
                  style={styles.suggestion}
                  accessibilityRole="button"
                >
                  <Text style={styles.suggestionName}>{place.name}</Text>
                </Pressable>
              ))}
            </>
          )}

          <Pressable
            onPress={() => void saveShop()}
            disabled={name.trim().length < 2 || saving}
            style={[styles.primary, (name.trim().length < 2 || saving) && styles.primaryDisabled]}
            accessibilityRole="button"
          >
            <Text style={styles.primaryLabel}>
              {saving ? 'Αποθήκευση...' : shop ? 'Αποθήκευση αλλαγών' : 'Άνοιγμα μαγαζιού'}
            </Text>
          </Pressable>

          {shop ? (
            <>
              <View style={styles.productsHeader}>
                <Text style={styles.label}>{toGreekUpperCase('Προϊόντα')}</Text>
                <Pressable
                  onPress={() => setProductOpen((open) => !open)}
                  style={styles.addProduct}
                  accessibilityRole="button"
                >
                  {productOpen ? (
                    <X size={14} color={colors.white} />
                  ) : (
                    <Plus size={14} color={colors.white} strokeWidth={2.6} />
                  )}
                  <Text style={styles.addProductLabel}>
                    {productOpen ? 'Άκυρο' : 'Νέο προϊόν'}
                  </Text>
                </Pressable>
              </View>

              {productOpen ? (
                <View style={styles.productForm}>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Όνομα προϊόντος"
                    placeholderTextColor={colors.textMuted}
                    style={styles.input}
                  />
                  <TextInput
                    value={productDescription}
                    onChangeText={setProductDescription}
                    placeholder="Περιγραφή"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.input, styles.multiline, styles.spaced]}
                    multiline
                  />

                  <View style={styles.row}>
                    <View style={styles.half}>
                      <View style={styles.field}>
                        <Text style={styles.euroSign}>€</Text>
                        <TextInput
                          value={price}
                          onChangeText={setPrice}
                          placeholder="0,00"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="decimal-pad"
                          style={styles.fieldInput}
                        />
                      </View>
                    </View>
                    <View style={styles.half}>
                      <View style={styles.field}>
                        <Package size={15} color={ACCENT} />
                        <TextInput
                          value={stock}
                          onChangeText={setStock}
                          placeholder="Τεμάχια"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="number-pad"
                          style={styles.fieldInput}
                        />
                      </View>
                    </View>
                  </View>
                  <Text style={styles.hint}>Άσε τα τεμάχια κενά για «κατόπιν παραγγελίας».</Text>

                  <CategoryPicker
                    label="Κατηγορία (προαιρετικό)"
                    placeholder="Διάλεξε κατηγορία"
                    value={category}
                    onChange={setCategory}
                    accent={ACCENT}
                  />

                  <Pressable
                    onPress={pickImages}
                    style={styles.addPhotos}
                    accessibilityRole="button"
                  >
                    <ImagePlus size={17} color={ACCENT} />
                    <Text style={styles.addPhotosLabel}>Φωτογραφίες</Text>
                  </Pressable>

                  <AttachmentGrid
                    attachments={images}
                    onRemove={(imageId) =>
                      setImages((prev) => prev.filter((item) => item.id !== imageId))
                    }
                    height={110}
                  />

                  <Pressable
                    onPress={() => void addProduct()}
                    disabled={title.trim().length < 2 || parseEuro(price) === null || addingProduct}
                    style={[
                      styles.primary,
                      (title.trim().length < 2 || parseEuro(price) === null || addingProduct) &&
                        styles.primaryDisabled,
                    ]}
                    accessibilityRole="button"
                  >
                    <Text style={styles.primaryLabel}>
                      {addingProduct ? 'Προσθήκη...' : 'Προσθήκη προϊόντος'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {products.map((product) => (
                <View key={product.id} style={styles.productRow}>
                  <View style={styles.productThumb}>
                    {product.images[0]?.uri ? (
                      <Image
                        source={{ uri: product.images[0].uri }}
                        style={styles.logoImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={160}
                      />
                    ) : (
                      <Package size={18} color={ACCENT} />
                    )}
                  </View>

                  <View style={styles.productText}>
                    <Text style={styles.productTitle} numberOfLines={1}>
                      {product.title}
                    </Text>
                    <Text style={styles.productMeta}>
                      {euro(product.priceCents)}
                      {product.stock === null ? ' · κατόπιν παραγγελίας' : ` · ${product.stock} τεμ.`}
                    </Text>
                  </View>

                  <Switch
                    value={product.isActive}
                    onValueChange={(next) => void setProductActive(product.id, next).then(load)}
                    trackColor={{ false: colors.borderChip, true: ACCENT }}
                    thumbColor={colors.white}
                    accessibilityLabel={`Εμφάνιση: ${product.title}`}
                  />
                </View>
              ))}

              {products.length === 0 && !productOpen ? (
                <Text style={styles.empty}>
                  Δεν έχεις προϊόντα ακόμα. Πάτα «Νέο προϊόν» για το πρώτο σου.
                </Text>
              ) : null}
            </>
          ) : loaded ? (
            <View style={styles.intro}>
              <Store size={22} color={ACCENT} />
              <Text style={styles.introLabel}>
                Άνοιξε το μαγαζί σου και πούλα στις γυναίκες του KousKous. Τα χρήματα πάνε
                απευθείας σε εσένα — 0% προμήθεια.
              </Text>
            </View>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
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
  toggleOpen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radii.full,
    borderWidth: 1.3,
    borderColor: colors.borderChip,
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
  },
  toggleLabel: {
    fontSize: 11,
    fontFamily: font.bold,
    color: colors.textMuted,
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.hostPurpleTint,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noticeLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: font.medium,
    color: colors.hostPurpleDark,
    lineHeight: 16,
  },
  logoPicker: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: ACCENT,
    backgroundColor: colors.hostPurpleTint,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoLabel: {
    fontSize: 11,
    fontFamily: font.bold,
    color: colors.hostPurpleDark,
  },
  label: {
    fontSize: 11,
    fontFamily: font.extrabold,
    letterSpacing: 0.8,
    color: ACCENT,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.text,
  },
  spaced: {
    marginTop: spacing.sm,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 13,
    fontFamily: font.regular,
    color: colors.text,
  },
  suggestion: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    marginTop: 6,
  },
  suggestionName: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
  },
  fieldValue: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  fieldInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: font.bold,
    color: colors.text,
  },
  fieldAction: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: ACCENT,
  },
  euroSign: {
    fontSize: 14,
    fontFamily: font.extrabold,
    color: ACCENT,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  half: {
    flex: 1,
  },
  hint: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 5,
  },
  primary: {
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: radii.pill,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.lg,
  },
  primaryDisabled: {
    backgroundColor: colors.textInactive,
  },
  primaryLabel: {
    fontSize: 13.5,
    fontFamily: font.extrabold,
    color: colors.white,
  },
  productsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  addProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: ACCENT,
    borderRadius: radii.full,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  addProductLabel: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.white,
  },
  productForm: {
    backgroundColor: colors.hostPurpleTint,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  addPhotos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  addPhotosLabel: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.hostPurpleDark,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: 6,
    boxShadow: shadows.card,
  },
  productThumb: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.hostPurpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productText: {
    flex: 1,
  },
  productTitle: {
    fontSize: 12.5,
    fontFamily: font.bold,
    color: colors.text,
  },
  productMeta: {
    fontSize: 11,
    fontFamily: font.regular,
    color: colors.textMuted,
    marginTop: 1,
  },
  intro: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  introLabel: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  empty: {
    fontSize: 12.5,
    fontFamily: font.regular,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  error: {
    fontSize: 11.5,
    fontFamily: font.bold,
    color: colors.danger,
    marginTop: spacing.md,
  },
});
