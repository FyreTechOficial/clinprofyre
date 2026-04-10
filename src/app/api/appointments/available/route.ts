import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Returns available slots for a given date
export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get("tenant_id");
  const date = req.nextUrl.searchParams.get("date"); // YYYY-MM-DD

  if (!tenantId || !date) {
    return NextResponse.json({ error: "tenant_id e date obrigatórios" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Get tenant config
  const { data: tenants } = await supabase
    .from("tenants")
    .select("working_hours, slot_duration_minutes")
    .eq("id", tenantId)
    .limit(1);

  const tenant = tenants?.[0];
  const slotDuration = tenant?.slot_duration_minutes ?? 30;

  // Get existing appointments for that date
  const dayStart = `${date}T00:00:00`;
  const dayEnd = `${date}T23:59:59`;

  const { data: appointments } = await supabase
    .from("appointments")
    .select("datetime, duration_minutes, status")
    .eq("tenant_id", tenantId)
    .gte("datetime", dayStart)
    .lte("datetime", dayEnd)
    .in("status", ["agendado", "confirmado"]);

  // Build occupied slots
  const occupied = (appointments ?? []).map((a) => ({
    start: new Date(a.datetime).getTime(),
    end: new Date(a.datetime).getTime() + (a.duration_minutes ?? slotDuration) * 60000,
  }));

  return NextResponse.json({
    date,
    slotDuration,
    occupiedSlots: appointments?.length ?? 0,
    appointments: (appointments ?? []).map((a) => ({
      time: new Date(a.datetime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      duration: a.duration_minutes,
      status: a.status,
    })),
  });
}
