import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Public routes — no auth needed
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/whatsapp/webhook") ||
    pathname.startsWith("/api/auth")
  ) {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Not logged in → redirect to login
  if (!session) {
    if (pathname === "/" || pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/pipeline") || pathname.startsWith("/contacts") || pathname.startsWith("/whatsapp") || pathname.startsWith("/appointments") || pathname.startsWith("/agents") || pathname.startsWith("/reports") || pathname.startsWith("/clin-ia") || pathname.startsWith("/settings")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return res;
  }

  // Logged in trying to access login → redirect to dashboard
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
