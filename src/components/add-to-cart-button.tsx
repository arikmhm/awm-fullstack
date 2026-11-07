"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addItem, useCart, type CartProduct } from "@/lib/cart";

export function AddToCartButton({ product }: { product: CartProduct }) {
  const { items } = useCart();
  const qty = items.find((i) => i.id === product.id)?.qty ?? 0;
  const soldOut = product.stock === 0;
  const maxed = !soldOut && qty >= product.stock;

  return (
    <Button
      className="h-auto min-h-8 w-full py-1.5 whitespace-normal"
      disabled={soldOut || maxed}
      onClick={() => {
        addItem(product);
        toast.success(`${product.name} masuk keranjang`);
      }}
    >
      {maxed ? "Batas stok tercapai" : "Tambah ke keranjang"}
    </Button>
  );
}
