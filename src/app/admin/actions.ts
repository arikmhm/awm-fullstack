"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(_prev: string | null, formData: FormData): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return "Email atau password salah";

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return "Akun bukan admin";
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
