import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Forward to n8n in background
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nUrl) {
      fetch(n8nUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => {});
    }

    const event = body.event ?? "";
    const data = body.data;
    const instanceName = body.instance ?? "";

    const isMessageEvent = event === "MESSAGES_UPSERT" || event === "messages.upsert";
    if (!isMessageEvent || !data) {
      return NextResponse.json({ ok: true });
    }

    const key = data.key;
    const message = data.message;

    if (!key || key.fromMe) {
      return NextResponse.json({ ok: true });
    }

    // Ignore if no real message content
    if (!message || Object.keys(message).length === 0) {
      return NextResponse.json({ ok: true });
    }

    const remoteJid = key.remoteJid ?? "";
    if (remoteJid.includes("@g.us") || remoteJid.includes("@broadcast")) {
      return NextResponse.json({ ok: true });
    }

    const text =
      message?.conversation ??
      message?.extendedTextMessage?.text ??
      message?.imageMessage?.caption ??
      message?.videoMessage?.caption ??
      null;

    const content = text ?? "[mídia recebida]";
    const phone = remoteJid.replace("@s.whatsapp.net", "");
    const pushName = data.pushName ?? "";

    if (!phone) {
      return NextResponse.json({ ok: true });
    }

    const supabase = createAdminClient();

    // Find tenant by instance name (multi-tenant)
    let tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? "";

    if (instanceName) {
      const { data: tenants } = await supabase
        .from("tenants")
        .select("id")
        .eq("evolution_instance", instanceName)
        .eq("status", "active")
        .limit(1);

      if (tenants && tenants.length > 0) {
        tenantId = tenants[0].id;
      }
    }

    if (!tenantId) {
      return NextResponse.json({ ok: true });
    }

    // Avoid duplicates
    const messageTimestamp = data.messageTimestamp;
    if (messageTimestamp) {
      const windowStart = new Date((messageTimestamp - 3) * 1000).toISOString();
      const windowEnd = new Date((messageTimestamp + 3) * 1000).toISOString();

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("phone", phone)
        .eq("role", "user")
        .gte("created_at", windowStart)
        .lte("created_at", windowEnd)
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json({ ok: true, duplicate: true });
      }
    }

    // Save message immediately
    await supabase.from("conversations").insert({
      tenant_id: tenantId,
      phone,
      role: "user",
      content,
    });

    // Create or update lead with pushName
    const { data: existingLeads } = await supabase
      .from("leads")
      .select("id, name")
      .eq("tenant_id", tenantId)
      .eq("phone", phone)
      .limit(1);

    if (existingLeads && existingLeads.length > 0) {
      // Update last_interaction and name if we have pushName and name is just the phone
      const update: any = { last_interaction: new Date().toISOString() };
      if (pushName && (!existingLeads[0].name || existingLeads[0].name === phone)) {
        update.name = pushName;
      }
      await supabase.from("leads").update(update).eq("id", existingLeads[0].id);
    } else if (pushName || phone) {
      // Create lead immediately so it shows in contacts/pipeline
      await supabase.from("leads").insert({
        tenant_id: tenantId,
        phone,
        name: pushName || phone,
        source: "whatsapp",
        lead_score: "morno",
        pipeline_stage: "lead_novo",
        last_interaction: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true, saved: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ClinPRO WhatsApp webhook active" });
}
