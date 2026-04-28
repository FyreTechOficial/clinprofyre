import { NextRequest, NextResponse } from "next/server";
import { getEvolutionConfig, resolveInstance } from "@/lib/evolution";

export async function GET(req: NextRequest) {
  try {
    const { url, key } = getEvolutionConfig();
    const tenantId = req.nextUrl.searchParams.get("tenant_id");
    const instance = await resolveInstance(tenantId);

    if (!url || !key || !instance) {
      return NextResponse.json({ connected: false, state: "error", error: "Evolution API não configurada ou instância não encontrada" });
    }

    const res = await fetch(`${url}/instance/connectionState/${instance}`, {
      headers: { apikey: key },
    });

    if (!res.ok) {
      return NextResponse.json({ connected: false, state: "error", instance, error: `Evolution API retornou ${res.status}` });
    }

    const data = await res.json();
    const state = data?.instance?.state ?? data?.state ?? "unknown";

    return NextResponse.json({ connected: state === "open", state, instance });
  } catch (error) {
    return NextResponse.json({ connected: false, state: "error", error: "Não foi possível verificar o status" });
  }
}
