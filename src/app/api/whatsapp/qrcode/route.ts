import { NextRequest, NextResponse } from "next/server";
import { getEvolutionConfig, resolveInstance } from "@/lib/evolution";

export async function GET(req: NextRequest) {
  try {
    const { url, key } = getEvolutionConfig();
    const tenantId = req.nextUrl.searchParams.get("tenant_id");
    const instance = await resolveInstance(tenantId);

    if (!url || !key || !instance) {
      return NextResponse.json({ error: "Evolution API não configurada ou instância não encontrada" }, { status: 500 });
    }

    const res = await fetch(`${url}/instance/connect/${instance}`, {
      headers: { apikey: key },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: "Erro ao gerar QR Code", details: text }, { status: 502 });
    }

    const data = await res.json();

    return NextResponse.json({
      qrBase64: data?.base64 ?? null,
      qrCode: data?.code ?? null,
      pairingCode: data?.pairingCode ?? null,
      instance,
      raw: data,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao gerar QR Code" }, { status: 500 });
  }
}
