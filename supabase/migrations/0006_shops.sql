-- Shops for Premium Hosts.
--
-- Same money rule as events (§9): KousKous never holds the funds. A sale
-- is charged on the host's own connected Stripe account, so there is no
-- balance, no wallet and no payout table here — only a record of what was
-- ordered and the id of the payment that happened elsewhere.
--
-- Two gates, same as paid events (§2.3): an approved host may open a shop
-- and list products, but may only sell once her payment account is
-- verified. They are independent on purpose.

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  -- One shop per host; the unique constraint is what enforces it.
  host_id uuid not null unique references public.profiles (id) on delete cascade,
  name text not null,
  description text not null default '',
  logo_path text,
  -- Place id, so the location filter reaches shops too.
  location text,
  /**
   * Closed shops stay visible to their owner and disappear for everyone
   * else — a host going on holiday should not have to delete her
   * products.
   */
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops (id) on delete cascade,
  title text not null,
  description text not null default '',
  -- Cents, so no floating point money.
  price_cents integer not null check (price_cents >= 0),
  -- Null means made to order; zero means sold out.
  stock integer,
  category_id text,
  subcategory_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  position integer not null default 0
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  shop_id uuid not null references public.shops (id) on delete cascade,
  total_cents integer not null check (total_cents >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunded')),
  /**
   * The payment lives on the host's Stripe account. Storing only its id
   * keeps KousKous out of the money entirely: there is nothing here to
   * reconcile, hold or pay out.
   */
  stripe_payment_intent_id text,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  -- Copied at purchase so a later price change cannot rewrite history.
  unit_price_cents integer not null check (unit_price_cents >= 0)
);

create index if not exists products_shop_idx on public.products (shop_id, created_at desc);
create index if not exists shops_location_idx on public.shops (location);
create index if not exists orders_buyer_idx on public.orders (buyer_id, created_at desc);
create index if not exists orders_shop_idx on public.orders (shop_id, created_at desc);

-- ---------------------------------------------------------------------
-- Who may open a shop
-- ---------------------------------------------------------------------

create or replace function public.can_run_shop(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select (is_host and community_approved) or is_official
     from public.profiles where id = uid),
    false
  );
$$;

create or replace function public.owns_shop(shop uuid, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.shops s where s.id = shop and s.host_id = uid);
$$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.shops enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Shopping is open to every account, like events run by hosts.
drop policy if exists shops_select on public.shops;
create policy shops_select on public.shops
  for select to authenticated
  using (
    (is_open and not public.is_blocked_pair(auth.uid(), host_id))
    or host_id = auth.uid()
  );

drop policy if exists shops_write_own on public.shops;
create policy shops_write_own on public.shops
  for all to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid() and public.can_run_shop(auth.uid()));

drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select to authenticated
  using (
    exists (
      select 1 from public.shops s
      where s.id = shop_id
        and (
          (s.is_open and is_active and not public.is_blocked_pair(auth.uid(), s.host_id))
          or s.host_id = auth.uid()
        )
    )
  );

drop policy if exists products_write_own on public.products;
create policy products_write_own on public.products
  for all to authenticated
  using (public.owns_shop(shop_id, auth.uid()))
  with check (public.owns_shop(shop_id, auth.uid()) and public.can_run_shop(auth.uid()));

drop policy if exists product_media_select on public.product_media;
create policy product_media_select on public.product_media
  for select to authenticated
  using (exists (select 1 from public.products p where p.id = product_id));

drop policy if exists product_media_write_own on public.product_media;
create policy product_media_write_own on public.product_media
  for all to authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and public.owns_shop(p.shop_id, auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id and public.owns_shop(p.shop_id, auth.uid())
    )
  );

-- An order is visible to the woman who placed it and to the shop it was
-- placed with. Nobody else, ever.
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders
  for select to authenticated
  using (buyer_id = auth.uid() or public.owns_shop(shop_id, auth.uid()));

-- Ordering requires the shop to be able to take money: an approved host
-- whose payment account is not verified can list products but not sell.
drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders
  for insert to authenticated
  with check (
    buyer_id = auth.uid()
    and exists (
      select 1 from public.shops s
      join public.profiles p on p.id = s.host_id
      where s.id = shop_id
        and s.is_open
        and (p.payment_verified or p.is_official)
    )
  );

-- Only the shop moves an order along; the buyer may cancel her own while
-- it is still pending.
drop policy if exists orders_update on public.orders;
create policy orders_update on public.orders
  for update to authenticated
  using (
    public.owns_shop(shop_id, auth.uid())
    or (buyer_id = auth.uid() and status = 'pending')
  )
  with check (
    public.owns_shop(shop_id, auth.uid())
    or (buyer_id = auth.uid() and status = 'cancelled')
  );

drop policy if exists order_items_select on public.order_items;
create policy order_items_select on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.buyer_id = auth.uid() or public.owns_shop(o.shop_id, auth.uid()))
    )
  );

drop policy if exists order_items_insert on public.order_items;
create policy order_items_insert on public.order_items
  for insert to authenticated
  with check (
    exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid())
  );
