"use client";

import { ComingSoon } from "@/components/ui/coming-soon";
import { Megaphone, Send, Users, BarChart3, Filter, Plus, Calendar } from "lucide-react";

function MockContent() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-ink">Campanhas</h1>
          <p className="text-[14px] text-ink-secondary">Envie mensagens segmentadas via WhatsApp</p>
        </div>
        <button className="rounded-full brand-gradient px-5 py-2.5 text-white text-[14px] font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nova Campanha
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { label: "Campanhas Ativas", value: "3", icon: Megaphone },
          { label: "Mensagens Enviadas", value: "1.247", icon: Send },
          { label: "Alcance Total", value: "892", icon: Users },
          { label: "Taxa de Resposta", value: "34%", icon: BarChart3 },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-[18px] bg-canvas border border-divider p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[12px] bg-brand-50 text-brand-700 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] text-ink-tertiary uppercase tracking-wider font-medium">{s.label}</p>
                  <p className="text-[22px] font-bold text-ink leading-none mt-1">{s.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button className="rounded-full bg-canvas border border-divider px-4 py-2 text-[13px] text-ink-secondary flex items-center gap-2">
          <Filter className="h-3.5 w-3.5" /> Filtrar
        </button>
        <button className="rounded-full bg-canvas border border-divider px-4 py-2 text-[13px] text-ink-secondary flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5" /> Agendar
        </button>
      </div>

      <div className="space-y-3">
        {["Reativação de Inativos (+90 dias)", "Promoção Clareamento Dental", "Follow-up Pós Consulta"].map((name, i) => (
          <div key={name} className="rounded-[18px] bg-canvas border border-divider p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-700">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-ink">{name}</p>
                <p className="text-[12px] text-ink-tertiary">{(i + 1) * 127} destinatários · Enviada há {i + 1}d</p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${i === 0 ? "bg-emerald-50 text-emerald-700" : i === 1 ? "bg-amber-50 text-amber-700" : "bg-parchment text-ink-secondary"}`}>
              {i === 0 ? "Ativa" : i === 1 ? "Agendada" : "Concluída"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CampanhasPage() {
  return (
    <ComingSoon
      title="Campanhas"
      description="Envie mensagens em massa segmentadas via WhatsApp. Crie campanhas de reativação, promoções e follow-ups automáticos."
    >
      <MockContent />
    </ComingSoon>
  );
}
