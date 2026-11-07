-- Skema dasar: tabel, index, trigger, is_admin(), RLS, realtime (ERD §1–§5)

-- Tipe
create type public.order_status as enum ('pending', 'processing', 'completed', 'cancelled');
create type public.app_role as enum ('admin');

-- Tabel
create table public.products (
  id bigint generated always as identity primary key,
  name text not null,
  price integer not null check (price >= 0),
  stock integer not null check (stock >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_name text not null,
  customer_phone text not null check (customer_phone ~ '^[0-9]+$'),
  customer_address text not null,
  total integer not null check (total >= 0),
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id bigint not null references public.products (id) on delete restrict,
  product_name text not null,
  unit_price integer not null check (unit_price >= 0),
  qty integer not null check (qty > 0),
  subtotal integer generated always as (unit_price * qty) stored,
  unique (order_id, product_id)
);

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now()
);

-- Index (ERD §4). orders.code dan order_items.order_id sudah ter-index lewat constraint unique.
create index orders_created_at_idx on public.orders (created_at);
create index orders_status_idx on public.orders (status);
create index order_items_product_id_idx on public.order_items (product_id);

-- updated_at otomatis
create function public.set_updated_at() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- Pemeriksa role admin (ERD §5)
create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  )
$$;

-- RLS (ERD §5). user_roles sengaja tanpa policy: tertutup untuk semua user.
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.user_roles enable row level security;

create policy "publik baca produk aktif" on public.products
  for select to anon, authenticated using (is_active = true);
create policy "admin baca semua produk" on public.products
  for select to authenticated using ((select public.is_admin()));
create policy "admin tambah produk" on public.products
  for insert to authenticated with check ((select public.is_admin()));
create policy "admin ubah produk" on public.products
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin baca orders" on public.orders
  for select to authenticated using ((select public.is_admin()));
create policy "admin ubah orders" on public.orders
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "admin baca order_items" on public.order_items
  for select to authenticated using ((select public.is_admin()));

-- Realtime: dashboard admin menerima perubahan orders (tetap tunduk pada RLS)
alter publication supabase_realtime add table public.orders;
