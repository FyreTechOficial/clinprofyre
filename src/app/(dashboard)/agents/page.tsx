"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import {
  Bot,
  MessageSquare,
  CalendarCheck,
  Calendar,
  Zap,
  Star,
  UserCheck,
  Activity,
  Settings,
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Smartphone,
  X,
  Loader2,
  TrendingUp,
  BarChart3,
  Shield,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface AgentFlow {
  id: string;
  tenant_id: string;
  agent_type: string;
  enabled: boolean;
  last_execution: string | null;
  executions_total: number;
  messages_today: number;
  success_rate: number;
  typing_delay_min?: number;
  typing_delay_max?: number;
  delay_between_msgs?: number;
  max_msgs_per_response?: number;
  config?: any;
}

const AGENT_CONFIG: Record<string, { name: string; description: string; icon: any; color: string; colorBg: string; trigger: string }> = {
  atendimento: {
    name: "Atendimento 24/7",
    description: "Responde mensagens de texto e áudio no WhatsApp automaticamente",
    icon: MessageSquare,
    color: "from-brand-500 to-brand-700",
    colorBg: "bg-brand-50 text-brand-700",
    trigger: "Webhook (tempo real)",
  },
  qualificacao: {
    name: "Qualificação",
    description: "Classifica leads, preenche cadastro e identifica interesse",
    icon: Star,
    color: "from-amber-500 to-amber-600",
    colorBg: "bg-amber-50 text-amber-700",
    trigger: "Integrado ao Atendimento",
  },
  agendamento: {
    name: "Confirmação",
    description: "Confirma agendamentos 48h/24h antes e reagenda automaticamente",
    icon: CalendarCheck,
    color: "from-blue-500 to-blue-600",
    colorBg: "bg-blue-50 text-blue-700",
    trigger: "Cron a cada 1h",
  },
  followup: {
    name: "Follow-up",
    description: "Envia follow-up D1/D3/D7, recupera no-show e reativa inativos",
    icon: Zap,
    color: "from-emerald-500 to-emerald-600",
    colorBg: "bg-emerald-50 text-emerald-700",
    trigger: "Cron a cada 2h",
  },
  pos_atendimento: {
    name: "Pós-Atendimento",
    description: "Pesquisa NPS, review no Google e incentiva indicação",
    icon: UserCheck,
    color: "from-rose-500 to-rose-600",
    colorBg: "bg-rose-50 text-rose-700",
    trigger: "Cron diário 9h",
  },
};

