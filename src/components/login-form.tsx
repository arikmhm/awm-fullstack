"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  // ?error=bukan-admin dikirim proxy saat akun non-admin dikeluarkan otomatis.
  const kicked = useSearchParams().get("error") === "bukan-admin";
  const [error, action, pending] = useActionState(login, kicked ? "Akun bukan admin" : null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required disabled={pending} className="h-10" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="h-10"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="h-10" disabled={pending}>
        {pending ? "Memproses…" : "Masuk"}
      </Button>
    </form>
  );
}
