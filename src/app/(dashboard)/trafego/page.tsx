"use client";

import { ComingSoon } from "@/components/ui/coming-soon";
import { TrendingUp, DollarSign, MousePointerClick, Eye, BarChart3, Target } from "lucide-react";

function MockContent() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-ink">Dashboard de Tráfego</h1>
          <p className="text-[14px] text-ink-secondary">Acompanhe suas campanhas de tráfego pago</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { label: "Investido", value: "R$ 2.450", icon: DollarSign },
          { label: "Cliques", value: "3.891", icon: MousePointerClick },
          { label: "Impressões", value: "48.2K", icon: Eye },
          { label: "Conversões", value: "127", icon: Target },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-[18px] bg-canvas border border-divider p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[12px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-[18px] bg-canvas border border-divider p-6 h-64">
          <h3 className="text-[15px] font-semibold text-ink mb-4">CPC por Campanha</h3>
          <div className="h-40 bg-parchment rounded-[12px] flex items-center justify-center">
            <BarChart3 className="h-12 w-12 text-ink-tertiary" />
          </div>
        </div>
        <div className="rounded-[18px] bg-canvas border border-divider p-6 h-64">
          <h3 className="text-[15px] font-semibold text-ink mb-4">ROI por Canal</h3>
          <div className="h-40 bg-parchment rounded-[12px] flex items-center justify-center">
            <TrendingUp className="h-12 w-12 text-ink-tertiary" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {["Meta Ads — Implante Dentário", "Google Ads — Clareamento", "Meta Ads — Ortodontia"].map((name, i) => (
          <div key={name} className="rounded-[18px] bg-canvas border border-divider p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-ink">{name}</p>
                <p className="text-[12px] text-ink-tertiary">R$ {(i + 1) * 340}/mês · CPC R$ {(1.2 + i * 0.3).toFixed(2)}</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-[11px] font-semibold">Ativa</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrafegoPage() {
  return (
    <ComingSoon
      title="Dashboard de Tráfego"
      description="Acompanhe o desempenho das suas campanhas de tráfego pago. Integração com Meta Ads e Google Ads em breve."
    >
      <MockContent />
    </ComingSoon>
  );
}
