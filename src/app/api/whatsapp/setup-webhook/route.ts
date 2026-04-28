import { NextRequest, NextResponse } from "next/server";
import { getEvolutionConfig, resolveInstance } from "@/lib/evolution";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { webhookUrl, tenant_id } = body;

    if (!webhookUrl) {
      return NextResponse.json({ error: "webhookUrl obrigatório" }, { status: 400 });
    }

    const { url, key } = getEvolutionConfig();
    const instance = await resolveInstance(tenant_id);

    if (!url || !key || !instance) {
      return NextResponse.json({ error: "Evolution API não configurada" }, { status: 500 });
    }

    const res = await fetch(`${url}/webhook/set/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({
        webhook: {
          enabled: true,
          url: `${webhookUrl}/api/whatsapp/webhook`,
          webhookByEvents: true,
          webhookBase64: false,
          events: ["MESSAGES_UPSERT"],
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: "Erro ao configurar webhook", details: data }, { status: 502 });
    }

    return NextResponse.json({ success: true, message: `Webhook configurado: ${webhookUrl}/api/whatsapp/webhook` });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
