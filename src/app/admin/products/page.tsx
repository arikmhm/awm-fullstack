import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { connection } from "next/server";
import { logout } from "@/app/admin/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { ProductsTable, type Product } from "@/components/products-table";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Kelola Produk · Mini E-Commerce" };

// Akses dijaga src/proxy.ts; tulis data tetap dijaga RLS is_admin().
export default function AdminProductsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/admin" aria-label="Kembali ke dashboard" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft />
          </Link>
          <h1 className="text-2xl font-semibold">Produk</h1>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline">
            <LogOut /> <span className="max-sm:sr-only">Logout</span>
          </Button>
        </form>
      </header>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
        <Products />
      </Suspense>
    </main>
  );
}

async function Products() {
  // Klien Supabase memakai Date.now() untuk cek masa berlaku sesi: tunggu request asli.
  await connection();
  const supabase = await createClient();
  // Tanpa filter is_active: RLS admin mengizinkan baca produk nonaktif.
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, stock, image_url, is_active")
    .order("name");

  if (error) {
    return <p className="text-sm text-destructive">Gagal memuat produk. Coba muat ulang halaman.</p>;
  }
  return <ProductsTable products={data as Product[]} />;
}
