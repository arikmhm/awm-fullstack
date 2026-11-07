-- Statistik dashboard admin (PRD FR-11, FR-12; ERD §5). Pesanan cancelled tidak dihitung sebagai omzet,
-- barang terjual, maupun grafik; jumlah pesanan tetap menghitung semua agar sama dengan tabel transaksi.
create function public.get_dashboard_stats() returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  -- Hari dihitung di zona toko, sama dengan tampilan tabel transaksi.
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang boleh melihat statistik';
  end if;

  return jsonb_build_object(
    'total_revenue', (
      select coalesce(sum(o.total), 0) from public.orders o where o.status <> 'cancelled'
    ),
    'total_orders', (select count(*) from public.orders o),
    'pending_orders', (select count(*) from public.orders o where o.status = 'pending'),
    'items_sold', (
      select coalesce(sum(i.qty), 0)
      from public.order_items i
      join public.orders o on o.id = i.order_id
      where o.status <> 'cancelled'
    ),
    -- 7 hari terakhir termasuk hari ini; hari tanpa penjualan tetap muncul dengan 0.
    'daily_revenue', (
      select jsonb_agg(jsonb_build_object('date', d.day, 'revenue', coalesce(r.revenue, 0)) order by d.day)
      from (select v_today - g.n as day from generate_series(0, 6) as g (n)) d
      left join (
        select (o.created_at at time zone 'Asia/Jakarta')::date as day, sum(o.total) as revenue
        from public.orders o
        where o.status <> 'cancelled'
          and o.created_at >= (v_today - 6)::timestamp at time zone 'Asia/Jakarta'
        group by 1
      ) r on r.day = d.day
    ),
    -- Top 5 per qty, dikelompokkan per produk; nama dari snapshot pesanan terbaru.
    'top_products', (
      select coalesce(jsonb_agg(jsonb_build_object('product_name', t.product_name, 'qty', t.qty)
                                order by t.qty desc, t.product_name), '[]'::jsonb)
      from (
        select (array_agg(i.product_name order by o.created_at desc))[1] as product_name, sum(i.qty) as qty
        from public.order_items i
        join public.orders o on o.id = i.order_id
        where o.status <> 'cancelled'
        group by i.product_id
        order by 2 desc, i.product_id
        limit 5
      ) t
    )
  );
end;
$$;

revoke execute on function public.get_dashboard_stats() from public, anon, authenticated;
-- authenticated tetap dicek is_admin() di dalam fungsi.
grant execute on function public.get_dashboard_stats() to authenticated;
