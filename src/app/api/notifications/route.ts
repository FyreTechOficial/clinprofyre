import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET: Fetch recent hot leads (notifications)
export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenant_id");
  if (!tenantId) return NextResponse.json({ error: "tenant_id obrigatório" }, { status: 400 });

  const supabase = createAdminClient();

  // Get hot leads from last 24h
  const since = new Date(Date.now() - 24 * 3600000).toISOString();

  const { data: hotLeads } = await supabase
    .from("leads")
    .select("id, name, phone, lead_score, pipeline_stage, procedure_interest, last_interaction")
    .eq("tenant_id", tenantId)
    .eq("lead_score", "quente")
    .gte("last_interaction", since)
    .order("last_interaction", { ascending: false })
    .limit(10);

  // Get recent pipeline changes
  const { data: pipelineChanges } = await supabase
    .from("pipeline_history")
    .select("id, lead_id, from_stage, to_stage, changed_by, reason, created_at")
    .eq("tenant_id", tenantId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    hotLeads: hotLeads ?? [],
    pipelineChanges: pipelineChanges ?? [],
  });
}
