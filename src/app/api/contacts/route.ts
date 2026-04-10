import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

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
  return NextResponse.json({ contacts: data ?? [] });
}
