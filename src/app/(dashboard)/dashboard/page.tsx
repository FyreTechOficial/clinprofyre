"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Users,
  CalendarCheck,
  TrendingUp,
  Clock,
  MessageSquare,
  UserPlus,
  Zap,
  Activity,
  Bot,
  UserCheck,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-gray-900">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-sm mt-0.5" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { tenantId, user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      try {
        const [dashRes, notifRes, contactsRes] = await Promise.all([
          fetch(`/api/dashboard?tenant_id=${tenantId}`),
          fetch(`/api/notifications?tenant_id=${tenantId}`),
          fetch(`/api/contacts?tenant_id=${tenantId}`),
        ]);
        const d = await dashRes.json();
        const n = await notifRes.json();
        const c = await contactsRes.json();
        d.recentActivity = n.activities ?? [];
        setData(d);
        setLeads(c.contacts ?? []);
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

  // Score distribution for pie chart
  const hotCount = leads.filter((l) => l.lead_score === "quente").length;
  const warmCount = leads.filter((l) => l.lead_score === "morno").length;
  const coldCount = leads.filter((l) => l.lead_score === "frio").length;
  const scoreData = [
    { name: "Quente", value: hotCount, color: "#22c55e" },
    { name: "Morno", value: warmCount, color: "#f59e0b" },
    { name: "Frio", value: coldCount, color: "#ef4444" },
  ].filter((s) => s.value > 0);

  // Agent performance for chart
  const agentChartData = d.agents.map((a) => ({
    name: AGENT_LABELS[a.agent_type] ?? a.agent_type,
    mensagens: a.messages_today,
    total: a.executions_total,
  }));

  return (
    <div className="animate-fade-in space-y-6">
      {/* Banner */}
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
            <div key={metric.title} className="animate-slide-up group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}>
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Agent Performance Chart */}
        <Card className="lg:col-span-2 animate-slide-up !shadow-sm" style={{ animationDelay: "320ms", animationFillMode: "both" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Performance dos Agentes</CardTitle>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <span className="text-gray-500">Hoje</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-gray-500">Total</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {agentChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={agentChartData}>
                    <defs>
                      <linearGradient id="gradMsgs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9333ea" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#9333ea" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="mensagens" name="Hoje" stroke="#9333ea" strokeWidth={2.5} fill="url(#gradMsgs)" dot={{ r: 4, fill: "#9333ea", strokeWidth: 2, stroke: "#fff" }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">Sem dados de agentes</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score Pie Chart */}
        <Card className="animate-slide-up !shadow-sm" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
          <CardHeader>
            <CardTitle>Score dos Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {scoreData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={scoreData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                      {scoreData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: unknown, name: unknown) => [`${value}`, String(name)] as [string, string]} contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">Sem leads</div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {scoreData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs font-medium text-gray-600">{entry.name}</span>
                  <span className="text-xs font-bold text-gray-900">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents + Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Agents */}
        <Card className="animate-slide-up !shadow-sm" style={{ animationDelay: "480ms", animationFillMode: "both" }}>
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

        {/* Activity Timeline */}
        <Card className="lg:col-span-2 animate-slide-up !shadow-sm" style={{ animationDelay: "560ms", animationFillMode: "both" }}>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {d.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Nenhuma atividade ainda</p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gray-100" />

                <div className="space-y-4">
                  {d.recentActivity.slice(0, 10).map((item, i) => {
                    const iconConfig: Record<string, { icon: any; color: string }> = {
                      new_lead: { icon: UserPlus, color: "text-blue-600 bg-blue-50 ring-blue-200" },
                      appointment: { icon: CalendarCheck, color: "text-emerald-600 bg-emerald-50 ring-emerald-200" },
                      pipeline: { icon: TrendingUp, color: "text-brand-600 bg-brand-50 ring-brand-200" },
                      hot_lead: { icon: TrendingUp, color: "text-red-600 bg-red-50 ring-red-200" },
                    };
                    const cfg = iconConfig[item.type] ?? { icon: Bot, color: "text-gray-600 bg-gray-50 ring-gray-200" };
                    const Icon = cfg.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 relative">
                        <div className={cn("relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white", cfg.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="text-sm text-gray-700 leading-snug">{item.text}</p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {new Date(item.time).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
