"use client";

import { cn } from "@/lib/utils/cn";
import { MessageCircle, Bot, Webhook, Calendar, Share2, Lock, CheckCircle2, ExternalLink } from "lucide-react";

interface Integration {
  name: string;
  description: string;
  icon: any;
  status: "available" | "coming_soon";
  color: string;
  category: string;
}

const integrations: Integration[] = [
  {
    name: "WhatsApp (Evolution API)",
    description: "Envie e receba mensagens automaticamente via WhatsApp Business",
    icon: MessageCircle,
    status: "available",
    color: "bg-emerald-50 text-emerald-600",
    category: "Comunicação",
  },
  {
    name: "Agentes IA (n8n)",
    description: "Automação de atendimento, qualificação, agendamento e follow-up",
    icon: Bot,
    status: "available",
    color: "bg-brand-50 text-brand-700",
    category: "Automação",
  },
  {
    name: "Webhooks",
    description: "Receba eventos em tempo real no seu sistema ou n8n",
    icon: Webhook,
    status: "coming_soon",
    color: "bg-amber-50 text-amber-600",
    category: "Automação",
  },
  {
    name: "Google Calendar",
    description: "Sincronize agendamentos com o Google Calendar dos profissionais",
    icon: Calendar,
    status: "coming_soon",
    color: "bg-blue-50 text-blue-600",
    category: "Agenda",
  },
  {
    name: "Meta Ads",
    description: "Conecte suas campanhas do Facebook e Instagram Ads",
    icon: Share2,
    status: "coming_soon",
    color: "bg-pink-50 text-pink-600",
    category: "Tráfego",
  },
  {
    name: "Google Ads",
    description: "Importe dados de campanhas do Google Ads automaticamente",
    icon: ExternalLink,
    status: "coming_soon",
    color: "bg-blue-50 text-blue-600",
    category: "Tráfego",
  },
  {
    name: "API Oficial WhatsApp",
    description: "Integração com a API oficial do WhatsApp Business (Cloud API)",
    icon: MessageCircle,
    status: "coming_soon",
    color: "bg-emerald-50 text-emerald-600",
    category: "Comunicação",
  },
];

export default function IntegracoesPage() {
  const available = integrations.filter((i) => i.status === "available");
  const comingSoon = integrations.filter((i) => i.status === "coming_soon");

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-[21px] font-semibold text-ink tracking-tight">Integrações</h1>
        <p className="text-[14px] text-ink-secondary mt-0.5">Conecte ferramentas e automatize seu fluxo de trabalho</p>
      </div>

      {/* Available */}
      <div>
        <h2 className="text-[13px] font-semibold text-ink-tertiary uppercase tracking-wider mb-3">Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {available.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="rounded-[18px] border border-divider bg-canvas p-5 hover:border-hairline transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-[12px]", item.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> Conectado
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold text-ink">{item.name}</h3>
                <p className="text-[12px] text-ink-secondary mt-1 leading-relaxed">{item.description}</p>
                <p className="text-[11px] text-ink-tertiary mt-2">{item.category}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Coming Soon */}
      <div>
        <h2 className="text-[13px] font-semibold text-ink-tertiary uppercase tracking-wider mb-3">Em breve</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {comingSoon.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className="rounded-[18px] border border-divider bg-canvas p-5 opacity-60 relative overflow-hidden">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-[12px]", item.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-parchment text-ink-tertiary px-2.5 py-1 text-[11px] font-semibold">
                    <Lock className="h-3 w-3" /> Em breve
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold text-ink">{item.name}</h3>
                <p className="text-[12px] text-ink-secondary mt-1 leading-relaxed">{item.description}</p>
                <p className="text-[11px] text-ink-tertiary mt-2">{item.category}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
