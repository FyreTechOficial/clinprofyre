import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT =
  "Você é a Clin.IA, assistente inteligente para clínicas. Ajude com análises, geração de conteúdo, scripts de venda, dicas de marketing, e qualquer dúvida sobre gestão de clínicas de estética e odontologia. Responda em português brasileiro, de forma clara e útil.";

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Mensagem é obrigatória" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BLACKBOX_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key não configurada" },
        { status: 500 }
      );
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(Array.isArray(history)
        ? history.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          }))
        : []),
      { role: "user", content: message },
    ];

    const response = await fetch(
      "https://api.blackbox.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "blackboxai/minimax/minimax-free",
          messages,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Blackbox API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Erro ao consultar a IA" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const aiResponse =
      data.choices?.[0]?.message?.content ||
      "Não foi possível gerar uma resposta.";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Clin.IA API error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
