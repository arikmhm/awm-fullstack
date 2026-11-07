import type { Metadata } from "next";
import { CheckoutSuccess } from "@/components/checkout-success";

export const metadata: Metadata = { title: "Pesanan berhasil · Mini E-Commerce" };

export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto w-full max-w-lg flex-1 p-4 sm:p-6">
      <CheckoutSuccess />
    </main>
  );
}
