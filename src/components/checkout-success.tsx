"use client";

import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { useSyncExternalStore } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LAST_ORDER_KEY, OrderSummary, type LastOrder } from "@/components/checkout-form";

const noop = () => () => {};

function readLastOrder() {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): LastOrder | null {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function CheckoutSuccess() {
  // undefined = belum hydrate (server), null = tidak ada pesanan di sesi ini
  const raw = useSyncExternalStore(noop, readLastOrder, () => undefined);
  if (raw === undefined) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  const order = parse(raw);
  if (!order) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">Tidak ada pesanan terbaru.</p>
        <Link href="/" className={buttonVariants()}>
          Kembali ke katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <CircleCheck className="size-12 text-green-600" aria-hidden />
        <h1 className="text-2xl font-semibold">Pesanan berhasil dibuat</h1>
        <p className="text-sm text-muted-foreground">Simpan kode ini untuk melacak pesanan bersama nomor HP kamu.</p>
        <p className="mt-2 rounded-lg border bg-muted px-4 py-2 font-mono text-2xl font-bold tracking-wider select-all">
          {order.code}
        </p>
      </div>

      <section aria-label="Ringkasan pesanan" className="rounded-xl border p-4">
        <h2 className="mb-2 font-semibold">Ringkasan</h2>
        <OrderSummary items={order.items} total={order.total} />
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link href={`/track?code=${encodeURIComponent(order.code)}`} className={buttonVariants({ size: "lg", className: "h-10 sm:flex-1" })}>
          Lacak pesanan
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg", className: "h-10 sm:flex-1" }))}>
          Belanja lagi
        </Link>
      </div>
    </div>
  );
}
