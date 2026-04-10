import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenant_id");
  if (!tenantId) return NextResponse.json({ error: "tenant_id obrigatório" }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("datetime", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ appointments: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tenant_id, patient_name, phone, procedure, professional, datetime, duration_minutes } = body;

  if (!tenant_id || !patient_name || !datetime) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      tenant_id,
      patient_name,
      phone: phone || "",
      procedure: procedure || "",
      professional: professional || "",
      datetime,
      duration_minutes: duration_minutes || 30,
      status: "agendado",
      confirmed: false,
      reminder_sent: false,
      nps_sent: false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ appointment: data });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, tenant_id, ...updates } = body;

  if (!id || !tenant_id) {
    return NextResponse.json({ error: "id e tenant_id obrigatórios" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", id)
    .eq("tenant_id", tenant_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
