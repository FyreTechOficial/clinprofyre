"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BentoGrid, BentoCard } from "@/components/ui/magic-bento";
import {
  Users,
  CalendarCheck,
  TrendingUp,
  Clock,
  MessageSquare,
  UserPlus,
  Zap,
  Activity,
  Sparkles,
  Megaphone,
  Rocket,
  Star,
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

// ── Insights Section ──

const CHANGELOG = [
  { version: "2.4", title: "Dock Navigation estilo macOS", date: "28 Abr", icon: Rocket },
  { version: "2.3", title: "Dark Mode + Design System Apple", date: "23 Abr", icon: Star },
  { version: "2.2", title: "Follow-up reativa pacientes inativos", date: "18 Abr", icon: Zap },
  { version: "2.1", title: "Campanhas WhatsApp (em breve)", date: "15 Abr", icon: Megaphone },
  { version: "2.0", title: "Pipeline Kanban com IA", date: "10 Abr", icon: TrendingUp },
];

function InsightsSection({ data }: { data: { leadsToday: number; appointmentsToday: number; messagesToday: number; hotLeads: number } }) {
  // Mock weekly comparisons (em produção viria da API)
  const weekMetrics = [
    { label: "Leads", current: data.leadsToday * 7 || 23, previous: 18, icon: Users, color: "text-brand-700 bg-brand-50" },
    { label: "Agendamentos", current: data.appointmentsToday * 7 || 12, previous: 9, icon: CalendarCheck, color: "text-blue-600 bg-blue-50" },
    { label: "Msgs IA", current: data.messagesToday * 7 || 847, previous: 623, icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
    { label: "Conversão", current: 34, previous: 28, icon: TrendingUp, color: "text-amber-600 bg-amber-50", suffix: "%" },
  ];

  const milestones = [
    data.leadsToday * 30 >= 100 ? { text: "Você ultrapassou 100 leads este mês!", icon: Users, color: "brand-gradient" } : null,
    data.messagesToday > 50 ? { text: "Seus agentes enviaram +50 mensagens hoje!", icon: Bot, color: "bg-gradient-to-br from-emerald-500 to-emerald-600" } : null,
    { text: "Seu no-show caiu 15% com confirmação automática", icon: CalendarCheck, color: "bg-gradient-to-br from-blue-500 to-blue-600" },
    { text: "Follow-up reativou 3 pacientes esta semana", icon: Zap, color: "bg-gradient-to-br from-amber-500 to-amber-600" },
  ].filter(Boolean) as { text: string; icon: any; color: string }[];

  return (
    <div className="space-y-6">
      {/* Weekly Metrics — single row */}
      <div className="rounded-[18px] border border-divider bg-canvas overflow-hidden">
        <div className="grid grid-cols-2 xl:grid-cols-4 divide-x divide-divider">
          {weekMetrics.map((m) => {
            const Icon = m.icon;
            const diff = m.current - m.previous;
            const pct = m.previous > 0 ? Math.round((diff / m.previous) * 100) : 0;
            const isUp = diff >= 0;
            return (
              <div key={m.label} className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[12px] font-medium text-ink-tertiary">{m.label}</p>
                  <span className={cn("flex items-center gap-0.5 text-[11px] font-bold rounded-full px-2 py-0.5", isUp ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50")}>
                    {isUp ? "↑" : "↓"}{Math.abs(pct)}%
                  </span>
                </div>
                <div className="flex items-end gap-3 mt-2">
                  <p className="text-[28px] font-bold text-ink leading-none">{m.current}{m.suffix || ""}</p>
                  <p className="text-[12px] text-ink-tertiary pb-0.5">vs {m.previous}{m.suffix || ""}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conquistas + Changelog — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Conquistas */}
        <div className="lg:col-span-2 rounded-[18px] border border-divider bg-canvas p-5">
          <h3 className="text-[15px] font-semibold text-ink tracking-tight mb-4">Conquistas</h3>
          <div className="space-y-3">
            {milestones.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.text} className="flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-[12px] flex items-center justify-center text-white shrink-0", m.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-[13px] font-medium text-ink leading-snug">{m.text}</p>
                </div>
              );
            })}
            {milestones.length === 0 && <p className="text-[13px] text-ink-tertiary text-center py-4">Nenhuma conquista ainda</p>}
          </div>
        </div>

        {/* Changelog */}
        <div className="lg:col-span-3 rounded-[18px] border border-divider bg-canvas overflow-hidden">
          <div className="px-5 py-4 border-b border-divider">
            <h3 className="text-[15px] font-semibold text-ink tracking-tight">Atualizações do ClinPro</h3>
          </div>
          <div className="divide-y divide-divider">
            {CHANGELOG.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.version} className="flex items-center gap-4 px-5 py-3 hover:bg-parchment/50 transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full brand-gradient text-white shrink-0">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink">{item.title}</p>
                    <p className="text-[11px] text-ink-tertiary">{item.date}</p>
                  </div>
                  <span className="rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 text-[10px] font-semibold shrink-0">v{item.version}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[12px] border border-divider bg-canvas/95 backdrop-blur-sm px-4 py-3 shadow-xl">
      <p className="text-[13px] font-semibold text-ink">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-[13px] mt-0.5" style={{ color: entry.color }}>
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
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-brand-700" /></div>;
  }

  const d = data ?? { leadsToday: 0, leadsTotal: 0, appointmentsToday: 0, messagesToday: 0, hotLeads: 0, agents: [], recentActivity: [] };
  const activeAgents = d.agents.filter((a) => a.enabled).length;

  const hotCount = leads.filter((l) => l.lead_score === "quente").length;
  const warmCount = leads.filter((l) => l.lead_score === "morno").length;
  const coldCount = leads.filter((l) => l.lead_score === "frio").length;
  const scoreData = [
    { name: "Quente", value: hotCount, color: "#22c55e" },
    { name: "Morno", value: warmCount, color: "#f59e0b" },
    { name: "Frio", value: coldCount, color: "#ef4444" },
  ].filter((s) => s.value > 0);

  const agentChartData = d.agents.map((a) => ({
    name: AGENT_LABELS[a.agent_type] ?? a.agent_type,
    mensagens: a.messages_today,
    total: a.executions_total,
  }));

  const metrics = [
    { title: "Leads Hoje", value: d.leadsToday, icon: Users, color: "text-brand-600 bg-brand-50" },
    { title: "Agendamentos", value: d.appointmentsToday, icon: CalendarCheck, color: "text-blue-600 bg-blue-50" },
    { title: "Mensagens IA", value: d.messagesToday, icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
    { title: "Leads Quentes", value: d.hotLeads, icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-[22px] brand-gradient px-8 py-10 sm:px-10 sm:py-12">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/[0.07] blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/[0.05] blur-2xl" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-brand-400/20 blur-3xl" />
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-white/50 uppercase tracking-wider mb-1">Bem-vindo de volta</p>
            <h1 className="text-[28px] sm:text-[32px] font-bold text-white tracking-tight leading-tight">
              Olá, {user?.name?.split(" ")[0] ?? "Dr."}
            </h1>
            <p className="mt-2 text-[15px] text-white/60 max-w-md">
              Aqui está o resumo da sua clínica hoje. Acompanhe seus leads, agendamentos e agentes em tempo real.
            </p>
          </div>

          <div className="hidden sm:flex flex-col items-end gap-3">
            {activeAgents > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[13px] font-medium text-white">{activeAgents} agentes ativos</span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2">
              <span className="text-[13px] text-white/70">
                {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics — Bento Grid with spotlight */}
      <BentoGrid
        className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        enableSpotlight
        spotlightRadius={350}
        glowColor="124, 58, 237"
      >
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <BentoCard
              key={metric.title}
              enableBorderGlow
              clickEffect
              className="p-6 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] font-medium text-ink-secondary">{metric.title}</p>
                  <p className="mt-2 text-[32px] font-bold text-ink tracking-tight leading-none">{metric.value}</p>
                </div>
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-[14px]", metric.color)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </BentoCard>
          );
        })}
      </BentoGrid>

      {/* Charts Row */}
      <BentoGrid
        className="grid-cols-1 lg:grid-cols-3"
        enableSpotlight
        spotlightRadius={400}
        glowColor="124, 58, 237"
      >
        {/* Agent Performance Chart */}
        <BentoCard enableBorderGlow className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "320ms", animationFillMode: "both" }}>
          <div className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-semibold text-ink tracking-tight">Performance dos Agentes</h3>
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                  <span className="text-ink-tertiary">Hoje</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="h-64">
              {agentChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={agentChartData}>
                    <defs>
                      <linearGradient id="gradMsgs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#86868b" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#86868b" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="mensagens" name="Hoje" stroke="#7c3aed" strokeWidth={2.5} fill="url(#gradMsgs)" dot={{ r: 4, fill: "#7c3aed", strokeWidth: 2, stroke: "#fff" }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-ink-tertiary text-[14px]">Sem dados de agentes</div>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Score Pie Chart */}
        <BentoCard enableBorderGlow className="animate-slide-up" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
          <div className="p-6 pb-2">
            <h3 className="text-[17px] font-semibold text-ink tracking-tight">Score dos Leads</h3>
          </div>
          <div className="px-6 pb-6">
            <div className="h-48">
              {scoreData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={scoreData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none">
                      {scoreData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: unknown, name: unknown) => [`${value}`, String(name)] as [string, string]} contentStyle={{ borderRadius: "12px", border: "1px solid #e8e8ed" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-ink-tertiary text-[14px]">Sem leads</div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {scoreData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-[12px] font-medium text-ink-secondary">{entry.name}</span>
                  <span className="text-[12px] font-bold text-ink">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Agents + Activity */}
      <BentoGrid
        className="grid-cols-1 lg:grid-cols-3"
        enableSpotlight
        spotlightRadius={400}
        glowColor="124, 58, 237"
      >
        {/* Agents */}
        <BentoCard enableBorderGlow className="animate-slide-up" style={{ animationDelay: "480ms", animationFillMode: "both" }}>
          <div className="p-6 pb-2">
            <h3 className="text-[17px] font-semibold text-ink tracking-tight flex items-center gap-2">
              <Bot className="h-5 w-5 text-brand-700" />
              Agentes Hoje
            </h3>
          </div>
          <div className="px-6 pb-6 space-y-2">
            {d.agents.length === 0 ? (
              <p className="text-[14px] text-ink-tertiary text-center py-4">Nenhum agente configurado</p>
            ) : (
              d.agents.map((agent) => {
                const AgentIcon = AGENT_ICONS[agent.agent_type] ?? Bot;
                return (
                  <div key={agent.agent_type} className="flex items-center justify-between rounded-[12px] bg-parchment px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand-50 text-brand-700">
                        <AgentIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-ink">{AGENT_LABELS[agent.agent_type] ?? agent.agent_type}</p>
                        <div className="flex items-center gap-1">
                          <span className={cn("h-1.5 w-1.5 rounded-full", agent.enabled ? "bg-emerald-500" : "bg-ink-tertiary")} />
                          <span className="text-[10px] text-ink-tertiary">{agent.enabled ? "Online" : "Off"}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[14px] font-bold text-ink">{agent.messages_today}</span>
                  </div>
                );
              })
            )}
          </div>
        </BentoCard>

        {/* Activity Timeline */}
        <BentoCard enableBorderGlow className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "560ms", animationFillMode: "both" }}>
          <div className="p-6 pb-2">
            <h3 className="text-[17px] font-semibold text-ink tracking-tight">Atividade Recente</h3>
          </div>
          <div className="px-6 pb-6">
            {d.recentActivity.length === 0 ? (
              <p className="text-[14px] text-ink-tertiary text-center py-8">Nenhuma atividade ainda</p>
            ) : (
              <div className="relative">
                <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-divider" />
                <div className="space-y-4">
                  {d.recentActivity.slice(0, 10).map((item, i) => {
                    const iconConfig: Record<string, { icon: any; color: string }> = {
                      new_lead: { icon: UserPlus, color: "text-blue-600 bg-blue-50" },
                      appointment: { icon: CalendarCheck, color: "text-emerald-600 bg-emerald-50" },
                      pipeline: { icon: TrendingUp, color: "text-brand-700 bg-brand-50" },
                      hot_lead: { icon: TrendingUp, color: "text-red-600 bg-red-50" },
                    };
                    const cfg = iconConfig[item.type] ?? { icon: Bot, color: "text-ink-secondary bg-parchment" };
                    const Icon = cfg.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 relative">
                        <div className={cn("relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-canvas", cfg.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="text-[13px] text-ink leading-snug">{item.text}</p>
                          <p className="mt-0.5 text-[11px] text-ink-tertiary">
                            {new Date(item.time).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Divider + Stories + Updates */}
      <div className="border-t border-divider pt-6">
        <div className="mb-5">
          <h2 className="text-[17px] font-semibold text-ink tracking-tight">Fique por dentro</h2>
          <p className="text-[13px] text-ink-tertiary mt-0.5">Novidades, dicas e atualizações do ClinPro</p>
        </div>
        <InsightsSection data={d} />
      </div>
    </div>
  );
}
