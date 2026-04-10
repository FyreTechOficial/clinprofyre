import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "phone é obrigatório" }, { status: 400 });
  }

  const evolutionUrl = "https://evolution.fyreoficial.com.br";
  const evolutionKey = "KS2rnpBe7QXyj0pnGOOPAqBDBjC0r0UM";
  const instance = process.env.EVOLUTION_INSTANCE;

  if (!instance) {
    return NextResponse.json({ photoUrl: null });
  }

  try {
    const res = await fetch(
      `${evolutionUrl}/chat/fetchProfilePictureUrl/${instance}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: evolutionKey,
        },
        body: JSON.stringify({ number: phone }),
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { photoUrl: null },
        {
          headers: {
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        }
      );
    }

    const data = await res.json();
    const photoUrl = data?.profilePictureUrl || data?.profilePicture || data?.url || null;

    return NextResponse.json(
      { photoUrl },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      }
    );
  } catch (error) {
    console.error("Profile photo fetch error:", error);
    return NextResponse.json(
      { photoUrl: null },
      {
        headers: {
          "Cache-Control": "public, max-age=600, s-maxage=600",
        },
      }
    );
  }
}
