import { createBrowserClient } from "@supabase/ssr";

// Dipakai di Client Component ("use client"), misalnya untuk langganan realtime.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
