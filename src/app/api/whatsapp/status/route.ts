import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE;

    if (!evolutionUrl || !evolutionKey || !instance) {
      return NextResponse.json({ error: "Evolution API não configurada" }, { status: 500 });
    }

    // Check connection state
    const res = await fetch(`${evolutionUrl}/instance/connectionState/${instance}`, {
      headers: { apikey: evolutionKey },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Evolution status error:", res.status, text);
      return NextResponse.json({
        connected: false,
        state: "error",
        instance,
        error: `Evolution API retornou ${res.status}`,
      });
    }

    const data = await res.json();

    // Evolution API returns { instance: { state: "open" | "close" | "connecting" } }
    const state = data?.instance?.state ?? data?.state ?? "unknown";
    const connected = state === "open";

    return NextResponse.json({
      connected,
      state,
      instance,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({
      connected: false,
      state: "error",
      error: "Não foi possível verificar o status",
    });
  }
}
