"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductImage } from "@/components/product-image";
import { removeItem, setQty, useCart } from "@/lib/cart";
import { formatRupiah } from "@/lib/utils";

export function CartSheet() {
  const { items, count, total } = useCart();
  const router = useRouter();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon-lg" className="relative" aria-label={`Keranjang, ${count} item`} />
        }
      >
        <ShoppingCart />
        {count > 0 && <Badge className="absolute -top-2 -right-2 min-w-5 px-1">{count}</Badge>}
      </SheetTrigger>
      <SheetContent className="data-[side=right]:w-full">
        <SheetHeader>
          <SheetTitle>Keranjang</SheetTitle>
          <SheetDescription>{count} item</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Keranjang masih kosong.</p>
          ) : (
            <ul className="divide-y">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3 py-3">
                  <div className="size-16 shrink-0 overflow-hidden rounded-md">
                    <ProductImage src={i.image_url} alt={i.name} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="line-clamp-2 font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRupiah(i.price)} · stok {i.stock}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label={`Kurangi ${i.name}`}
                          disabled={i.qty <= 1}
                          onClick={() => setQty(i.id, i.qty - 1)}
                        >
                          <Minus />
                        </Button>
                        <span className="w-8 text-center tabular-nums">{i.qty}</span>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label={`Tambah ${i.name}`}
                          disabled={i.qty >= i.stock}
                          onClick={() => setQty(i.id, i.qty + 1)}
                        >
                          <Plus />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Hapus ${i.name}`}
                          onClick={() => removeItem(i.id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <p className="font-semibold tabular-nums">{formatRupiah(i.price * i.qty)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <SheetFooter className="border-t">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatRupiah(total)}</span>
          </div>
          <Button size="lg" disabled={count === 0} onClick={() => router.push("/checkout")}>
            Checkout
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
