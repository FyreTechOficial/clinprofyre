import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { message, phone, instanceName, pushName } = await req.json();

    if (!message || !phone || !instanceName) {
      return NextResponse.json({ error: "message, phone e instanceName obrigatórios" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "");

    // Build Evolution-like payload
    const evolutionPayload = {
      event: "messages.upsert",
      instance: instanceName,
      data: {
        key: {
          remoteJid: `${cleanPhone}@s.whatsapp.net`,
          fromMe: false,
          id: `TEST_${Date.now()}`,
        },
        pushName: pushName || "Paciente Teste",
        status: "DELIVERY_ACK",
        message: { conversation: message },
        messageType: "conversation",
        messageTimestamp: Math.floor(Date.now() / 1000),
        source: "test",
      },
    };

    // Send to n8n
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (!n8nUrl) {
      return NextResponse.json({ error: "N8N_WEBHOOK_URL não configurado" }, { status: 500 });
    }

    const startTime = Date.now();

    await fetch(n8nUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evolutionPayload),
    });

    // Wait for n8n to process and save to Supabase
    // Poll for the AI response (max 30s, check every 2s)
    const supabase = createAdminClient();

    // Get tenant_id from instance
    const { data: tenants } = await supabase
      .from("tenants")
      .select("id")
      .eq("evolution_instance", instanceName)
      .limit(1);

    const tenantId = tenants?.[0]?.id;
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant não encontrado para instância: " + instanceName }, { status: 404 });
    }

    // Poll for AI response
    let aiMessages: string[] = [];
    let attempts = 0;
    const maxAttempts = 15; // 30 seconds max

    while (attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;

      // Get the most recent assistant messages for this phone after our message
      const { data: msgs } = await supabase
        .from("conversations")
        .select("content, role, created_at")
        .eq("tenant_id", tenantId)
        .eq("phone", cleanPhone)
        .eq("role", "assistant")
        .order("created_at", { ascending: false })
        .limit(5);

      // Check if there are new assistant messages after we sent
      const recentAiMsgs = (msgs ?? []).filter((m) => {
        const msgTime = new Date(m.created_at).getTime();
        return msgTime >= startTime - 5000; // Messages from around when we sent
      });

      if (recentAiMsgs.length > 0) {
        aiMessages = recentAiMsgs.reverse().map((m) => m.content);
        break;
      }
    }

    const elapsed = Date.now() - startTime;

    // Also get lead info
    const { data: leads } = await supabase
      .from("leads")
      .select("name, lead_score, pipeline_stage, procedure_interest")
      .eq("tenant_id", tenantId)
      .eq("phone", cleanPhone)
      .limit(1);

    const lead = leads?.[0];

    return NextResponse.json({
      success: true,
      elapsed: `${elapsed}ms`,
      aiMessages: aiMessages.length > 0 ? aiMessages : ["[Aguardando resposta do agente... verifique o n8n]"],
      lead: lead ? {
        name: lead.name,
        score: lead.lead_score,
        stage: lead.pipeline_stage,
        interest: lead.procedure_interest,
      } : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
