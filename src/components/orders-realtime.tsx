"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// Dengarkan perubahan orders lalu ambil ulang ringkasan, grafik, dan tabel dari server.
export function OrdersRealtime() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    // Nama unik: channel() memakai ulang channel bernama sama, sedangkan removeChannel() async.
    const channel = supabase
      .channel(`orders-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "INSERT") toast(`Pesanan baru: ${payload.new.code}`);
        startTransition(() => router.refresh());
      });

    // Token sesi admin harus terpasang sebelum join; tanpa ini langganan tercatat "anon" dan RLS menyaring semua event.
    supabase.realtime.setAuth().then(() => {
      if (active) channel.subscribe();
    });

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
