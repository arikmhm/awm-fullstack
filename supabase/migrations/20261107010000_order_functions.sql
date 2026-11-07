-- Fungsi pesanan: create_order, get_order_status, update_order_status (ERD §5, Flowchart §3, §4, §7)
-- Parameter sengaja bernama sama dengan kolom agar rpc() di klien rapi; di dalam fungsi selalu ditulis
-- lengkap (nama_fungsi.param / alias.kolom) supaya tidak ambigu.

-- Normalisasi nomor HP ke 62xxxx: 0812… / +62 812-… / 812… / 62812… jadi sama. null = tidak valid.
create function public.normalize_phone(phone text) returns text
language sql immutable set search_path = ''
as $$
  select case when n ~ '^62[0-9]{8,13}$' then n end
  from (
    select case
      when d like '0%' then '62' || substr(d, 2)
      when d like '8%' then '62' || d
      else d
    end as n
    from (select regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') as d) s
  ) t
$$;

-- Checkout pelanggan. Harga & total dari database, stok dikunci dan dikurangi dalam satu transaksi.
-- items: [{"product_id": 1, "qty": 2}, ...]; field lain (mis. price) diabaikan.
create function public.create_order(
  customer_name text,
  customer_phone text,
  customer_address text,
  items jsonb
) returns table (code text, total integer)
language plpgsql security definer set search_path = ''
as $$
declare
  v_phone text := public.normalize_phone(create_order.customer_phone);
  v_ids bigint[];
  v_qtys integer[];
  v_total integer := 0;
  v_order_id uuid;
  v_code text;
  r record;
begin
  if coalesce(trim(create_order.customer_name), '') = '' then
    raise exception 'Nama wajib diisi';
  end if;
  if v_phone is null then
    raise exception 'Nomor HP tidak valid';
  end if;
  if coalesce(trim(create_order.customer_address), '') = '' then
    raise exception 'Alamat wajib diisi';
  end if;
  if create_order.items is null or jsonb_typeof(create_order.items) <> 'array'
     or jsonb_array_length(create_order.items) = 0 then
    raise exception 'Keranjang kosong';
  end if;
  if exists (
    select 1 from jsonb_array_elements(create_order.items) e
    where e ->> 'product_id' is null or coalesce((e ->> 'qty')::integer, 0) <= 0
  ) then
    raise exception 'Item pesanan tidak valid: produk dan jumlah (> 0) wajib diisi';
  end if;

  -- Gabung item dengan produk sama (order_items unik per order + produk), urut id.
  select array_agg(s.product_id order by s.product_id), array_agg(s.qty order by s.product_id)
    into v_ids, v_qtys
  from (
    select (e ->> 'product_id')::bigint as product_id, sum((e ->> 'qty')::integer)::integer as qty
    from jsonb_array_elements(create_order.items) e
    group by 1
  ) s;

  -- Kunci baris produk berurutan id agar dua checkout bersamaan tidak deadlock (NFR-04).
  perform 1 from public.products p where p.id = any (v_ids) order by p.id for update;

  for r in
    select u.id, u.qty, p.name, p.price, p.stock, p.is_active
    from unnest(v_ids, v_qtys) as u (id, qty)
    left join public.products p on p.id = u.id
    order by u.id
  loop
    if r.name is null or not r.is_active then
      raise exception 'Produk % tidak tersedia', coalesce('"' || r.name || '"', '#' || r.id);
    end if;
    if r.stock < r.qty then
      raise exception 'Stok "%" tidak cukup (sisa %)', r.name, r.stock;
    end if;
    v_total := v_total + r.price * r.qty;
  end loop;

  -- Kode ORD-XXXXXX tanpa karakter mirip (0/O, 1/I); ulang jika bentrok.
  loop
    v_code := 'ORD-' || (
      select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', floor(random() * 32)::integer + 1, 1), '')
      from generate_series(1, 6)
    );
    begin
      insert into public.orders (code, customer_name, customer_phone, customer_address, total)
      values (v_code, trim(create_order.customer_name), v_phone, trim(create_order.customer_address), v_total)
      returning id into v_order_id;
      exit;
    exception when unique_violation then
      -- kode sudah dipakai, coba lagi
    end;
  end loop;

  insert into public.order_items (order_id, product_id, product_name, unit_price, qty)
  select v_order_id, p.id, p.name, p.price, u.qty
  from unnest(v_ids, v_qtys) as u (id, qty)
  join public.products p on p.id = u.id;

  update public.products p set stock = p.stock - u.qty
  from unnest(v_ids, v_qtys) as u (id, qty)
  where p.id = u.id;

  return query select v_code, v_total;
end;
$$;

-- Lacak pesanan. null jika kode ATAU HP salah, sehingga kode tidak bisa ditebak (FR-08).
create function public.get_order_status(code text, phone text) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'code', o.code,
    'status', o.status,
    'created_at', o.created_at,
    'total', o.total,
    'items', (
      select jsonb_agg(jsonb_build_object(
        'product_name', i.product_name,
        'unit_price', i.unit_price,
        'qty', i.qty,
        'subtotal', i.subtotal
      ) order by i.id)
      from public.order_items i
      where i.order_id = o.id
    )
  )
  from public.orders o
  where o.code = upper(trim(get_order_status.code))
    and o.customer_phone = public.normalize_phone(get_order_status.phone)
$$;

-- Ubah status oleh admin. Status hanya maju; batal mengembalikan stok (PRD §6.4, Flowchart §7).
create function public.update_order_status(order_id uuid, new_status public.order_status)
returns public.order_status
language plpgsql security definer set search_path = ''
as $$
declare
  v_old public.order_status;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang boleh mengubah status pesanan';
  end if;

  select o.status into v_old
  from public.orders o
  where o.id = update_order_status.order_id
  for update;
  if not found then
    raise exception 'Pesanan tidak ditemukan';
  end if;

  if not coalesce(
    (v_old = 'pending' and update_order_status.new_status in ('processing', 'cancelled'))
    or (v_old = 'processing' and update_order_status.new_status in ('completed', 'cancelled')),
    false
  ) then
    raise exception 'Status % tidak bisa diubah ke %', v_old, coalesce(update_order_status.new_status::text, 'kosong');
  end if;

  if update_order_status.new_status = 'cancelled' then
    -- Kunci urut id seperti create_order agar tidak deadlock.
    perform 1 from public.products p
    where p.id in (select i.product_id from public.order_items i where i.order_id = update_order_status.order_id)
    order by p.id
    for update;

    update public.products p set stock = p.stock + i.qty
    from public.order_items i
    where i.order_id = update_order_status.order_id and p.id = i.product_id;
  end if;

  update public.orders o set status = update_order_status.new_status
  where o.id = update_order_status.order_id;

  return update_order_status.new_status;
end;
$$;

-- Hak akses: cabut default (PUBLIC + default privileges Supabase), lalu beri seperlunya.
revoke execute on function
  public.normalize_phone(text),
  public.create_order(text, text, text, jsonb),
  public.get_order_status(text, text),
  public.update_order_status(uuid, public.order_status)
from public, anon, authenticated;

grant execute on function
  public.create_order(text, text, text, jsonb),
  public.get_order_status(text, text)
to anon, authenticated;

-- authenticated tetap dicek is_admin() di dalam fungsi.
grant execute on function public.update_order_status(uuid, public.order_status) to authenticated;
