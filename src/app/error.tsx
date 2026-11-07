"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Penangkap error tak terduga: pengguna melihat pesan + tombol coba lagi, bukan halaman putih.
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-2 p-4 text-center sm:p-6">
      <h1 className="text-2xl font-semibold">Terjadi kesalahan</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Halaman gagal dimuat. Periksa koneksi internet Anda lalu coba lagi.
      </p>
      <Button size="lg" onClick={() => retry()}>
        Coba lagi
      </Button>
    </main>
  );
}