const WORKFLOWS = [
  { name: "Atendimento + Qualificação", status: "active", endpoint: "Webhook /clinpro-webhook" },
  { name: "Confirmação de Agendamentos", status: "active", endpoint: "Cron 1h" },
  { name: "Follow-up + Reativação", status: "active", endpoint: "Cron 2h" },
  { name: "Pós-Atendimento (NPS)", status: "inactive", endpoint: "Cron diário 9h" },
  { name: "Relatórios + Inteligência", status: "active", endpoint: "Cron diário 7h" },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [editingAgent, setEditingAgent] = useState<AgentFlow | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [resetting, setResetting] = useState<string | null>(null);

  const { tenantId } = useAuth();

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch(`/api/agents?tenant_id=${tenantId}`);
        const data = await res.json();
        if (data.agents?.length > 0) setAgents(data.agents);
      } catch {} finally { setLoading(false); }
    }
    fetchAgents();
  }, [tenantId]);

  useEffect(() => {
    async function checkConnection() {
      try {
        const res = await fetch(`/api/whatsapp/status?tenant_id=${tenantId}`);
        const data = await res.json();
        setConnectionStatus(data.connected ? "connected" : "disconnected");
      } catch { setConnectionStatus("disconnected"); }
    }
    checkConnection();
  }, []);

  async function saveAgentEdit() {
    if (!editingAgent) return;
    setSavingEdit(true);
    try {
      await fetch("/api/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenantId, agent_type: editingAgent.agent_type,
          typing_delay_min: editingAgent.typing_delay_min, typing_delay_max: editingAgent.typing_delay_max,
          delay_between_msgs: editingAgent.delay_between_msgs, max_msgs_per_response: editingAgent.max_msgs_per_response,
        }),
      });
      setAgents((prev) => prev.map((a) => a.agent_type === editingAgent.agent_type ? { ...a, ...editingAgent } : a));
      setEditingAgent(null);
    } catch {} finally { setSavingEdit(false); }
  }

  async function resetAgent(agentType: string) {
    if (!confirm("Tem certeza que deseja zerar os contadores deste agente?")) return;
    setResetting(agentType);
    try {
      await fetch("/api/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, agent_type: agentType, messages_today: 0, executions_total: 0 }),
      });
      setAgents((prev) => prev.map((a) => a.agent_type === agentType ? { ...a, messages_today: 0, executions_total: 0 } : a));
    } catch {} finally { setResetting(null); }
  }

  async function toggleAgent(agentType: string, currentEnabled: boolean) {
    setToggling(agentType);
    try {
      await fetch("/api/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, agent_type: agentType, enabled: !currentEnabled }),
      });
      setAgents((prev) => prev.map((a) => a.agent_type === agentType ? { ...a, enabled: !currentEnabled } : a));
    } catch {} finally { setToggling(null); }
  }

  async function generateQr() {
    setShowQrModal(true);
    setQrBase64(null);
    try {
      const res = await fetch(`/api/whatsapp/qrcode?tenant_id=${tenantId}`);
      const data = await res.json();
      if (data.qrBase64) setQrBase64(data.qrBase64);
    } catch {}
  }

  const activeCount = agents.filter((a) => a.enabled).length;
  const totalMessages = agents.reduce((acc, a) => acc + a.messages_today, 0);
  const totalExecutions = agents.reduce((acc, a) => acc + a.executions_total, 0);

  const agentList = agents.length > 0 ? agents : Object.keys(AGENT_CONFIG).map((type) => ({
    id: type, tenant_id: tenantId, agent_type: type,
    enabled: type !== "pos_atendimento", last_execution: null,
    executions_total: 0, messages_today: 0, success_rate: 100,
  }));

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-ink tracking-tight">Agentes IA</h1>
          <p className="mt-0.5 text-[14px] text-ink-secondary">Gerencie os agentes de automação da sua clínica</p>
        </div>
      </div>

      {/* Stats + Connection */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Connection */}
        <div className={cn(
          "lg:col-span-1 rounded-[18px] p-5 flex flex-col justify-between",
          connectionStatus === "connected"
            ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
            : "bg-gradient-to-br from-ink-secondary to-ink"
        )}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white/20">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white">WhatsApp</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {connectionStatus === "connected" ? (
                  <><Wifi className="h-3 w-3 text-emerald-200" /><span className="text-[11px] text-white/80">Conectado</span></>
                ) : connectionStatus === "checking" ? (
                  <><Loader2 className="h-3 w-3 text-white animate-spin" /><span className="text-[11px] text-white/80">Verificando...</span></>
                ) : (
                  <><WifiOff className="h-3 w-3 text-red-200" /><span className="text-[11px] text-white/80">Desconectado</span></>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {connectionStatus === "disconnected" && (
              <button onClick={generateQr} className="flex-1 rounded-full bg-white/20 hover:bg-white/30 px-3 py-2 text-[12px] font-medium text-white transition-all active:scale-[0.97]">
                <QrCode className="h-3.5 w-3.5 inline mr-1" /> QR Code
              </button>
            )}
            <button
              onClick={async () => {
                setConnectionStatus("checking");
                const res = await fetch(`/api/whatsapp/status?tenant_id=${tenantId}`);
                const data = await res.json();
                setConnectionStatus(data.connected ? "connected" : "disconnected");
              }}
              className="flex-1 rounded-full bg-white px-3 py-2 text-[12px] font-semibold text-ink transition-all active:scale-[0.97]"
            >
              <RefreshCw className="h-3.5 w-3.5 inline mr-1" /> Verificar
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="rounded-[18px] bg-canvas border border-divider p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-brand-50 text-brand-700">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-ink-tertiary uppercase tracking-wider">Ativos</p>
            <p className="text-[24px] font-bold text-ink leading-none mt-1">{activeCount}<span className="text-[14px] font-normal text-ink-tertiary">/{agentList.length}</span></p>
          </div>
        </div>

        <div className="rounded-[18px] bg-canvas border border-divider p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-blue-50 text-blue-600">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-ink-tertiary uppercase tracking-wider">Mensagens Hoje</p>
            <p className="text-[24px] font-bold text-ink leading-none mt-1">{totalMessages || "—"}</p>
          </div>
        </div>

        <div className="rounded-[18px] bg-canvas border border-divider p-5 flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-ink-tertiary uppercase tracking-wider">Execuções Total</p>
            <p className="text-[24px] font-bold text-ink leading-none mt-1">{totalExecutions || "—"}</p>
          </div>
        </div>
      </div>

      {/* Agent cards */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-brand-700" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agentList.map((agent, i) => {
            const config = AGENT_CONFIG[agent.agent_type];
            if (!config) return null;
            const Icon = config.icon;
            const isActive = agent.enabled;
            const isToggling = toggling === agent.agent_type;

            return (
              <div
                key={agent.agent_type}
                className={cn(
                  "animate-slide-up rounded-[18px] border bg-canvas transition-all overflow-hidden group",
                  isActive ? "border-divider hover:border-hairline" : "border-divider opacity-50"
                )}
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br text-white", config.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-ink">{config.name}</h3>
                        <p className="text-[12px] text-ink-tertiary mt-0.5">{config.trigger}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAgent(agent.agent_type, agent.enabled)}
                      disabled={isToggling}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
                        isActive ? "bg-brand-600" : "bg-hairline",
                        isToggling && "opacity-50"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                        isActive ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-[13px] text-ink-secondary leading-relaxed mb-4">{config.description}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="rounded-[10px] bg-parchment px-3 py-2 text-center">
                      <p className="text-[18px] font-bold text-ink leading-none">{agent.messages_today}</p>
                      <p className="text-[10px] text-ink-tertiary font-medium mt-1">Hoje</p>
                    </div>
                    <div className="rounded-[10px] bg-parchment px-3 py-2 text-center">
                      <p className="text-[18px] font-bold text-ink leading-none">{agent.executions_total.toLocaleString()}</p>
                      <p className="text-[10px] text-ink-tertiary font-medium mt-1">Total</p>
                    </div>
                    <div className="rounded-[10px] bg-parchment px-3 py-2 text-center">
                      <p className="text-[18px] font-bold text-emerald-600 leading-none">{agent.success_rate}%</p>
                      <p className="text-[10px] text-ink-tertiary font-medium mt-1">Sucesso</p>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center justify-between border-t border-divider pt-3">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", isActive ? "bg-emerald-500 animate-pulse" : "bg-hairline")} />
                      <span className={cn("text-[12px] font-medium", isActive ? "text-emerald-600" : "text-ink-tertiary")}>
                        {isActive ? "Online" : "Offline"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingAgent({ ...agent })}
                        className="rounded-full p-1.5 text-ink-tertiary hover:bg-parchment hover:text-ink transition-colors"
                        title="Configurar"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => resetAgent(agent.agent_type)}
                        disabled={resetting === agent.agent_type}
                        className="rounded-full p-1.5 text-ink-tertiary hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Zerar contadores"
                      >
                        <RefreshCw className={cn("h-3.5 w-3.5", resetting === agent.agent_type && "animate-spin")} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Workflows */}
      <div className="rounded-[18px] border border-divider bg-canvas overflow-hidden">
        <div className="px-6 py-4 border-b border-divider flex items-center gap-2">
          <Activity className="h-5 w-5 text-brand-700" />
          <h3 className="text-[15px] font-semibold text-ink">Workflows n8n</h3>
        </div>
        <div className="divide-y divide-divider">
          {WORKFLOWS.map((wf) => (
            <div key={wf.name} className="flex items-center justify-between px-6 py-3.5 hover:bg-parchment/50 transition-colors">
              <div className="flex items-center gap-3">
                {wf.status === "active" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-ink-tertiary shrink-0" />
                )}
                <div>
                  <p className="text-[13px] font-medium text-ink">{wf.name}</p>
                  <p className="text-[11px] text-ink-tertiary">{wf.endpoint}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-tertiary" />
            </div>
          ))}
        </div>
      </div>

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="animate-slide-up w-full max-w-md rounded-[22px] bg-canvas border border-divider p-6 shadow-xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[17px] font-semibold text-ink tracking-tight">
                  {AGENT_CONFIG[editingAgent.agent_type]?.name || editingAgent.agent_type}
                </h2>
                <p className="text-[12px] text-ink-secondary mt-0.5">Configurações de comportamento</p>
              </div>
              <button onClick={() => setEditingAgent(null)} className="rounded-full p-1.5 text-ink-tertiary hover:bg-parchment">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: "Delay mínimo de digitação (ms)", key: "typing_delay_min", default: 1000, hint: "Tempo mínimo que simula digitação" },
                { label: "Delay máximo de digitação (ms)", key: "typing_delay_max", default: 4000, hint: "Delay proporcional ao tamanho da mensagem" },
                { label: "Delay entre mensagens (ms)", key: "delay_between_msgs", default: 800, hint: "Pausa entre cada mensagem enviada" },
                { label: "Máx. mensagens por resposta", key: "max_msgs_per_response", default: 3, hint: "Quantas mensagens separadas por vez" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-[13px] font-semibold text-ink mb-1">{field.label}</label>
                  <input
                    type="number"
                    value={(editingAgent as any)[field.key] ?? field.default}
                    onChange={(e) => setEditingAgent({ ...editingAgent, [field.key]: parseInt(e.target.value) || field.default })}
                    className="w-full rounded-[12px] border border-hairline bg-canvas px-4 py-2.5 text-[14px] text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <p className="text-[11px] text-ink-tertiary mt-1">{field.hint}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingAgent(null)} className="flex-1 rounded-full border border-divider bg-canvas px-4 py-2.5 text-[14px] font-medium text-ink hover:bg-parchment active:scale-[0.97] transition-all">
                Cancelar
              </button>
              <button onClick={saveAgentEdit} disabled={savingEdit} className="flex-1 rounded-full brand-gradient px-4 py-2.5 text-[14px] font-medium text-white hover:brightness-110 disabled:opacity-50 active:scale-[0.97] transition-all">
                {savingEdit ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="animate-slide-up w-full max-w-sm rounded-[22px] bg-canvas border border-divider p-6 shadow-xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[17px] font-semibold text-ink tracking-tight">Conectar WhatsApp</h2>
              <button onClick={() => setShowQrModal(false)} className="rounded-full p-1.5 text-ink-tertiary hover:bg-parchment"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col items-center gap-4">
              {qrBase64 ? (
                <div className="w-56 h-56 rounded-[18px] overflow-hidden border border-divider bg-canvas p-2">
                  <img src={qrBase64} alt="QR Code" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-56 h-56 rounded-[18px] border-2 border-dashed border-divider flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-ink-tertiary animate-spin" />
                </div>
              )}
              <p className="text-[12px] text-ink-secondary text-center">Escaneie com WhatsApp &gt; Aparelhos conectados</p>
              <button onClick={generateQr} className="w-full rounded-full brand-gradient py-2.5 text-[14px] font-medium text-white hover:brightness-110 active:scale-[0.97] transition-all">
                Gerar Novo QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
