import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Use admin client to bypass RLS
    const admin = createAdminClient();

    const { data: users } = await admin
      .from("users")
      .select("id, tenant_id, name, email, role")
      .eq("auth_user_id", session.user.id)
      .limit(1);

    const user = users?.[0];
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    let tenant = null;
    if (user.tenant_id) {
      const { data: tenants } = await admin
        .from("tenants")
        .select("id, name, slug, evolution_instance, owner_phone, phone, address, working_hours, alert_group_id, alert_group_name, logo_url")
        .eq("id", user.tenant_id)
        .limit(1);
      tenant = tenants?.[0] ?? null;
    }

    return NextResponse.json({ user, tenant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
