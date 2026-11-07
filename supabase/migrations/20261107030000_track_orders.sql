-- Lacak pesanan cukup dengan kode ATAU nomor HP, hasil berupa daftar (PRD FR-08, Flowchart §4, issue #11).
-- Menggantikan get_order_status(code, phone) yang mewajibkan keduanya cocok.
drop function public.get_order_status(text, text);

-- Pencarian lewat nomor HP (ERD §4).
create index orders_customer_phone_idx on public.orders (customer_phone);

-- Keyword berawalan ORD- dicari sebagai kode, selain itu sebagai nomor HP (dinormalisasi).
-- Nama, alamat, dan HP tidak dikembalikan. Tidak ketemu / keyword tidak valid = [].
create function public.track_orders(keyword text) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(t.j order by t.created_at desc), '[]'::jsonb)
  from (
    select o.created_at, jsonb_build_object(
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
    ) as j
    from public.orders o
    cross join (select upper(trim(coalesce(track_orders.keyword, ''))) as k) q
    where case
      when q.k like 'ORD-%' then o.code = q.k
      else o.customer_phone = public.normalize_phone(track_orders.keyword)
    end
    order by o.created_at desc
    limit 20
  ) t
$$;

revoke execute on function public.track_orders(text) from public, anon, authenticated;
grant execute on function public.track_orders(text) to anon, authenticated;
