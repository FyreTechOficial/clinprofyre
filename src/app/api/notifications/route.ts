import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenant_id");
  if (!tenantId) return NextResponse.json({ error: "tenant_id obrigatório" }, { status: 400 });

  const supabase = createAdminClient();
  const since = new Date(Date.now() - 24 * 3600000).toISOString();

  // Hot leads
  const { data: hotLeads } = await supabase
    .from("leads")
    .select("id, name, phone, lead_score, procedure_interest, last_interaction")
    .eq("tenant_id", tenantId)
    .eq("lead_score", "quente")
    .gte("last_interaction", since)
    .order("last_interaction", { ascending: false })
    .limit(10);

  // Activity feed: new leads, appointments, score changes
  const { data: newLeads } = await supabase
    .from("leads")
    .select("id, name, phone, source, created_at")
    .eq("tenant_id", tenantId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: newAppointments } = await supabase
    .from("appointments")
    .select("id, patient_name, procedure, datetime, status, created_at")
    .eq("tenant_id", tenantId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: pipelineChanges } = await supabase
    .from("pipeline_history")
    .select("id, lead_id, from_stage, to_stage, changed_by, created_at")
    .eq("tenant_id", tenantId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(10);

  // Build activity feed
  const activities: { type: string; text: string; time: string }[] = [];

  for (const lead of newLeads ?? []) {
    activities.push({
      type: "new_lead",
      text: `Novo lead: ${lead.name || lead.phone} via ${lead.source || "WhatsApp"}`,
      time: lead.created_at,
    });
  }

  for (const appt of newAppointments ?? []) {
    activities.push({
      type: "appointment",
      text: `Agendamento: ${appt.patient_name} - ${appt.procedure || "Consulta"} (${appt.status})`,
      time: appt.created_at,
    });
  }

  for (const change of pipelineChanges ?? []) {
    activities.push({
      type: "pipeline",
      text: `Lead movido: ${change.from_stage} → ${change.to_stage} (por ${change.changed_by === "agente_ia" ? "IA" : "manual"})`,
      time: change.created_at,
    });
  }

  for (const hot of hotLeads ?? []) {
    activities.push({
      type: "hot_lead",
      text: `Lead quente: ${hot.name || hot.phone} - ${hot.procedure_interest || "Interesse geral"}`,
      time: hot.last_interaction,
    });
  }

  // Sort by time desc
  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return NextResponse.json({
    hotLeads: hotLeads ?? [],
    activities: activities.slice(0, 20),
  });
}
