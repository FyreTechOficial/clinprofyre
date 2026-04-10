"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Users,
  CalendarCheck,
  TrendingUp,
  MessageSquare,
  Bot,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ReportData {
  leadsToday: number;
  leadsTotal: number;
  appointmentsToday: number;
  messagesToday: number;
  hotLeads: number;
  agents: { agent_type: string; enabled: boolean; messages_today: number; executions_total: number }[];
}

interface MetricProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  delay: number;
}

function MetricCard({ title, value, icon: Icon, gradient, delay }: MetricProps) {
  return (
    <div
      className="animate-slide-up group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className={cn("absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity", gradient)} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", gradient)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

const AGENT_LABELS: Record<string, string> = {
  atendimento: "Atendimento",
  qualificacao: "Qualificação",
  agendamento: "Confirmação",
  followup: "Follow-up",
  pos_atendimento: "Pós-venda",
};

export default function ReportsPage() {
  const { tenantId } = useAuth();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    if (!tenantId) return;

    async function load() {
      try {
        const [dashRes, contactsRes] = await Promise.all([
          fetch(`/api/dashboard?tenant_id=${tenantId}`),
          fetch(`/api/contacts?tenant_id=${tenantId}`),
        ]);
        const dashData = await dashRes.json();
        const contactsData = await contactsRes.json();
        setData(dashData);
        setLeads(contactsData.contacts ?? []);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, [tenantId]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  }

  const d = data ?? { leadsToday: 0, leadsTotal: 0, appointmentsToday: 0, messagesToday: 0, hotLeads: 0, agents: [] };

  const hotCount = leads.filter((l) => l.lead_score === "quente").length;
  const warmCount = leads.filter((l) => l.lead_score === "morno").length;
  const coldCount = leads.filter((l) => l.lead_score === "frio").length;
  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? Math.round((hotCount / totalLeads) * 100) : 0;

  // Lead sources
  const sourceMap = new Map<string, number>();
  for (const lead of leads) {
    const src = lead.source || "desconhecido";
    sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
  }
  const sources = Array.from(sourceMap.entries()).sort((a, b) => b[1] - a[1]);

  // Pipeline stages
  const stageMap = new Map<string, number>();
  for (const lead of leads) {
    const stage = lead.pipeline_stage || "lead_novo";
    stageMap.set(stage, (stageMap.get(stage) || 0) + 1);
  }
  const stages = Array.from(stageMap.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="mt-1 text-sm text-gray-500">Dados reais da sua clínica</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total de Leads" value={totalLeads} icon={Users} gradient="bg-gradient-to-br from-brand-500 to-brand-700" delay={0} />
        <MetricCard title="Leads Quentes" value={hotCount} icon={TrendingUp} gradient="bg-gradient-to-br from-emerald-500 to-emerald-700" delay={80} />
        <MetricCard title="Agendamentos Hoje" value={d.appointmentsToday} icon={CalendarCheck} gradient="bg-gradient-to-br from-blue-500 to-blue-700" delay={160} />
        <MetricCard title="Mensagens IA Hoje" value={d.messagesToday} icon={MessageSquare} gradient="bg-gradient-to-br from-amber-500 to-amber-700" delay={240} />
      </div>

      {/* Agent performance */}
      {d.agents.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {d.agents.map((agent, i) => (
            <div
              key={agent.agent_type}
              className="animate-slide-up rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-center"
              style={{ animationDelay: `${300 + i * 60}ms`, animationFillMode: "both" }}
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 mb-2">
                <Bot className="h-5 w-5" />
              </div>
              <p className="text-xl font-bold text-gray-900">{agent.messages_today}</p>
              <p className="text-xs text-gray-500 mt-0.5">{AGENT_LABELS[agent.agent_type] ?? agent.agent_type}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Score distribution */}
        <Card className="!shadow-sm">
          <CardHeader><CardTitle>Score dos Leads</CardTitle></CardHeader>
          <CardContent>
            {totalLeads === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sem leads ainda</p>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Quente", count: hotCount, color: "bg-emerald-500", pct: Math.round((hotCount / totalLeads) * 100) },
                  { label: "Morno", count: warmCount, color: "bg-amber-500", pct: Math.round((warmCount / totalLeads) * 100) },
                  { label: "Frio", count: coldCount, color: "bg-red-500", pct: Math.round((coldCount / totalLeads) * 100) },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm font-bold text-gray-900">{item.count} ({item.pct}%)</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", item.color)} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads by source */}
        <Card className="!shadow-sm">
          <CardHeader><CardTitle>Leads por Origem</CardTitle></CardHeader>
          <CardContent>
            {sources.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sem dados ainda</p>
            ) : (
              <div className="space-y-3">
                {sources.map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between rounded-xl bg-gray-50/80 px-4 py-2.5">
                    <span className="text-sm font-medium text-gray-700 capitalize">{source}</span>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline distribution */}
        <Card className="!shadow-sm lg:col-span-2">
          <CardHeader><CardTitle>Distribuição no Pipeline</CardTitle></CardHeader>
          <CardContent>
            {stages.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sem leads no pipeline ainda</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stages.map(([stage, count]) => (
                  <div key={stage} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{stage.replace("_", " ")}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
