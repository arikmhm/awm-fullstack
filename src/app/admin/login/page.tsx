import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Login Admin · Mini E-Commerce" };

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center p-4 sm:p-6">
      <h1 className="mb-1 text-2xl font-semibold">Login Admin</h1>
      <p className="mb-6 text-sm text-muted-foreground">Masuk untuk membuka dashboard.</p>
      {/* useSearchParams butuh Suspense (cacheComponents) */}
      <Suspense fallback={<div className="h-56 animate-pulse rounded-xl bg-muted" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
