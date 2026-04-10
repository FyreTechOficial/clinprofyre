import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenant_id");
  if (!tenantId) return NextResponse.json({ error: "tenant_id obrigatório" }, { status: 400 });

  const supabase = createAdminClient();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3600000).toISOString();

  // Parallel queries
  const [leadsToday, leadsTotal, appointmentsToday, conversations, hotLeads, agents] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("created_at", todayStart),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("created_at", todayStart),
    supabase.from("conversations").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("created_at", todayStart),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("lead_score", "quente"),
    supabase.from("agent_flows").select("agent_type, enabled, messages_today, executions_total").eq("tenant_id", tenantId),
  ]);

  // Recent activity from conversations
  const { data: recentConvs } = await supabase
    .from("conversations")
    .select("phone, role, content, created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    leadsToday: leadsToday.count ?? 0,
    leadsTotal: leadsTotal.count ?? 0,
    appointmentsToday: appointmentsToday.count ?? 0,
    messagesToday: conversations.count ?? 0,
    hotLeads: hotLeads.count ?? 0,
    agents: agents.data ?? [],
    recentActivity: recentConvs ?? [],
  });
}
