/**
 * Shops and products.
 *
 * Money never passes through KousKous: an order records what was bought
 * and the id of a payment made on the host's own Stripe account. There is
 * nothing here to hold, reconcile or pay out (spec §9).
 */

import type { Attachment } from '@/data/forum';
import { signedMediaUrls, toUploadable } from '@/lib/storage-media';
import { supabase } from '@/lib/supabase';

export interface Shop {
  id: string;
  hostId: string;
  hostName: string;
  hostVerified: boolean;
  /** True when the host's payment account is connected. */
  hostCanSell: boolean;
  name: string;
  description: string;
  location: string | null;
  logoUrl?: string;
  isOpen: boolean;
  productCount: number;
}

export interface Product {
  id: string;
  shopId: string;
  title: string;
  description: string;
  priceCents: number;
  /** Null means made to order. */
  stock: number | null;
  categoryId: string | null;
  subcategoryId: string | null;
  isActive: boolean;
  images: Attachment[];
}

const SHOP_SELECT = `
  id, host_id, name, description, location, logo_path, is_open,
  host:profiles!shops_host_id_fkey (name, is_verified, payment_verified, is_official),
  products (count)
`;

interface ShopRow {
  id: string;
  host_id: string;
  name: string;
  description: string;
  location: string | null;
  logo_path: string | null;
  is_open: boolean;
  host: {
    name: string;
    is_verified: boolean;
    payment_verified: boolean;
    is_official: boolean;
  } | null;
  products: { count: number }[] | null;
}

interface ProductRow {
  id: string;
  shop_id: string;
  title: string;
  description: string;
  price_cents: number;
  stock: number | null;
  category_id: string | null;
  subcategory_id: string | null;
  is_active: boolean;
  media: { id: string; storage_path: string; position: number }[] | null;
}

function toShop(row: ShopRow, urls: Map<string, string>): Shop {
  return {
    id: row.id,
    hostId: row.host_id,
    hostName: row.host?.name ?? 'Διοργανώτρια',
    hostVerified: row.host?.is_verified ?? false,
    hostCanSell: Boolean(row.host?.payment_verified || row.host?.is_official),
    name: row.name,
    description: row.description,
    location: row.location,
    logoUrl: row.logo_path ? urls.get(row.logo_path) : undefined,
    isOpen: row.is_open,
    productCount: row.products?.[0]?.count ?? 0,
  };
}

function toProduct(row: ProductRow, urls: Map<string, string>): Product {
  return {
    id: row.id,
    shopId: row.shop_id,
    title: row.title,
    description: row.description,
    priceCents: row.price_cents,
    stock: row.stock,
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    isActive: row.is_active,
    images: (row.media ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((media) => ({
        id: media.id,
        kind: 'image' as const,
        uri: urls.get(media.storage_path),
      })),
  };
}

export async function fetchShops(): Promise<Shop[]> {
  const { data, error } = await supabase
    .from('shops')
    .select(SHOP_SELECT)
    .order('created_at', { ascending: false });

  if (error || !data) throw error ?? new Error('shops unavailable');

  const rows = data as unknown as ShopRow[];
  const urls = await signedMediaUrls(
    rows.map((row) => row.logo_path).filter((path): path is string => Boolean(path)),
  );

  return rows.map((row) => toShop(row, urls));
}

export async function fetchShop(id: string): Promise<Shop | null> {
  const { data, error } = await supabase.from('shops').select(SHOP_SELECT).eq('id', id).maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as ShopRow;
  const urls = await signedMediaUrls(row.logo_path ? [row.logo_path] : []);
  return toShop(row, urls);
}

/** The signed-in host's own shop, or null before she opens one. */
export async function fetchMyShop(hostId: string): Promise<Shop | null> {
  const { data, error } = await supabase
    .from('shops')
    .select(SHOP_SELECT)
    .eq('host_id', hostId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as ShopRow;
  const urls = await signedMediaUrls(row.logo_path ? [row.logo_path] : []);
  return toShop(row, urls);
}

export async function fetchProducts(shopId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, shop_id, title, description, price_cents, stock, category_id, subcategory_id, is_active, media:product_media (id, storage_path, position)',
    )
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });

  if (error || !data) throw error ?? new Error('products unavailable');

  const rows = data as unknown as ProductRow[];
  const urls = await signedMediaUrls(
    rows.flatMap((row) => (row.media ?? []).map((media) => media.storage_path)),
  );

  return rows.map((row) => toProduct(row, urls));
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, shop_id, title, description, price_cents, stock, category_id, subcategory_id, is_active, media:product_media (id, storage_path, position)',
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as ProductRow;
  const urls = await signedMediaUrls((row.media ?? []).map((media) => media.storage_path));
  return toProduct(row, urls);
}

