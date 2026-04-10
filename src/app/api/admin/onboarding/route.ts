import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clinicName, slug, email, password, ownerName, ownerPhone,
      address, clinicPhone, segment, workingHours, blackboxApiKey,
      procedures, professionals, toneOfVoice, welcomeMessage,
      systemPrompt, faq, specialRules, paymentMethods, agentConfig,
    } = body;

    if (!clinicName || !email || !password || !ownerName || !ownerPhone) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;
    const steps: { step: string; status: "ok" | "error"; detail?: string }[] = [];

    const instanceName = slug || clinicName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    // ─── 1. Criar tenant ───
    const { data: tenant, error: tenantErr } = await supabase
      .from("tenants")
      .insert({
        name: clinicName,
        slug: instanceName,
        email,
        phone: clinicPhone || ownerPhone,
        owner_phone: ownerPhone,
        address: address || "",
        working_hours: workingHours || "",
        evolution_instance: instanceName,
        blackbox_api_key: blackboxApiKey || null,
        blackbox_model: "blackboxai/anthropic/claude-sonnet-4.6",
        plan: "pro",
        plan_value: 1297,
        max_users: 3,
        max_tokens_month: 500000,
        tokens_used_month: 0,
        status: "active",
      })
      .select("id")
      .single();

    if (tenantErr || !tenant) {
      steps.push({ step: "Criar tenant", status: "error", detail: tenantErr?.message });
      return NextResponse.json({ steps, error: "Falha ao criar tenant" }, { status: 500 });
    }
    steps.push({ step: "Criar tenant", status: "ok", detail: tenant.id });
    const tenantId = tenant.id;

    // ─── 2. Criar login ───
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authErr || !authUser?.user) {
      steps.push({ step: "Criar login", status: "error", detail: authErr?.message });
    } else {
      const { error: userErr } = await supabase.from("users").insert({
        tenant_id: tenantId,
        email,
        name: ownerName,
        role: "owner",
        auth_user_id: authUser.user.id,
      });
      steps.push({ step: "Criar login", status: userErr ? "error" : "ok", detail: userErr?.message ?? `${ownerName} (${email})` });
    }

    // ─── 3. Instruções IA (completas) ───
    const { error: aiErr } = await supabase.from("ai_instructions").insert({
      tenant_id: tenantId,
      clinic_name: clinicName,
      tone_of_voice: toneOfVoice || "Profissional e acolhedor",
      system_prompt: systemPrompt || "",
      procedures: procedures || "",
      prices: "",
      working_hours: workingHours || "",
      address: address || "",
      professionals: professionals || "",
      faq: faq || "",
      special_rules: specialRules || "",
      payment_methods: paymentMethods || "",
      welcome_message: welcomeMessage || `Olá! Bem-vindo(a) à ${clinicName}. Como posso ajudar?`,
    });
    steps.push({ step: "Instruções IA", status: aiErr ? "error" : "ok", detail: aiErr?.message ?? "Completa" });

    // ─── 4. Agentes IA ───
    const defaultAgents = agentConfig ?? {
      atendimento: true, qualificacao: true, agendamento: true,
      followup: true, pos_atendimento: false,
    };

    const agentRows = Object.entries(defaultAgents).map(([agent_type, enabled]) => ({
      tenant_id: tenantId,
      agent_type,
      enabled: Boolean(enabled),
    }));

    const { error: agentErr } = await supabase.from("agent_flows").insert(agentRows);
    const activeCount = Object.values(defaultAgents).filter(Boolean).length;
    steps.push({ step: "Agentes IA", status: agentErr ? "error" : "ok", detail: agentErr?.message ?? `${activeCount} ativos` });

    // ─── 5. Instância Evolution ───
    let evolutionCreated = false;
    if (evolutionUrl && evolutionKey) {
      try {
        const evoRes = await fetch(`${evolutionUrl}/instance/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: evolutionKey },
          body: JSON.stringify({
            instanceName,
            integration: "WHATSAPP-BAILEYS",
            qrcode: true,
            groupsIgnore: true,
            alwaysOnline: false,
            readMessages: false,
            readStatus: false,
            syncFullHistory: false,
          }),
        });
        const evoData = await evoRes.json();
        if (evoRes.ok) {
          evolutionCreated = true;
          steps.push({ step: "Instância Evolution", status: "ok", detail: instanceName });
        } else {
          steps.push({ step: "Instância Evolution", status: "error", detail: JSON.stringify(evoData).slice(0, 200) });
        }
      } catch (e: any) {
        steps.push({ step: "Instância Evolution", status: "error", detail: e.message });
      }
    } else {
      steps.push({ step: "Instância Evolution", status: "error", detail: "Evolution API não configurada" });
    }

    // ─── 6. Webhook ───
    if (evolutionCreated && evolutionUrl && evolutionKey) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
        await fetch(`${evolutionUrl}/webhook/set/${instanceName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: evolutionKey },
          body: JSON.stringify({
            webhook: {
              enabled: true,
              url: `${appUrl}/api/whatsapp/webhook`,
              webhookByEvents: false,
              webhookBase64: false,
              events: ["MESSAGES_UPSERT"],
            },
          }),
        });
        steps.push({ step: "Webhook", status: "ok" });
      } catch (e: any) {
        steps.push({ step: "Webhook", status: "error", detail: e.message });
      }
    }

    return NextResponse.json({ success: true, tenantId, instanceName, steps });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Erro interno", detail: error.message }, { status: 500 });
  }
}
