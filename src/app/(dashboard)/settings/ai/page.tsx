"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Sparkles, Loader2, Save } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

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
  const { tenantId } = useAuth();
  const [systemInstructions, setSystemInstructions] = useState("");
  const [procedures, setProcedures] = useState("");
  const [prices, setPrices] = useState("");
  const [faq, setFaq] = useState("");
  const [specialRules, setSpecialRules] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTone, setSelectedTone] = useState<string | null>(null);

  // Load existing AI instructions
  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      try {
        const res = await fetch(`/api/settings/ai?tenant_id=${tenantId}`);
        const data = await res.json();
        if (data.instructions) {
          const inst = data.instructions;
          setSystemInstructions(inst.system_prompt || "");
          setProcedures(inst.procedures || "");
          setPrices(inst.prices || "");
          setFaq(inst.faq || "");
          setSpecialRules(inst.special_rules || "");
          if (inst.tone_of_voice) {
            const match = TONE_PRESETS.find((p) => inst.system_prompt?.includes(p.value.slice(0, 30)));
            if (match) setSelectedTone(match.label);
          }
        }
      } catch {} finally {
        setIsLoading(false);
      }
    }
    load();
  }, [tenantId]);

  function applyPreset(preset: (typeof TONE_PRESETS)[number]) {
    setSystemInstructions(preset.value);
    setSelectedTone(preset.label);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenantId,
          system_prompt: systemInstructions,
          procedures,
          prices,
          faq,
          special_rules: specialRules,
          tone_of_voice: selectedTone || "Profissional e acolhedor",
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      toast.success("Configurações da IA salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-brand-700" /></div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink">Configurações da IA</h2>
          <p className="text-sm text-ink-secondary">Personalize como a Clin.IA se comporta para sua clínica</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Instruções do Sistema</label>
          <p className="text-xs text-ink-tertiary mb-3">Defina a personalidade e o tom de voz da Clin.IA</p>
          <textarea value={systemInstructions} onChange={(e) => { setSystemInstructions(e.target.value); setSelectedTone(null); }} rows={6} placeholder="Ex: Responda sempre de forma amigável e profissional..." className={cn("w-full px-4 py-3 rounded-xl resize-y", "bg-canvas border border-divider", "text-ink placeholder:text-ink-tertiary text-sm leading-relaxed", "outline-none transition-all duration-200", "focus:border-brand-300 focus:ring-2 focus:ring-brand-100")} />
          <div className="flex flex-wrap gap-2 mt-3">
            {TONE_PRESETS.map((preset) => (
              <button key={preset.label} type="button" onClick={() => applyPreset(preset)} className={cn("px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200", selectedTone === preset.label ? "brand-gradient text-white border-transparent" : "bg-canvas text-ink-secondary border-divider hover:border-brand-300 hover:text-brand-600")}>{preset.label}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Procedimentos da Clínica</label>
          <p className="text-xs text-ink-tertiary mb-3">Liste os procedimentos que sua clínica oferece</p>
          <textarea value={procedures} onChange={(e) => setProcedures(e.target.value)} rows={4} placeholder="Ex: Implante (30min), Clareamento (1h), Limpeza (40min)..." className={cn("w-full px-4 py-3 rounded-xl resize-y bg-canvas border border-divider text-ink placeholder:text-ink-tertiary text-sm leading-relaxed outline-none transition-all duration-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-100")} />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Tabela de Preços</label>
          <p className="text-xs text-ink-tertiary mb-3">Informe os preços para que a IA possa orientar sobre valores</p>
          <textarea value={prices} onChange={(e) => setPrices(e.target.value)} rows={4} placeholder="Ex: Implante: R$ 3.500 | Clareamento: R$ 800..." className={cn("w-full px-4 py-3 rounded-xl resize-y bg-canvas border border-divider text-ink placeholder:text-ink-tertiary text-sm leading-relaxed outline-none transition-all duration-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-100")} />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Perguntas Frequentes (FAQ)</label>
          <p className="text-xs text-ink-tertiary mb-3">Adicione perguntas e respostas comuns para treinar a IA</p>
          <textarea value={faq} onChange={(e) => setFaq(e.target.value)} rows={4} placeholder="Ex: P: Aceita convênio? R: Sim, trabalhamos com Unimed e Amil..." className={cn("w-full px-4 py-3 rounded-xl resize-y bg-canvas border border-divider text-ink placeholder:text-ink-tertiary text-sm leading-relaxed outline-none transition-all duration-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-100")} />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Regras Especiais</label>
          <p className="text-xs text-ink-tertiary mb-3">Regras que a IA deve seguir (ex: nunca dar diagnóstico, sempre encaminhar emergências)</p>
          <textarea value={specialRules} onChange={(e) => setSpecialRules(e.target.value)} rows={3} placeholder="Ex: Nunca dê diagnósticos. Sempre encaminhe emergências para o telefone da clínica..." className={cn("w-full px-4 py-3 rounded-xl resize-y bg-canvas border border-divider text-ink placeholder:text-ink-tertiary text-sm leading-relaxed outline-none transition-all duration-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-100")} />
        </div>

        <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-full brand-gradient px-6 py-2.5 text-[14px] font-medium text-white hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50">
          {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Save className="w-4 h-4" /> Salvar Configurações</>}
        </button>
      </form>
    </div>
  );
}
