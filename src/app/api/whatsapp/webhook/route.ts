import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// This webhook receives ALL messages from Evolution API.
// 1) Saves incoming patient messages to Supabase IMMEDIATELY (real-time in ClinPRO)
// 2) Forwards the FULL payload to n8n webhook (AI processing continues normally)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Log incoming payload for debugging
    console.log("[WEBHOOK] Event:", body.event, "| Instance:", body.instance, "| Keys:", Object.keys(body).join(","));

    // Forward to n8n in background (don't await — fire and forget)
    const n8nUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nUrl) {
      fetch(n8nUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => {});
    }

    // Now handle ClinPRO side
    const event = body.event ?? "";
    const data = body.data;

    const isMessageEvent = event === "MESSAGES_UPSERT" || event === "messages.upsert";
    if (!isMessageEvent || !data) {
      return NextResponse.json({ ok: true });
    }

    const key = data.key;
    const message = data.message;

    // Only save incoming messages (not our own replies)
    if (!key || key.fromMe) {
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

    if (!phone) {
      return NextResponse.json({ ok: true });
    }

    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
    if (!tenantId) {
      return NextResponse.json({ ok: true });
    }

    const supabase = createAdminClient();

    // Avoid duplicates (n8n might also save this message)
    const messageTimestamp = data.messageTimestamp;
    if (messageTimestamp) {
      const windowStart = new Date((messageTimestamp - 2) * 1000).toISOString();
      const windowEnd = new Date((messageTimestamp + 2) * 1000).toISOString();

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

    // Save to Supabase immediately
    await supabase.from("conversations").insert({
      tenant_id: tenantId,
      phone,
      role: "user",
      content,
    });

    // Update lead's last_interaction
    await supabase
      .from("leads")
      .update({ last_interaction: new Date().toISOString() })
      .eq("tenant_id", tenantId)
      .eq("phone", phone);

    return NextResponse.json({ ok: true, saved: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ClinPRO WhatsApp webhook active" });
}
