import { NextRequest, NextResponse } from "next/server";
import { getEvolutionConfig, resolveInstance } from "@/lib/evolution";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  const tenantId = req.nextUrl.searchParams.get("tenant_id");

  if (!phone) {
    return NextResponse.json({ photoUrl: null });
  }

  const { url, key } = getEvolutionConfig();
  const instance = await resolveInstance(tenantId);

  if (!url || !key || !instance) {
    return NextResponse.json({ photoUrl: null });
  }

  try {
    const res = await fetch(`${url}/chat/fetchProfilePictureUrl/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key },
      body: JSON.stringify({ number: phone }),
    });

    if (!res.ok) {
      return NextResponse.json({ photoUrl: null }, { headers: { "Cache-Control": "public, max-age=3600" } });
    }

    const data = await res.json();
    const photoUrl = data?.profilePictureUrl || data?.profilePicture || data?.url || null;

    return NextResponse.json({ photoUrl }, { headers: { "Cache-Control": "public, max-age=3600" } });
  } catch {
    return NextResponse.json({ photoUrl: null }, { headers: { "Cache-Control": "public, max-age=600" } });
  }
}
