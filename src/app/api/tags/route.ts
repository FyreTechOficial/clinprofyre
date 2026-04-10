import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenant_id");
  const leadId = req.nextUrl.searchParams.get("lead_id");

  if (!tenantId || !leadId) {
    return NextResponse.json({ error: "tenant_id e lead_id obrigatórios" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("lead_tags")
    .select("id, tag, color, created_at")
    .eq("tenant_id", tenantId)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tags: data ?? [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenant_id, lead_id, tag, color } = body;

    if (!tenant_id || !lead_id || !tag) {
      return NextResponse.json({ error: "tenant_id, lead_id e tag obrigatórios" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("lead_tags")
      .upsert(
        { tenant_id, lead_id, tag: tag.trim(), color: color || "#9333ea" },
        { onConflict: "lead_id,tag" }
      )
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ tag: data });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "id obrigatório" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("lead_tags")
      .delete()
      .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
