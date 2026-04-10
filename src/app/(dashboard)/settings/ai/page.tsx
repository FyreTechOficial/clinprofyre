"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Sparkles, Loader2, Save } from "lucide-react";

const TONE_PRESETS: { label: string; value: string }[] = [
  {
    label: "Tom Profissional",
    value:
      "Responda de forma profissional, objetiva e técnica. Use linguagem formal e direta, demonstrando expertise na área de saúde e estética.",
  },
  {
    label: "Tom Amigável",
    value:
      "Responda de forma amigável, acolhedora e descontraída. Use uma linguagem próxima e empática, como se estivesse conversando com um amigo.",
  },
  {
    label: "Tom Formal",
    value:
      "Responda de forma extremamente formal e institucional. Use linguagem culta, termos técnicos e mantenha distanciamento profissional.",
  },
];

export default function AISettingsPage() {
  const [systemInstructions, setSystemInstructions] = useState("");
  const [procedures, setProcedures] = useState("");
  const [prices, setPrices] = useState("");
  const [faq, setFaq] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string | null>(null);

  function applyPreset(preset: (typeof TONE_PRESETS)[number]) {
    setSystemInstructions(preset.value);
    setSelectedTone(preset.label);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    console.log("Saving AI settings:", {
      systemInstructions,
      procedures,
      prices,
      faq,
    });
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
  }

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Configurações da IA
          </h2>
          <p className="text-sm text-gray-500">
            Personalize como a Clin.IA se comporta para sua clínica
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
        {/* System instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instruções do Sistema
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Defina a personalidade e o tom de voz da Clin.IA
          </p>
          <textarea
            value={systemInstructions}
            onChange={(e) => {
              setSystemInstructions(e.target.value);
              setSelectedTone(null);
            }}
            rows={6}
            placeholder="Ex: Responda sempre de forma amigável e profissional. Foque em ajudar com gestão clínica, marketing e vendas..."
            className={cn(
              "w-full px-4 py-3 rounded-xl resize-y",
              "bg-white border border-gray-200",
              "text-gray-800 placeholder-gray-400 text-sm leading-relaxed",
              "outline-none transition-all duration-200",
              "focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            )}
          />

          {/* Presets */}
          <div className="flex flex-wrap gap-2 mt-3">
            {TONE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium",
                  "border transition-all duration-200",
                  selectedTone === preset.label
                    ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Procedures */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Procedimentos da Clínica
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Liste os procedimentos que sua clínica oferece para que a IA possa
            recomendá-los
          </p>
          <textarea
            value={procedures}
            onChange={(e) => setProcedures(e.target.value)}
            rows={4}
            placeholder="Ex: Botox, Preenchimento labial, Harmonização facial, Limpeza de pele..."
            className={cn(
              "w-full px-4 py-3 rounded-xl resize-y",
              "bg-white border border-gray-200",
              "text-gray-800 placeholder-gray-400 text-sm leading-relaxed",
              "outline-none transition-all duration-200",
              "focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            )}
          />
        </div>

        {/* Prices */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tabela de Preços
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Informe os preços para que a IA possa orientar sobre valores
          </p>
          <textarea
            value={prices}
            onChange={(e) => setPrices(e.target.value)}
            rows={4}
            placeholder="Ex: Botox: R$ 1.200 | Preenchimento: R$ 2.500 | Limpeza de pele: R$ 250..."
            className={cn(
              "w-full px-4 py-3 rounded-xl resize-y",
              "bg-white border border-gray-200",
              "text-gray-800 placeholder-gray-400 text-sm leading-relaxed",
              "outline-none transition-all duration-200",
              "focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            )}
          />
        </div>

        {/* FAQ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Perguntas Frequentes (FAQ)
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Adicione perguntas e respostas comuns para treinar a IA
          </p>
          <textarea
            value={faq}
            onChange={(e) => setFaq(e.target.value)}
            rows={4}
            placeholder="Ex: P: Qual o tempo de recuperação do Botox? R: O procedimento não requer tempo de recuperação..."
            className={cn(
              "w-full px-4 py-3 rounded-xl resize-y",
              "bg-white border border-gray-200",
              "text-gray-800 placeholder-gray-400 text-sm leading-relaxed",
              "outline-none transition-all duration-200",
              "focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            )}
          />
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            "px-8 py-3 rounded-xl font-semibold text-white text-sm",
            "bg-purple-600 hover:bg-purple-500",
            "shadow-md shadow-purple-200",
            "transition-all duration-200",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            "active:scale-[0.98]",
            "flex items-center gap-2"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Configurações
            </>
          )}
        </button>
      </form>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
