import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const LOGIN = "/admin/login";

// Lapis pertama proteksi admin (Flowchart §5); data tetap dijaga RLS lewat is_admin().
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Redirect harus membawa cookie sesi yang baru disegarkan/dihapus.
  const redirect = (path: string) => {
    const res = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  const onLogin = request.nextUrl.pathname === LOGIN;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return onLogin ? response : redirect(LOGIN);

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return redirect(`${LOGIN}?error=bukan-admin`);
  }

  return onLogin ? redirect("/admin") : response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
