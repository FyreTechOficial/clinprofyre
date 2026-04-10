"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Bot,
  MessageSquare,
  CalendarCheck,
  Zap,
  Star,
  UserCheck,
  Activity,
  Settings,
  ExternalLink,
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

const AGENT_CONFIG: Record<string, { name: string; description: string; icon: any; color: string; trigger: string }> = {
  atendimento: {
    name: "Agente de Atendimento 24/7",
    description: "Responde mensagens de texto e áudio no WhatsApp automaticamente com IA",
    icon: MessageSquare,
    color: "from-brand-500 to-brand-700",
    trigger: "Webhook (tempo real)",
  },
  qualificacao: {
    name: "Agente de Qualificação",
    description: "Classifica leads em quente/morno/frio, preenche cadastro e identifica interesse",
    icon: Star,
    color: "from-amber-500 to-amber-700",
    trigger: "Integrado ao Atendimento",
  },
  agendamento: {
    name: "Agente de Confirmação",
    description: "Confirma agendamentos 48h/24h antes, reagenda e lembra o paciente",
    icon: CalendarCheck,
    color: "from-blue-500 to-blue-700",
    trigger: "Cron a cada 1h",
  },
  followup: {
    name: "Agente de Follow-up",
    description: "Envia follow-up D1/D3/D7, recupera no-show e reativa pacientes inativos (+90 dias)",
    icon: Zap,
    color: "from-emerald-500 to-emerald-700",
    trigger: "Cron a cada 2h",
  },
  pos_atendimento: {
    name: "Agente de Pós-Atendimento",
    description: "Envia pesquisa NPS, solicita review no Google e incentiva indicação",
    icon: UserCheck,
    color: "from-rose-500 to-rose-700",
    trigger: "Cron diário 9h",
  },
};

