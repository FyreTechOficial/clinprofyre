import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE;

    if (!evolutionUrl || !evolutionKey || !instance) {
      return NextResponse.json({ error: "Evolution API não configurada" }, { status: 500 });
    }

    // Try to connect/get QR code
    const res = await fetch(`${evolutionUrl}/instance/connect/${instance}`, {
      headers: { apikey: evolutionKey },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Evolution QR error:", res.status, text);
      return NextResponse.json({ error: "Erro ao gerar QR Code", details: text }, { status: 502 });
    }

    const data = await res.json();

    // Evolution API returns { base64: "data:image/png;base64,..." } or { code: "..." } or { pairingCode: "..." }
    const qrBase64 = data?.base64 ?? null;
    const qrCode = data?.code ?? null;
    const pairingCode = data?.pairingCode ?? null;

    return NextResponse.json({
      qrBase64,
      qrCode,
      pairingCode,
      instance,
      raw: data,
    });
  } catch (error) {
    console.error("QR code error:", error);
    return NextResponse.json({ error: "Erro ao gerar QR Code" }, { status: 500 });
  }
}
