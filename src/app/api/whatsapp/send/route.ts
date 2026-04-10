import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { phone, message, tenant_id } = await req.json();

    if (!phone || !message || !tenant_id) {
      return NextResponse.json({ error: "phone, message e tenant_id obrigatórios" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Get tenant's evolution instance
    const { data: tenants } = await supabase
      .from("tenants")
      .select("evolution_instance")
      .eq("id", tenant_id)
      .limit(1);

    const instance = tenants?.[0]?.evolution_instance || process.env.EVOLUTION_INSTANCE;
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;

    if (!evolutionUrl || !evolutionKey || !instance) {
      return NextResponse.json({ error: "Evolution API não configurada" }, { status: 500 });
    }

    // Send via Evolution API
    const response = await fetch(`${evolutionUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: evolutionKey },
      body: JSON.stringify({ number: phone, text: message }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Evolution API error:", response.status, errorText);
      return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 502 });
    }

    // Save to Supabase
    await supabase.from("conversations").insert({
      tenant_id,
      phone,
      role: "assistant",
      content: message,
    });

    // Desativar IA para este lead (humano assumiu)
    await supabase
      .from("leads")
      .update({ use_ai: false })
      .eq("tenant_id", tenant_id)
      .eq("phone", phone);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send API error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
