import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE;

    if (!evolutionUrl || !evolutionKey || !instance) {
      return NextResponse.json({ error: "Evolution API não configurada" }, { status: 500 });
    }

    const res = await fetch(`${evolutionUrl}/instance/logout/${instance}`, {
      method: "DELETE",
      headers: { apikey: evolutionKey },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Evolution logout error:", res.status, text);
      return NextResponse.json({ error: "Erro ao desconectar" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Erro ao desconectar" }, { status: 500 });
  }
}
