import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/login", "/api/"];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip auth for public paths and API routes
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname === "/login") {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  try {
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

    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } catch {
    // If auth check fails, redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
