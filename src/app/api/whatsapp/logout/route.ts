import { NextRequest, NextResponse } from "next/server";
import { getEvolutionConfig, resolveInstance } from "@/lib/evolution";

export async function POST(req: NextRequest) {
  try {
    const { url, key } = getEvolutionConfig();
    const body = await req.json().catch(() => ({}));
    const tenantId = body.tenant_id;
    const instance = await resolveInstance(tenantId);

    if (!url || !key || !instance) {
      return NextResponse.json({ error: "Evolution API não configurada" }, { status: 500 });
    }

    const res = await fetch(`${url}/instance/logout/${instance}`, {
      method: "DELETE",
      headers: { apikey: key },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Erro ao desconectar" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao desconectar" }, { status: 500 });
  }
}
