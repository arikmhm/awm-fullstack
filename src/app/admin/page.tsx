import type { Metadata } from "next";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { connection } from "next/server";
import { logout } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { DashboardStats, type DashboardStats as Stats } from "@/components/dashboard-stats";
import { OrdersTable, type Order } from "@/components/orders-table";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard Admin · Mini E-Commerce" };

// Akses dijaga src/proxy.ts.
export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">
      <header className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <form action={logout}>
          <Button type="submit" variant="outline">
            <LogOut /> Logout
          </Button>
        </form>
      </header>
      <section aria-labelledby="stats-title" className="mb-8 flex flex-col gap-4">
        <h2 id="stats-title" className="text-lg font-semibold">Ringkasan</h2>
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
          <Summary />
        </Suspense>
      </section>
      <section aria-labelledby="orders-title" className="flex flex-col gap-4">
        <h2 id="orders-title" className="text-lg font-semibold">Transaksi</h2>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
          <Orders />
        </Suspense>
      </section>
    </main>
  );
}

async function Summary() {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_dashboard_stats");

  if (error) {
    return <p className="text-sm text-destructive">Gagal memuat ringkasan. Coba muat ulang halaman.</p>;
  }
  return <DashboardStats stats={data as Stats} />;
}

// shortcut: semua pesanan dimuat sekaligus, tambah pagination jika data mencapai ribuan.
async function Orders() {
  // Klien Supabase memakai Date.now() untuk cek masa berlaku sesi: tunggu request asli.
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, code, created_at, customer_name, customer_phone, customer_address, total, status, order_items(id, product_name, unit_price, qty, subtotal)",
    )
    .order("created_at", { ascending: false })
    .order("id", { referencedTable: "order_items" });

  if (error) {
    return <p className="text-sm text-destructive">Gagal memuat transaksi. Coba muat ulang halaman.</p>;
  }
  return <OrdersTable orders={data as Order[]} />;
}
