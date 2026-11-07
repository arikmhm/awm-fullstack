"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatRupiah } from "@/lib/utils";

// Bentuk hasil rpc get_dashboard_stats (supabase/migrations/20261107020000_dashboard_stats.sql).
export type DashboardStats = {
  total_revenue: number;
  total_orders: number;
  items_sold: number;
  pending_orders: number;
  daily_revenue: { date: string; revenue: number }[];
  top_products: { product_name: string; qty: number }[];
};

// date dari database sudah tanggal Asia/Jakarta ("YYYY-MM-DD"); dibaca sebagai UTC agar tidak bergeser.
const dayFormat = new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", timeZone: "UTC" });
const compact = new Intl.NumberFormat("id-ID", { notation: "compact" });

const revenueConfig = { revenue: { label: "Omzet", color: "var(--chart-2)" } } satisfies ChartConfig;
const productConfig = { qty: { label: "Terjual", color: "var(--chart-2)" } } satisfies ChartConfig;

export function DashboardStats({ stats }: { stats: DashboardStats }) {
  const cards = [
    { label: "Total omzet", value: formatRupiah(stats.total_revenue), note: "Tanpa pesanan dibatalkan" },
    { label: "Jumlah pesanan", value: stats.total_orders, note: "Semua status" },
    { label: "Barang terjual", value: stats.items_sold, note: "Tanpa pesanan dibatalkan" },
    { label: "Menunggu diproses", value: stats.pending_orders, note: "Status menunggu" },
  ];
  const daily = stats.daily_revenue.map((d) => ({ ...d, label: dayFormat.format(new Date(`${d.date}T00:00:00Z`)) }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} size="sm">
            <CardHeader>
              <CardDescription>{c.label}</CardDescription>
              <CardTitle className="text-xl font-semibold tabular-nums break-all">{c.value}</CardTitle>
              <p className="text-xs text-muted-foreground">{c.note}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Omzet per hari</CardTitle>
            <CardDescription>7 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="aspect-auto h-64 w-full">
              <BarChart data={daily} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(v) => compact.format(v)} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => formatRupiah(Number(v))} />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produk terlaris</CardTitle>
            <CardDescription>Top 5 berdasarkan jumlah terjual</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.top_products.length === 0 ? (
              <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Belum ada penjualan.
              </p>
            ) : (
              <ChartContainer config={productConfig} className="aspect-auto h-64 w-full">
                <BarChart data={stats.top_products} layout="vertical" margin={{ left: 8 }} accessibilityLayer>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" dataKey="qty" allowDecimals={false} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="product_name"
                    tickLine={false}
                    axisLine={false}
                    width={110}
                    tickFormatter={(v: string) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="qty" fill="var(--color-qty)" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
