import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenant_id");
    if (!tenantId) return NextResponse.json({ error: "tenant_id required" }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("ai_instructions")
      .select("*")
      .eq("tenant_id", tenantId)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ instructions: data || null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenant_id, ...fields } = body;
    if (!tenant_id) return NextResponse.json({ error: "tenant_id required" }, { status: 400 });

    const supabase = createAdminClient();

    // Check if record exists
    const { data: existing } = await supabase
      .from("ai_instructions")
      .select("id")
      .eq("tenant_id", tenant_id)
      .limit(1)
      .single();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("ai_instructions")
        .update(fields)
        .eq("tenant_id", tenant_id));
    } else {
      ({ error } = await supabase
        .from("ai_instructions")
        .insert({ tenant_id, ...fields }));
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
