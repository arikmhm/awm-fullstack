import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { connection } from "next/server";
import { TrackOrder } from "@/components/track-order";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Lacak pesanan · Mini E-Commerce" };

type SearchParams = Promise<{ code?: string | string[] }>;

export default function TrackPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 p-4 sm:p-6">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Kembali belanja
      </Link>
      <h1 className="mb-1 text-2xl font-semibold">Lacak pesanan</h1>
      <p className="mb-6 text-sm text-muted-foreground">Masukkan kode pesanan atau nomor HP yang dipakai saat checkout.</p>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
        <Track searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

// Pencarian dari ?code= dijalankan di server, jadi muat ulang halaman selalu menampilkan status terbaru.
async function Track({ searchParams }: { searchParams: SearchParams }) {
  const { code } = await searchParams;
  const keyword = typeof code === "string" ? code.trim() : "";
  if (!keyword) return <TrackOrder initialKeyword="" initialOrders={null} initialError={false} />;

  // Klien Supabase memakai Date.now() untuk cek masa berlaku sesi: tunggu request asli.
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("track_orders", { keyword });
  return (
    <TrackOrder key={keyword} initialKeyword={keyword} initialOrders={error ? null : (data ?? [])} initialError={!!error} />
  );
}
