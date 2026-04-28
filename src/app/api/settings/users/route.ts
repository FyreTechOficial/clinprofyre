import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function getAuthAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenant_id");
    if (!tenantId) return NextResponse.json({ error: "tenant_id required" }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ users: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenant_id, email, name, role } = body;
    if (!tenant_id || !email || !role) {
      return NextResponse.json({ error: "tenant_id, email, and role required" }, { status: 400 });
    }

    const authAdmin = getAuthAdmin();
    const supabase = createAdminClient();

    // Create auth user with random password
    const tempPassword = Math.random().toString(36).slice(-12) + "A1!";
    const { data: authUser, error: authErr } = await authAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 });

    // Insert user row
    const { error: insertErr } = await supabase.from("users").insert({
      tenant_id,
      email,
      name: name || email.split("@")[0],
      role,
      auth_user_id: authUser.user.id,
    });

    if (insertErr) {
      // Rollback auth user if DB insert fails
      await authAdmin.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, tempPassword });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, tenant_id } = body;
    if (!user_id || !tenant_id) {
      return NextResponse.json({ error: "user_id and tenant_id required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get auth_user_id before deleting
    const { data: user } = await supabase
      .from("users")
      .select("auth_user_id")
      .eq("id", user_id)
      .eq("tenant_id", tenant_id)
      .single();

    // Delete user row
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", user_id)
      .eq("tenant_id", tenant_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Delete auth user
    if (user?.auth_user_id) {
      const authAdmin = getAuthAdmin();
      await authAdmin.auth.admin.deleteUser(user.auth_user_id);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
