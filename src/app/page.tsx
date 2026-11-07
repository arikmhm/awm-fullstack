import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { ProductImage } from "@/components/product-image";
import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";

const gridClass = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Mini E-Commerce</h1>
        <p className="text-sm text-muted-foreground">
          Pesan tanpa login, pantau pesanan secara real-time.
        </p>
      </header>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
    </main>
  );
}

// Tanpa "use cache": stok harus selalu segar setelah ada checkout.
async function ProductGrid() {
  const supabase = await createClient();
  // Filter is_active eksplisit: admin yang login lolos RLS untuk produk nonaktif.
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, stock, image_url")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return <p className="text-sm text-destructive">Gagal memuat produk. Coba muat ulang halaman.</p>;
  }
  if (!products.length) {
    return <p className="text-sm text-muted-foreground">Belum ada produk.</p>;
  }

  return (
    <div className={gridClass}>
      {products.map((p) => {
        const soldOut = p.stock === 0;
        return (
          <Card key={p.id} className="pt-0">
            <ProductImage src={p.image_url} alt={p.name} />
            <CardContent className="flex flex-1 flex-col gap-1">
              <CardTitle className="line-clamp-2">{p.name}</CardTitle>
              <p className="font-semibold">{formatRupiah(p.price)}</p>
              {soldOut ? (
                <Badge variant="destructive">Stok habis</Badge>
              ) : (
                <p className="text-xs text-muted-foreground">Stok: {p.stock}</p>
              )}
            </CardContent>
            <CardFooter>
              {/* Logika keranjang di #5 */}
              <Button className="h-auto min-h-8 w-full py-1.5 whitespace-normal" disabled={soldOut}>
                Tambah ke keranjang
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className={gridClass}>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
