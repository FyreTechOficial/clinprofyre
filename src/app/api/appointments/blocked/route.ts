import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenant_id");
  if (!tenantId) return NextResponse.json({ error: "tenant_id obrigatório" }, { status: 400 });

  const date = req.nextUrl.searchParams.get("date");
  const supabase = createAdminClient();

  let query = supabase
    .from("blocked_slots")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("date", { ascending: true });

  if (date) {
    query = query.eq("date", date);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blocked_slots: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tenant_id, date, start_time, end_time, all_day, reason } = body;

  if (!tenant_id || !date) {
    return NextResponse.json({ error: "tenant_id e date são obrigatórios" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("blocked_slots")
    .insert({
      tenant_id,
      date,
      start_time: all_day ? null : start_time,
      end_time: all_day ? null : end_time,
      all_day: all_day || false,
      reason: reason || "",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blocked_slot: data });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id, tenant_id } = body;

  if (!id || !tenant_id) {
    return NextResponse.json({ error: "id e tenant_id são obrigatórios" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("blocked_slots")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenant_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