const WORKFLOWS = [
  { name: "Agente de Atendimento + Qualificação", status: "active", endpoint: "Webhook /clinpro-webhook" },
  { name: "Agente de Confirmação de Agendamentos", status: "active", endpoint: "Cron 1h" },
  { name: "Agente de Follow-up + Reativação", status: "active", endpoint: "Cron 2h" },
  { name: "Agente de Pós-Atendimento (NPS)", status: "inactive", endpoint: "Cron diário 9h" },
  { name: "Agente de Relatórios + Inteligência", status: "active", endpoint: "Cron diário 7h" },
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

  const { tenantId } = useAuth();

  // Fetch agents from Supabase
  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch(`/api/agents?tenant_id=${tenantId}`);
        const data = await res.json();
        if (data.agents?.length > 0) setAgents(data.agents);
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, [tenantId]);

  // Check Evolution connection
  useEffect(() => {
    async function checkConnection() {
      try {
        const res = await fetch("/api/whatsapp/status");
        const data = await res.json();
        setConnectionStatus(data.connected ? "connected" : "disconnected");
      } catch {
        setConnectionStatus("disconnected");
      }
    }
    checkConnection();
  }, []);

  // Save agent edit
  async function saveAgentEdit() {
    if (!editingAgent) return;
    setSavingEdit(true);
    try {
      await fetch("/api/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenantId,
          agent_type: editingAgent.agent_type,
          typing_delay_min: editingAgent.typing_delay_min,
          typing_delay_max: editingAgent.typing_delay_max,
          delay_between_msgs: editingAgent.delay_between_msgs,
          max_msgs_per_response: editingAgent.max_msgs_per_response,
        }),
      });
      setAgents((prev) =>
        prev.map((a) => a.agent_type === editingAgent.agent_type ? { ...a, ...editingAgent } : a)
      );
      setEditingAgent(null);
    } catch {} finally {
      setSavingEdit(false);
    }
  }

  // Toggle agent on/off
  async function toggleAgent(agentType: string, currentEnabled: boolean) {
    setToggling(agentType);
    try {
      await fetch("/api/agents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, agent_type: agentType, enabled: !currentEnabled }),
      });
      setAgents((prev) =>
        prev.map((a) => a.agent_type === agentType ? { ...a, enabled: !currentEnabled } : a)
      );
    } catch {} finally {
      setToggling(null);
    }
  }

  // Generate QR
  async function generateQr() {
    setShowQrModal(true);
    setQrBase64(null);
    try {
      const res = await fetch("/api/whatsapp/qrcode");
      const data = await res.json();
      if (data.qrBase64) setQrBase64(data.qrBase64);
    } catch {}
  }

  const activeCount = agents.filter((a) => a.enabled).length;
  const totalMessages = agents.reduce((acc, a) => acc + a.messages_today, 0);
  const totalExecutions = agents.reduce((acc, a) => acc + a.executions_total, 0);

  // Use mock data if no agents from Supabase
  const agentList = agents.length > 0 ? agents : Object.keys(AGENT_CONFIG).map((type) => ({
    id: type,
    tenant_id: tenantId,
    agent_type: type,
    enabled: type !== "pos_atendimento",
    last_execution: null,
    executions_total: 0,
    messages_today: 0,
    success_rate: 100,
  }));

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agentes IA</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie os agentes de automação da sua clínica
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 border border-brand-100">
            <Bot className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-semibold text-brand-700">{activeCount} ativos</span>
          </div>
        </div>
      </div>

      {/* Connection card */}
      <div className={cn(
        "rounded-2xl overflow-hidden shadow-sm",
        connectionStatus === "connected"
          ? "bg-gradient-to-r from-emerald-600 to-emerald-500"
          : "bg-gradient-to-r from-gray-600 to-gray-500"
      )}>
        <div className="px-5 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Smartphone className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Conexão WhatsApp</h3>
                <div className="flex items-center gap-2 mt-1">
                  {connectionStatus === "connected" ? (
                    <><Wifi className="h-4 w-4 text-emerald-200" /><span className="text-sm text-emerald-100">Evolution API conectada</span></>
                  ) : connectionStatus === "checking" ? (
                    <><Loader2 className="h-4 w-4 text-white animate-spin" /><span className="text-sm text-white/80">Verificando...</span></>
                  ) : (
                    <><WifiOff className="h-4 w-4 text-red-200" /><span className="text-sm text-red-100">Desconectado</span></>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === "disconnected" && (
                <button onClick={generateQr} className="inline-flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 px-4 py-2.5 text-sm font-medium text-white transition-all">
                  <QrCode className="h-4 w-4" /> Conectar QR Code
                </button>
              )}
              <button
                onClick={async () => {
                  setConnectionStatus("checking");
                  const res = await fetch("/api/whatsapp/status");
                  const data = await res.json();
                  setConnectionStatus(data.connected ? "connected" : "disconnected");
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
              >
                <RefreshCw className="h-4 w-4" /> Verificar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{totalMessages || "—"}</p>
          <p className="text-xs text-gray-500 mt-0.5">Mensagens hoje</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{totalExecutions || "—"}</p>
          <p className="text-xs text-gray-500 mt-0.5">Execuções total</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">{activeCount}/{agentList.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Agentes ativos</p>
        </div>
      </div>

      {/* Agent cards */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                  "animate-slide-up rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md overflow-hidden",
                  isActive ? "border-gray-100" : "border-gray-100 opacity-60"
                )}
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
              >
                {/* Color bar */}
                <div className={cn("h-1.5 bg-gradient-to-r", config.color)} />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg text-white", config.color)}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{config.name}</h3>
                        <p className="mt-0.5 text-xs text-gray-500">{config.description}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                      isActive ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-gray-50 text-gray-500 ring-gray-200"
                    )}>
                      <span className={cn("h-2 w-2 rounded-full", isActive ? "bg-emerald-500 animate-pulse" : "bg-gray-400")} />
                      {isActive ? "Ativo" : "Inativo"}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-gray-50/80 px-3 py-2.5 text-center">
                      <p className="text-lg font-bold text-gray-900">{agent.messages_today}</p>
                      <p className="text-[10px] text-gray-500 font-medium">Hoje</p>
                    </div>
                    <div className="rounded-xl bg-gray-50/80 px-3 py-2.5 text-center">
                      <p className="text-lg font-bold text-gray-900">{agent.executions_total.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500 font-medium">Total</p>
                    </div>
                    <div className="rounded-xl bg-gray-50/80 px-3 py-2.5 text-center">
                      <p className="text-lg font-bold text-emerald-600">{agent.success_rate}%</p>
                      <p className="text-[10px] text-gray-500 font-medium">Sucesso</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditingAgent({ ...agent })}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-400 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                      >
                        <Settings className="h-3 w-3" />
                        Editar
                      </button>
                      <span className="text-[10px] text-gray-300">{config.trigger}</span>
                    </div>
                    <button
                      onClick={() => toggleAgent(agent.agent_type, agent.enabled)}
                      disabled={isToggling}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        isActive ? "bg-brand-600" : "bg-gray-300",
                        isToggling && "opacity-50"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                        isActive ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Workflows */}
      <Card className="!shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-600" />
              Workflows n8n
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {WORKFLOWS.map((wf) => (
            <div key={wf.name} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 transition-all hover:bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", wf.status === "active" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400")}>
                  {wf.status === "active" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{wf.name}</p>
                  <p className="text-xs text-gray-400">{wf.endpoint}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="animate-slide-up w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {AGENT_CONFIG[editingAgent.agent_type]?.name || editingAgent.agent_type}
                </h2>
                <p className="text-xs text-gray-500">Configurações de comportamento</p>
              </div>
              <button onClick={() => setEditingAgent(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delay mínimo de digitação (ms)</label>
                <input
                  type="number"
                  value={editingAgent.typing_delay_min ?? 1000}
                  onChange={(e) => setEditingAgent({ ...editingAgent, typing_delay_min: parseInt(e.target.value) || 1000 })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <p className="text-[10px] text-gray-400 mt-1">Tempo mínimo que simula digitação (1000 = 1 segundo)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delay máximo de digitação (ms)</label>
                <input
                  type="number"
                  value={editingAgent.typing_delay_max ?? 4000}
                  onChange={(e) => setEditingAgent({ ...editingAgent, typing_delay_max: parseInt(e.target.value) || 4000 })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <p className="text-[10px] text-gray-400 mt-1">Tempo máximo. O delay real é proporcional ao tamanho da mensagem</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delay entre mensagens (ms)</label>
                <input
                  type="number"
                  value={editingAgent.delay_between_msgs ?? 800}
                  onChange={(e) => setEditingAgent({ ...editingAgent, delay_between_msgs: parseInt(e.target.value) || 800 })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <p className="text-[10px] text-gray-400 mt-1">Pausa entre cada mensagem enviada</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de mensagens por resposta</label>
                <input
                  type="number"
                  value={editingAgent.max_msgs_per_response ?? 3}
                  onChange={(e) => setEditingAgent({ ...editingAgent, max_msgs_per_response: parseInt(e.target.value) || 3 })}
                  min={1}
                  max={5}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <p className="text-[10px] text-gray-400 mt-1">Quantas mensagens separadas o agente pode enviar de uma vez</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingAgent(null)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveAgentEdit}
                disabled={savingEdit}
                className="flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:bg-brand-700 disabled:opacity-50"
              >
                {savingEdit ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="animate-slide-up w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Conectar WhatsApp</h2>
              <button onClick={() => setShowQrModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-col items-center gap-4">
              {qrBase64 ? (
                <div className="w-56 h-56 rounded-2xl overflow-hidden border-2 border-gray-100 bg-white p-2">
                  <img src={qrBase64} alt="QR Code" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-56 h-56 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-gray-300 animate-spin" />
                </div>
              )}
              <p className="text-xs text-gray-500 text-center">Escaneie com WhatsApp &gt; Aparelhos conectados</p>
              <button onClick={generateQr} className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white shadow-md hover:bg-brand-700">
                Gerar Novo QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
