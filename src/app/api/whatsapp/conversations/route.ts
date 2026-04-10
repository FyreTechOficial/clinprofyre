import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenant_id");
    if (!tenantId) {
      return NextResponse.json({ error: "tenant_id obrigatório" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get all conversations for this tenant, ordered by most recent
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("phone, content, role, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Erro ao buscar conversas" }, { status: 500 });
    }

    // Group by phone — latest message per phone
    const phoneMap = new Map<string, {
      phone: string; lastMessage: string; lastRole: string; lastAt: string; messageCount: number;
    }>();

    for (const msg of conversations ?? []) {
      if (!phoneMap.has(msg.phone)) {
        phoneMap.set(msg.phone, {
          phone: msg.phone,
          lastMessage: msg.content,
          lastRole: msg.role,
          lastAt: msg.created_at,
          messageCount: 1,
        });
      } else {
        phoneMap.get(msg.phone)!.messageCount++;
      }
    }

    // Get lead info for names and scores
    const phones = Array.from(phoneMap.keys());
    if (phones.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    const { data: leads } = await supabase
      .from("leads")
      .select("phone, name, lead_score, pipeline_stage")
      .eq("tenant_id", tenantId)
      .in("phone", phones);

    const leadMap = new Map<string, { name: string; score: string; stage: string }>();
    for (const lead of leads ?? []) {
      leadMap.set(lead.phone, {
        name: lead.name ?? lead.phone,
        score: lead.lead_score ?? "desconhecido",
        stage: lead.pipeline_stage ?? "lead_novo",
      });
    }

    const result = Array.from(phoneMap.values())
      .map((conv) => ({
        ...conv,
        name: leadMap.get(conv.phone)?.name ?? conv.phone,
        score: leadMap.get(conv.phone)?.score ?? "desconhecido",
        stage: leadMap.get(conv.phone)?.stage ?? "lead_novo",
      }))
      .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());

    return NextResponse.json({ conversations: result });
  } catch (error) {
    console.error("Conversations API error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
