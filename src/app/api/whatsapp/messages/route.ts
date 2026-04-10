import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenant_id");
    const phone = req.nextUrl.searchParams.get("phone");

    if (!tenantId || !phone) {
      return NextResponse.json({ error: "tenant_id e phone obrigatórios" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: messages, error } = await supabase
      .from("conversations")
      .select("id, phone, role, content, created_at")
      .eq("tenant_id", tenantId)
      .eq("phone", phone)
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Erro ao buscar mensagens" }, { status: 500 });
    }

    return NextResponse.json({ messages: messages ?? [] });
  } catch (error) {
    console.error("Messages API error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