export interface ShopDraft {
  name: string;
  description: string;
  location: string | null;
  logoUri?: string;
}

export async function upsertShop(hostId: string, draft: ShopDraft): Promise<void> {
  let logoPath: string | undefined;

  if (draft.logoUri && !draft.logoUri.startsWith('http')) {
    const path = `${hostId}/shop/logo`;
    const blob = await toUploadable(draft.logoUri);

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, blob, { contentType: blob.type || undefined, upsert: true });

    if (uploadError) throw uploadError;
    logoPath = path;
  }

  const { error } = await supabase.from('shops').upsert(
    {
      host_id: hostId,
      name: draft.name,
      description: draft.description,
      location: draft.location,
      ...(logoPath ? { logo_path: logoPath } : {}),
    },
    { onConflict: 'host_id' },
  );

  if (error) throw error;
}

export async function setShopOpen(shopId: string, isOpen: boolean): Promise<void> {
  const { error } = await supabase.from('shops').update({ is_open: isOpen }).eq('id', shopId);
  if (error) throw error;
}

export interface ProductDraft {
  title: string;
  description: string;
  priceCents: number;
  stock: number | null;
  categoryId: string | null;
  subcategoryId: string | null;
  images: Attachment[];
}

export async function createProduct(
  hostId: string,
  shopId: string,
  draft: ProductDraft,
): Promise<void> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      shop_id: shopId,
      title: draft.title,
      description: draft.description,
      price_cents: draft.priceCents,
      stock: draft.stock,
      category_id: draft.categoryId,
      subcategory_id: draft.subcategoryId,
    })
    .select('id')
    .single();

  if (error || !data) throw error ?? new Error('product not created');

  const uploads = draft.images.filter((image) => image.uri);

  for (const [index, image] of uploads.entries()) {
    const path = `${hostId}/products/${data.id}/${index}`;
    const blob = await toUploadable(image.uri as string);

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(path, blob, { contentType: blob.type || undefined, upsert: true });

    // One failed photo should not discard the product.
    if (uploadError) continue;

    await supabase
      .from('product_media')
      .insert({ product_id: data.id, storage_path: path, position: index });
  }
}

export async function setProductActive(productId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive })
    .eq('id', productId);
  if (error) throw error;
}

/**
 * Record an order.
 *
 * The charge itself happens on the host's Stripe account and is not part
 * of this call; the row exists so both women can see what was agreed.
 */
export async function placeOrder(
  buyerId: string,
  shopId: string,
  items: { product: Product; quantity: number }[],
  note: string,
): Promise<string> {
  const total = items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);

  const { data, error } = await supabase
    .from('orders')
    .insert({ buyer_id: buyerId, shop_id: shopId, total_cents: total, note })
    .select('id')
    .single();

  if (error || !data) throw error ?? new Error('order not created');

  const { error: itemsError } = await supabase.from('order_items').insert(
    items.map((item) => ({
      order_id: data.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price_cents: item.product.priceCents,
    })),
  );

  if (itemsError) throw itemsError;
  return data.id;
}
