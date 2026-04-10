import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET: List WhatsApp groups from Evolution
export async function GET(req: NextRequest) {
  try {
    const instance = req.nextUrl.searchParams.get("instance");
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;

    if (!instance || !evolutionUrl || !evolutionKey) {
      return NextResponse.json({ error: "Configuração faltando" }, { status: 400 });
    }

    const res = await fetch(`${evolutionUrl}/group/fetchAllGroups/${instance}?getParticipants=false`, {
      headers: { apikey: evolutionKey },
    });

    if (!res.ok) {
      return NextResponse.json({ groups: [] });
    }

    const data = await res.json();
    const groups = (Array.isArray(data) ? data : []).map((g: any) => ({
      id: g.id || g.jid,
      name: g.subject || g.name || "Sem nome",
    }));

    return NextResponse.json({ groups });
  } catch {
    return NextResponse.json({ groups: [] });
  }
}

// POST: Set alert group for a tenant
export async function POST(req: NextRequest) {
  try {
    const { tenant_id, alert_group_id, alert_group_name } = await req.json();

    if (!tenant_id) {
      return NextResponse.json({ error: "tenant_id obrigatório" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("tenants")
      .update({ alert_group_id, alert_group_name })
      .eq("id", tenant_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
