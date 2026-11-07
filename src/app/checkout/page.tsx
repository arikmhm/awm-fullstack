import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = { title: "Checkout · Mini E-Commerce" };

export default function CheckoutPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-4 sm:p-6">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Kembali belanja
      </Link>
      <h1 className="mb-1 text-2xl font-semibold">Checkout</h1>
      <p className="mb-6 text-sm text-muted-foreground">Tanpa akun. Isi data pengiriman lalu buat pesanan.</p>
      <CheckoutForm />
    </main>
  );
}
