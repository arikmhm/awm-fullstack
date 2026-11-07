"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderItemsTable, StatusBadge, dateFormat, type OrderItem } from "@/components/orders-table";
import { createClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/lib/order-status";
import { formatRupiah } from "@/lib/utils";

export type TrackedOrder = { code: string; status: OrderStatus; created_at: string; total: number; items: OrderItem[] };

const LOAD_ERROR = "Gagal memuat pesanan. Coba lagi.";

export function TrackOrder({
  initialKeyword,
  initialOrders,
  initialError,
}: {
  initialKeyword: string;
  initialOrders: TrackedOrder[] | null; // null = belum mencari
  initialError: boolean;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [error, setError] = useState(initialError ? LOAD_ERROR : "");
  const [pending, setPending] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const selected = orders?.find((o) => o.code === selectedCode) ?? null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const keyword = String(new FormData(e.currentTarget).get("keyword") ?? "").trim();
    if (!keyword) {
      setError("Isi kode pesanan atau nomor HP");
      return;
    }

    setPending(true);
    setError("");
    const { data, error } = await createClient().rpc("track_orders", { keyword });
    setPending(false);
    if (error) {
      setError(LOAD_ERROR);
      return;
    }
    setOrders(data ?? []);
    // Kode disimpan di URL agar refresh memuat status terbaru; nomor HP tidak, agar tidak tersimpan di riwayat/log.
    const isCode = keyword.toUpperCase().startsWith("ORD-");
    window.history.replaceState(null, "", isCode ? `/track?code=${encodeURIComponent(keyword)}` : "/track");
  }

  return (
    <div className="flex flex-col gap-6">
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-1.5">
        <Label htmlFor="keyword">Kode pesanan atau nomor HP</Label>
        <div className="flex gap-2">
          <Input
            id="keyword"
            name="keyword"
            defaultValue={initialKeyword}
            placeholder="ORD-XXXXXX atau 0812…"
            autoComplete="off"
            aria-invalid={!!error}
            aria-describedby={error ? "keyword-error" : undefined}
            className="h-10 flex-1"
          />
          <Button type="submit" size="lg" className="h-10" disabled={pending}>
            {pending ? "Mencari…" : "Cari"}
          </Button>
        </div>
        {error && (
          <p id="keyword-error" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </form>

      {orders &&
        (orders.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Pesanan tidak ditemukan.</p>
        ) : (
          <section aria-label="Hasil pencarian" className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Pilih pesanan untuk melihat rincian. Untuk status terbaru, cari lagi atau muat ulang halaman.
            </p>
            <ul className="flex flex-col gap-2">
              {orders.map((o) => (
                <li key={o.code}>
                  <button
                    type="button"
                    onClick={() => setSelectedCode(o.code)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="font-mono font-medium">{o.code}</span>
                      <span className="text-sm text-muted-foreground">{dateFormat.format(new Date(o.created_at))}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={o.status} />
                      <span className="text-sm tabular-nums">{formatRupiah(o.total)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelectedCode(null)}>
        {selected && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-mono">
                {selected.code} <StatusBadge status={selected.status} />
              </DialogTitle>
              <DialogDescription>{dateFormat.format(new Date(selected.created_at))}</DialogDescription>
            </DialogHeader>
            <OrderItemsTable items={selected.items} total={selected.total} />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
