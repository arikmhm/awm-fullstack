import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { logout } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Dashboard Admin · Mini E-Commerce" };

// Akses dijaga src/proxy.ts; isi dashboard menyusul di #8 dan #9.
export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <form action={logout}>
          <Button type="submit" variant="outline">
            <LogOut /> Logout
          </Button>
        </form>
      </header>
    </main>
  );
}
