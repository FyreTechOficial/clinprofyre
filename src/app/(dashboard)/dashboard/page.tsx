"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Users,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  Clock,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  Zap,
  Activity,
  Phone,
  Bot,
  UserCheck,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface DashboardData {
  leadsToday: number;
  leadsTotal: number;
  appointmentsToday: number;
  messagesToday: number;
  hotLeads: number;
  agents: { agent_type: string; enabled: boolean; messages_today: number; executions_total: number }[];
  recentActivity: { type: string; text: string; time: string }[];
}

const AGENT_ICONS: Record<string, any> = {
  atendimento: MessageSquare,
  qualificacao: Activity,
  agendamento: CalendarCheck,
  followup: Zap,
  pos_atendimento: UserCheck,
};

const AGENT_LABELS: Record<string, string> = {
  atendimento: "Atendimento",
  qualificacao: "Qualificação",
  agendamento: "Confirmação",
  followup: "Follow-up",
  pos_atendimento: "Pós-venda",
};

export default function DashboardPage() {
  const { tenantId, user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      try {
        const [dashRes, notifRes] = await Promise.all([
          fetch(`/api/dashboard?tenant_id=${tenantId}`),
          fetch(`/api/notifications?tenant_id=${tenantId}`),
        ]);
        const d = await dashRes.json();
        const n = await notifRes.json();
        d.recentActivity = n.activities ?? [];
        setData(d);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [tenantId]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  }

  const d = data ?? { leadsToday: 0, leadsTotal: 0, appointmentsToday: 0, messagesToday: 0, hotLeads: 0, agents: [], recentActivity: [] };
  const activeAgents = d.agents.filter((a) => a.enabled).length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-6 sm:px-8 sm:py-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Olá, {user?.name?.split(" ")[0] ?? "Dr."}
            </h1>
            <p className="mt-1 text-sm text-white/70">Aqui está o resumo da sua clínica hoje</p>
          </div>
          {activeAgents > 0 && (
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-white">{activeAgents} agentes ativos</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Leads Hoje", value: d.leadsToday, icon: Users, gradient: "bg-gradient-to-br from-brand-500 to-brand-700" },
          { title: "Agendamentos Hoje", value: d.appointmentsToday, icon: CalendarCheck, gradient: "bg-gradient-to-br from-blue-500 to-blue-700" },
          { title: "Mensagens IA Hoje", value: d.messagesToday, icon: MessageSquare, gradient: "bg-gradient-to-br from-emerald-500 to-emerald-700" },
          { title: "Leads Quentes", value: d.hotLeads, icon: TrendingUp, gradient: "bg-gradient-to-br from-amber-500 to-amber-700" },
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="animate-slide-up group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
            >
              <div className={cn("absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity", metric.gradient)} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-white", metric.gradient)}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Agents */}
        <Card className="animate-slide-up !shadow-sm" style={{ animationDelay: "320ms", animationFillMode: "both" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-brand-600" />
              Agentes Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.agents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum agente configurado</p>
            ) : (
              d.agents.map((agent) => {
                const AgentIcon = AGENT_ICONS[agent.agent_type] ?? Bot;
                return (
                  <div key={agent.agent_type} className="flex items-center justify-between rounded-xl bg-gray-50/80 px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                        <AgentIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{AGENT_LABELS[agent.agent_type] ?? agent.agent_type}</p>
                        <div className="flex items-center gap-1">
                          <span className={cn("h-1.5 w-1.5 rounded-full", agent.enabled ? "bg-emerald-500" : "bg-gray-400")} />
                          <span className="text-[10px] text-gray-400">{agent.enabled ? "Online" : "Off"}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{agent.messages_today}</span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2 animate-slide-up !shadow-sm" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {d.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Nenhuma atividade ainda. Quando pacientes enviarem mensagens, aparecerá aqui.</p>
            ) : (
              <div className="space-y-3">
                {d.recentActivity.map((item, i) => {
                  const iconConfig: Record<string, { icon: any; color: string }> = {
                    new_lead: { icon: UserPlus, color: "text-blue-600 bg-blue-50" },
                    appointment: { icon: CalendarCheck, color: "text-emerald-600 bg-emerald-50" },
                    pipeline: { icon: TrendingUp, color: "text-brand-600 bg-brand-50" },
                    hot_lead: { icon: TrendingUp, color: "text-red-600 bg-red-50" },
                  };
                  const cfg = iconConfig[item.type] ?? { icon: Bot, color: "text-gray-600 bg-gray-50" };
                  const Icon = cfg.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 rounded-xl p-3 hover:bg-gray-50/80 border border-transparent hover:border-gray-100 transition-all">
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", cfg.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-700 leading-snug">{item.text}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {new Date(item.time).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
