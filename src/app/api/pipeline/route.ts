import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET: Fetch leads grouped by pipeline stage
export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenant_id");
  if (!tenantId) return NextResponse.json({ error: "tenant_id obrigatório" }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id, name, phone, procedure_interest, lead_score, pipeline_stage, last_interaction, source, created_at")
    .eq("tenant_id", tenantId)
    .order("last_interaction", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data ?? [] });
}

// PATCH: Move lead to a new stage
export async function PATCH(req: NextRequest) {
  const { tenant_id, lead_id, pipeline_stage, from_stage } = await req.json();
  if (!tenant_id || !lead_id || !pipeline_stage) {
    return NextResponse.json({ error: "Campos faltando" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Update lead
  const { error } = await supabase
    .from("leads")
    .update({ pipeline_stage })
    .eq("id", lead_id)
    .eq("tenant_id", tenant_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Log pipeline history
  await supabase.from("pipeline_history").insert({
    tenant_id,
    lead_id,
    from_stage: from_stage || "desconhecido",
    to_stage: pipeline_stage,
    changed_by: "manual",
    reason: "Movido manualmente no CRM",
  });

  return NextResponse.json({ success: true });
}
