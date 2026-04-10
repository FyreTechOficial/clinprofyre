import { NextRequest, NextResponse } from "next/server";

// Configures the Evolution API webhook to point to ClinPRO
// Call this once after deploying: POST /api/whatsapp/setup-webhook?url=https://your-domain.com

export async function POST(req: NextRequest) {
  try {
    const { webhookUrl } = await req.json();

    if (!webhookUrl) {
      return NextResponse.json({ error: "webhookUrl obrigatório" }, { status: 400 });
    }

    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE;

    if (!evolutionUrl || !evolutionKey || !instance) {
      return NextResponse.json({ error: "Evolution API não configurada" }, { status: 500 });
    }

    // Set webhook on Evolution instance
    const res = await fetch(`${evolutionUrl}/webhook/set/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: evolutionKey,
      },
      body: JSON.stringify({
        webhook: {
          enabled: true,
          url: `${webhookUrl}/api/whatsapp/webhook`,
          webhookByEvents: true,
          webhookBase64: false,
          events: [
            "MESSAGES_UPSERT",
          ],
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: "Erro ao configurar webhook", details: data }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: `Webhook configurado: ${webhookUrl}/api/whatsapp/webhook`,
      response: data,
    });
  } catch (error) {
    console.error("Setup webhook error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
