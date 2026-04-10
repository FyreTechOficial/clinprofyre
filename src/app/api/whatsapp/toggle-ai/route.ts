import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Toggle AI on/off for a specific lead
export async function POST(req: NextRequest) {
  try {
    const { tenant_id, phone, use_ai } = await req.json();

    if (!tenant_id || !phone || use_ai === undefined) {
      return NextResponse.json({ error: "Campos faltando" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("leads")
      .update({ use_ai })
      .eq("tenant_id", tenant_id)
      .eq("phone", phone);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, use_ai });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
