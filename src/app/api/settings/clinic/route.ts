import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenant_id, name, address, phone, working_hours } = body;
    if (!tenant_id) return NextResponse.json({ error: "tenant_id required" }, { status: 400 });

    const supabase = createAdminClient();

    const updateData: Record<string, string> = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (working_hours !== undefined) updateData.working_hours = working_hours;

    const { error } = await supabase
      .from("tenants")
      .update(updateData)
      .eq("id", tenant_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
