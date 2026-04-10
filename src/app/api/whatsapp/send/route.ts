import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { phone, message, tenant_id } = await req.json();

    if (!phone || !message || !tenant_id) {
      return NextResponse.json({ error: "phone, message e tenant_id obrigatórios" }, { status: 400 });
    }

    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE;

    if (!evolutionUrl || !evolutionKey || !instance) {
      return NextResponse.json({ error: "Evolution API não configurada" }, { status: 500 });
    }

    // Send via Evolution API
    const response = await fetch(`${evolutionUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: evolutionKey,
      },
      body: JSON.stringify({
        number: phone,
        text: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Evolution API error:", response.status, errorText);
      return NextResponse.json({ error: "Erro ao enviar mensagem" }, { status: 502 });
    }

    // Save to Supabase
    const supabase = createAdminClient();
    await supabase.from("conversations").insert({
      tenant_id,
      phone,
      role: "assistant",
      content: message,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send API error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
