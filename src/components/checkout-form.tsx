"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { clearCart, useCart } from "@/lib/cart";
import { formatRupiah } from "@/lib/utils";

export const LAST_ORDER_KEY = "last-order";
export type OrderLine = { id: number; name: string; price: number; qty: number };
export type LastOrder = { code: string; total: number; items: OrderLine[] };

type Field = "name" | "phone" | "address";
type Errors = Partial<Record<Field, string>>;

const FIELDS: { id: Field; label: string; type?: string; inputMode?: "tel"; autoComplete: string }[] = [
  { id: "name", label: "Nama", autoComplete: "name" },
  { id: "phone", label: "Nomor HP", type: "tel", inputMode: "tel", autoComplete: "tel" },
  { id: "address", label: "Alamat", autoComplete: "street-address" },
];

// Format akhir (62xxxx) dinormalisasi oleh create_order; di sini cukup pastikan hanya angka.
function validate(v: Record<Field, string>): Errors {
  const e: Errors = {};
  if (!v.name) e.name = "Nama wajib diisi";
  if (!v.phone) e.phone = "Nomor HP wajib diisi";
  else if (!/^\+?[0-9]{9,15}$/.test(v.phone)) e.phone = "Nomor HP hanya boleh angka (9–15 digit)";
  if (!v.address) e.address = "Alamat wajib diisi";
  return e;
}

const noop = () => () => {};

export function CheckoutForm() {
  const { items, total } = useCart();
  // Keranjang ada di localStorage: tunggu hydrate agar tidak sempat tampil "kosong".
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const router = useRouter();
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const submitting = useRef(false); // state baru berlaku setelah render; ref menahan klik beruntun

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting.current) return;

    const data = new FormData(e.currentTarget);
    const values = {
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      address: String(data.get("address") ?? "").trim(),
    };
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    submitting.current = true;
    setPending(true);
    const { data: rows, error } = await createClient().rpc("create_order", {
      customer_name: values.name,
      customer_phone: values.phone,
      customer_address: values.address,
      items: items.map((i) => ({ product_id: i.id, qty: i.qty })), // harga sengaja tidak dikirim
    });
    const order = rows?.[0];

    if (error || !order) {
      submitting.current = false;
      setPending(false);
      toast.error(error?.message ?? "Gagal membuat pesanan. Coba lagi.");
      router.push("/");
      return;
    }

    const last: LastOrder = {
      code: order.code,
      total: order.total,
      items: items.map(({ id, name, price, qty }) => ({ id, name, price, qty })),
    };
    try {
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(last));
    } catch {
      // storage diblokir: kode tetap terlihat lewat toast
      toast.success(`Pesanan ${order.code} berhasil dibuat`);
    }
    clearCart();
    router.replace("/checkout/success");
  }

  if (!hydrated) return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  if (!items.length && !pending) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-muted-foreground">Keranjang masih kosong.</p>
        <Link href="/" className={buttonVariants()}>
          Kembali ke katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_20rem] md:items-start">
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        {FIELDS.map((f) => (
          <div key={f.id} className="flex flex-col gap-1.5">
            <Label htmlFor={f.id}>{f.label}</Label>
            <Input
              id={f.id}
              name={f.id}
              type={f.type ?? "text"}
              inputMode={f.inputMode}
              autoComplete={f.autoComplete}
              required
              disabled={pending}
              aria-invalid={!!errors[f.id]}
              aria-describedby={errors[f.id] ? `${f.id}-error` : undefined}
              className="h-10"
            />
            {errors[f.id] && (
              <p id={`${f.id}-error`} className="text-sm text-destructive">
                {errors[f.id]}
              </p>
            )}
          </div>
        ))}
        <Button type="submit" size="lg" className="h-10" disabled={pending}>
          {pending ? "Memproses pesanan…" : "Buat pesanan"}
        </Button>
      </form>

      <section aria-label="Ringkasan pesanan" className="rounded-xl border p-4">
        <h2 className="mb-2 font-semibold">Ringkasan</h2>
        <OrderSummary items={items} total={total} />
      </section>
    </div>
  );
}

export function OrderSummary({ items, total }: { items: OrderLine[]; total: number }) {
  return (
    <>
      <ul className="divide-y text-sm">
        {items.map((i) => (
          <li key={i.id} className="flex justify-between gap-3 py-2">
            <span className="min-w-0">
              {i.name} <span className="text-muted-foreground">× {i.qty}</span>
            </span>
            <span className="shrink-0 tabular-nums">{formatRupiah(i.price * i.qty)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
        <span>Total</span>
        <span className="tabular-nums">{formatRupiah(total)}</span>
      </div>
    </>
  );
}
