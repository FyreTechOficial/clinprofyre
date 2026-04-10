import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET: Fetch agent flows for a tenant
export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenant_id");
  if (!tenantId) return NextResponse.json({ error: "tenant_id obrigatório" }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("agent_flows")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("agent_type");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ agents: data ?? [] });
}

// PATCH: Update agent settings (toggle, delay, etc)
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { tenant_id, agent_type, ...updates } = body;
  if (!tenant_id || !agent_type) return NextResponse.json({ error: "Campos faltando" }, { status: 400 });

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("agent_flows")
    .update(updates)
    .eq("tenant_id", tenant_id)
    .eq("agent_type", agent_type);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
