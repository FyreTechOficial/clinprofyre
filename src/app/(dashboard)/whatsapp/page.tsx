"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import {
  MessageCircle,
  Send,
  Search,
  Sparkles,
  Clock,
  Bot,
  Wifi,
  WifiOff,
  MoreVertical,
  Paperclip,
  Smile,
  CheckCheck,
  ArrowLeft,
  QrCode,
  RefreshCw,
  Smartphone,
  LogOut,
  Loader2,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface Conversation {
  phone: string;
  name: string;
  lastMessage: string;
  lastRole: string;
  lastAt: string;
  messageCount: number;
  score: string;
  stage: string;
  use_ai?: boolean;
}

interface Message {
  id: string;
  phone: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

type ConnectionState = "checking" | "connected" | "disconnected" | "connecting" | "error";

/* ------------------------------------------------------------------ */
/*  Mock data                                                           */
/* ------------------------------------------------------------------ */

const mockConversations: Conversation[] = [
  { phone: "5511991234567", name: "Maria Silva", lastMessage: "Olá, gostaria de agendar uma harmonização facial", lastRole: "user", lastAt: new Date(Date.now() - 2 * 60000).toISOString(), messageCount: 8, score: "quente", stage: "agendado" },
  { phone: "5511987654321", name: "João Pereira", lastMessage: "Obrigado pela informação! Vou pensar e retorno.", lastRole: "user", lastAt: new Date(Date.now() - 15 * 60000).toISOString(), messageCount: 5, score: "morno", stage: "contato" },
  { phone: "5511976543210", name: "Ana Costa", lastMessage: "Qual o valor do peeling químico?", lastRole: "user", lastAt: new Date(Date.now() - 32 * 60000).toISOString(), messageCount: 3, score: "quente", stage: "qualificado" },
  { phone: "5531992345678", name: "Pedro Santos", lastMessage: "Posso ir amanhã às 14h?", lastRole: "user", lastAt: new Date(Date.now() - 60 * 60000).toISOString(), messageCount: 12, score: "quente", stage: "agendado" },
  { phone: "5511965432109", name: "Lucia Mendes", lastMessage: "Confirmado, até lá!", lastRole: "user", lastAt: new Date(Date.now() - 2 * 3600000).toISOString(), messageCount: 6, score: "quente", stage: "atendido" },
  { phone: "5521987651234", name: "Roberto Lima", lastMessage: "Preciso reagendar minha consulta de sexta", lastRole: "user", lastAt: new Date(Date.now() - 3 * 3600000).toISOString(), messageCount: 4, score: "morno", stage: "agendado" },
  { phone: "5511954321098", name: "Fernanda Rocha", lastMessage: "Recebi o lembrete, obrigada!", lastRole: "user", lastAt: new Date(Date.now() - 5 * 3600000).toISOString(), messageCount: 9, score: "quente", stage: "fidelizado" },
];

const mockMessages: Record<string, Message[]> = {
  "5511991234567": [
    { id: "1", phone: "5511991234567", role: "user", content: "Olá, boa tarde!", created_at: new Date(Date.now() - 30 * 60000).toISOString() },
    { id: "2", phone: "5511991234567", role: "assistant", content: "Olá Maria! Bem-vinda à Clínica Sorriso. Sou a assistente virtual e estou aqui para ajudá-la. Como posso ajudar hoje?", created_at: new Date(Date.now() - 29 * 60000).toISOString() },
    { id: "3", phone: "5511991234567", role: "user", content: "Gostaria de saber sobre harmonização facial", created_at: new Date(Date.now() - 25 * 60000).toISOString() },
    { id: "4", phone: "5511991234567", role: "assistant", content: "Ótima escolha! A Harmonização Facial é um dos nossos procedimentos mais procurados. Inclui aplicação de ácido hialurônico para contorno facial, preenchimento labial e correção de assimetrias.\n\nTemos horários disponíveis esta semana. Gostaria de agendar uma avaliação?", created_at: new Date(Date.now() - 24 * 60000).toISOString() },
    { id: "5", phone: "5511991234567", role: "user", content: "Sim! Tem horário quinta-feira à tarde?", created_at: new Date(Date.now() - 10 * 60000).toISOString() },
    { id: "6", phone: "5511991234567", role: "assistant", content: "Temos sim! Quinta-feira temos os seguintes horários:\n\n• 14:00\n• 15:30\n• 17:00\n\nQual prefere?", created_at: new Date(Date.now() - 9 * 60000).toISOString() },
    { id: "7", phone: "5511991234567", role: "user", content: "15:30 por favor", created_at: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: "8", phone: "5511991234567", role: "assistant", content: "Perfeito! Agendamento confirmado:\n\nAvaliação - Harmonização Facial\nQuinta-feira, 15:30\nDra. Amanda\n\nVou enviar um lembrete 24h antes. Qualquer dúvida é só chamar!", created_at: new Date(Date.now() - 4 * 60000).toISOString() },
    { id: "9", phone: "5511991234567", role: "user", content: "Olá, gostaria de agendar uma harmonização facial", created_at: new Date(Date.now() - 2 * 60000).toISOString() },
  ],
  "5511987654321": [
    { id: "10", phone: "5511987654321", role: "user", content: "Oi, quanto custa o botox?", created_at: new Date(Date.now() - 60 * 60000).toISOString() },
    { id: "11", phone: "5511987654321", role: "assistant", content: "Olá João! O Botox na nossa clínica varia conforme a região de aplicação.\n\nPosso agendar uma avaliação gratuita para a Dra. Amanda verificar a melhor indicação para você?", created_at: new Date(Date.now() - 58 * 60000).toISOString() },
    { id: "12", phone: "5511987654321", role: "user", content: "Obrigado pela informação! Vou pensar e retorno.", created_at: new Date(Date.now() - 15 * 60000).toISOString() },
  ],
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `${diffMin}min`;
  if (diffH < 24) return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function getScoreEmoji(score: string) {
  if (score === "quente") return "\u{1F525}";
  if (score === "morno") return "\u{1F7E1}";
  return "\u{2744}\uFE0F";
}

/* ------------------------------------------------------------------ */
/*  QR Code / Connection Screen                                        */
/* ------------------------------------------------------------------ */

function ConnectionScreen({
  connectionState,
  qrBase64,
  instanceName,
  errorMsg,
  onRetry,
  onLogout,
}: {
  connectionState: ConnectionState;
  qrBase64: string | null;
  instanceName: string;
  errorMsg: string | null;
  onRetry: () => void;
  onLogout: () => void;
}) {
  if (connectionState === "checking") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-brand-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-ink">Verificando conexão...</h3>
          <p className="text-sm text-ink-tertiary mt-1">Consultando Evolution API</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="rounded-3xl border border-hairline bg-canvas p-8 shadow-sm">
          {/* QR Code available */}
          {qrBase64 ? (
            <>
              <div className="mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-ink">Conecte seu WhatsApp</h2>
                <p className="text-sm text-ink-secondary mt-1">
                  Escaneie o QR Code com seu celular
                </p>
              </div>

              {/* QR Image */}
              <div className="mx-auto w-64 h-64 rounded-2xl overflow-hidden border-2 border-hairline bg-canvas p-2 mb-4">
                <img
                  src={qrBase64}
                  alt="QR Code WhatsApp"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-3 text-left">
                <div className="rounded-xl bg-parchment p-3">
                  <p className="text-xs font-medium text-ink-secondary mb-1">Instância</p>
                  <p className="text-sm text-ink font-mono">{instanceName}</p>
                </div>
                <ol className="text-xs text-ink-secondary space-y-1.5 px-1">
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">1</span>
                    Abra o WhatsApp no celular
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">2</span>
                    Vá em Configurações &gt; Aparelhos conectados
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">3</span>
                    Toque em &quot;Conectar um aparelho&quot; e escaneie
                  </li>
                </ol>
              </div>

              <button
                onClick={onRetry}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-divider bg-canvas px-4 py-2.5 text-sm font-medium text-ink transition-all hover:bg-parchment w-full justify-center"
              >
                <RefreshCw className="h-4 w-4" />
                Gerar Novo QR Code
              </button>
            </>
          ) : connectionState === "connecting" ? (
            <>
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-ink">Gerando QR Code...</h2>
              <p className="text-sm text-ink-secondary mt-1">Aguarde um momento</p>
            </>
          ) : connectionState === "error" ? (
            <>
              <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-ink">Erro de conexão</h2>
              <p className="text-sm text-ink-secondary mt-1">{errorMsg ?? "Não foi possível conectar à Evolution API"}</p>
              <div className="rounded-xl bg-red-50 p-3 mt-4 text-left">
                <p className="text-xs text-red-600">Verifique se a Evolution API está rodando e a instância está configurada.</p>
              </div>
              <button
                onClick={onRetry}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-brand-200 transition-all hover:bg-brand-700 w-full justify-center"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </button>
            </>
          ) : (
            /* disconnected, no QR yet */
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-parchment mb-6">
                <WifiOff className="h-10 w-10 text-ink-tertiary" />
              </div>
              <h2 className="text-xl font-bold text-ink">WhatsApp Desconectado</h2>
              <p className="text-sm text-ink-secondary mt-1 mb-6">
                Sua instância <span className="font-mono text-ink">{instanceName}</span> não está conectada
              </p>
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 w-full justify-center"
              >
                <QrCode className="h-5 w-5" />
                Gerar QR Code para Conectar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WhatsApp Page                                                       */
/* ------------------------------------------------------------------ */

export default function WhatsAppPage() {
  const [connectionState, setConnectionState] = useState<ConnectionState>("checking");
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [instanceName, setInstanceName] = useState("...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [profilePhotos, setProfilePhotos] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { tenantId } = useAuth();
  const selectedConv = conversations.find((c) => c.phone === selectedPhone);

  // Fetch profile photos for conversations
  useEffect(() => {
    if (conversations.length === 0) return;
    conversations.forEach((conv) => {
      if (profilePhotos[conv.phone]) return;
      fetch(`/api/whatsapp/profile-photo?phone=${conv.phone}&tenant_id=${tenantId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.photoUrl) {
            setProfilePhotos((prev) => ({ ...prev, [conv.phone]: data.photoUrl }));
          }
        })
        .catch(() => {});
    });
  }, [conversations]);

  /* ---------- Check connection on mount ---------- */
  const checkConnection = async () => {
    setConnectionState("checking");
    setQrBase64(null);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/whatsapp/status?tenant_id=${tenantId}`);
      const data = await res.json();
      setInstanceName(data.instance ?? "desconhecido");

      if (data.connected) {
        setConnectionState("connected");
      } else {
        setConnectionState("disconnected");
      }
    } catch {
      setConnectionState("error");
      setErrorMsg("Não foi possível verificar a conexão");
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  /* ---------- Auto-poll connection when showing QR ---------- */
  useEffect(() => {
    if (connectionState !== "disconnected" || !qrBase64) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/whatsapp/status?tenant_id=${tenantId}`);
        const data = await res.json();
        if (data.connected) {
          setConnectionState("connected");
          setQrBase64(null);
        }
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [connectionState, qrBase64]);

  /* ---------- Generate QR Code ---------- */
  const generateQr = async () => {
    setConnectionState("connecting");
    setQrBase64(null);

    try {
      const res = await fetch(`/api/whatsapp/qrcode?tenant_id=${tenantId}`);
      const data = await res.json();

      if (data.qrBase64) {
        setQrBase64(data.qrBase64);
        setConnectionState("disconnected");
        setInstanceName(data.instance ?? instanceName);
      } else if (data.error) {
        setConnectionState("error");
        setErrorMsg(data.error);
      } else {
        // Might already be connected
        await checkConnection();
      }
    } catch {
      setConnectionState("error");
      setErrorMsg("Falha ao gerar QR Code");
    }
  };

  /* ---------- Logout ---------- */
  const handleLogout = async () => {
    try {
      await fetch("/api/whatsapp/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tenant_id: tenantId }) });
      setConnectionState("disconnected");
      setQrBase64(null);
    } catch {}
  };

  /* ---------- Fetch conversations ---------- */
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`/api/whatsapp/conversations?tenant_id=${tenantId}`);
      const data = await res.json();
      if (data.conversations && data.conversations.length > 0) {
        setConversations(data.conversations);
      }
    } catch {}
  }, [tenantId]);

  // Load conversations on connect + poll every 5s
  useEffect(() => {
    if (connectionState !== "connected") return;
    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, [connectionState, fetchConversations]);

  /* ---------- Fetch messages ---------- */
  const fetchMessages = useCallback(async (phone: string, showLoader: boolean) => {
    if (showLoader) setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/whatsapp/messages?tenant_id=${tenantId}&phone=${phone}`);
      const data = await res.json();
      if (data.messages && data.messages.length > 0) {
        setMessages((prev) => {
          // Only update if there are new messages (avoid re-render flicker)
          if (prev.length !== data.messages.length || prev[prev.length - 1]?.id !== data.messages[data.messages.length - 1]?.id) {
            return data.messages;
          }
          return prev;
        });
      } else if (showLoader) {
        setMessages([]);
      }
    } catch {
      if (showLoader) setMessages([]);
    } finally {
      if (showLoader) setLoadingMsgs(false);
    }
  }, [tenantId]);

  // Load messages on select + poll every 3s for new messages
  useEffect(() => {
    if (!selectedPhone) return;
    fetchMessages(selectedPhone, true);
    const interval = setInterval(() => fetchMessages(selectedPhone, false), 2000);
    return () => clearInterval(interval);
  }, [selectedPhone, fetchMessages]);

  /* ---------- Auto scroll & textarea resize ---------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  /* ---------- Send message ---------- */
  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending || !selectedPhone) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      phone: selectedPhone,
      role: "assistant",
      content: trimmed,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setSending(true);

    try {
      await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: selectedPhone, message: trimmed, tenant_id: tenantId }),
      });
    } catch {} finally {
      setSending(false);
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.phone === selectedPhone
          ? { ...c, lastMessage: trimmed, lastRole: "assistant", lastAt: new Date().toISOString() }
          : c
      )
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const filteredConversations = conversations.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  /* ---------- NOT CONNECTED: show QR / connection screen ---------- */
  if (connectionState !== "connected") {
    return (
      <div className="animate-fade-in flex flex-col h-[calc(100vh-4rem)] -mx-4 -my-6 lg:-mx-8 lg:mx-0 lg:my-0 lg:h-[calc(100vh-7rem)]">
        <ConnectionScreen
          connectionState={connectionState}
          qrBase64={qrBase64}
          instanceName={instanceName}
          errorMsg={errorMsg}
          onRetry={generateQr}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  /* ---------- CONNECTED: show chat ---------- */
  return (
    <div className="animate-fade-in flex h-[calc(100vh-4rem)] -mx-4 -my-6 lg:-mx-8 overflow-hidden rounded-none lg:rounded-2xl lg:mx-0 lg:my-0 lg:h-[calc(100vh-7rem)] border border-divider bg-canvas shadow-sm">

      {/* Conversation list */}
      <div className={cn(
        "flex flex-col border-r border-hairline bg-canvas w-full sm:w-80 shrink-0",
        selectedPhone ? "hidden sm:flex" : "flex"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-hairline">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-ink">Conversas</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 font-medium">Online</span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-ink-tertiary hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Desconectar WhatsApp"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary" />
            <input
              type="text"
              placeholder="Buscar conversa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-parchment border border-hairline pl-9 pr-4 py-2 text-sm placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all"
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <div
              key={conv.phone}
              onClick={() => setSelectedPhone(conv.phone)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-b border-hairline",
                selectedPhone === conv.phone ? "bg-emerald-50/80" : "hover:bg-parchment/80"
              )}
            >
              <div className="relative shrink-0">
                {profilePhotos[conv.phone] ? (
                  <img src={profilePhotos[conv.phone]} alt={conv.name} className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-parchment to-surface-raised text-sm font-bold text-ink-secondary">
                    {getInitials(conv.name)}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 text-xs leading-none">{getScoreEmoji(conv.score)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink truncate">{conv.name}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-ink-tertiary">{formatTime(conv.lastAt)}</span>
                    {conv.lastRole === "user" && (
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {conv.lastRole === "assistant" && <CheckCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
                  <p className="text-xs text-ink-secondary truncate">{conv.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
          {filteredConversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-ink-tertiary">
              <MessageCircle className="h-8 w-8 mb-2" />
              <p className="text-sm">Nenhuma conversa</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      {selectedPhone && selectedConv ? (
        <div className="flex flex-1 flex-col">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-hairline bg-canvas">
            <button onClick={() => setSelectedPhone(null)} className="sm:hidden rounded-lg p-1 text-ink-secondary hover:bg-parchment">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="relative">
              {profilePhotos[selectedConv.phone] ? (
                <img src={profilePhotos[selectedConv.phone]} alt={selectedConv.name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-parchment to-surface-raised text-sm font-bold text-ink-secondary">
                  {getInitials(selectedConv.name)}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 text-xs leading-none">{getScoreEmoji(selectedConv.score)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-ink">{selectedConv.name}</p>
              <div className="flex items-center gap-2 text-xs text-ink-secondary">
                <span>{selectedConv.phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "+$1 ($2) $3-$4")}</span>
                <span className="text-ink-tertiary">&middot;</span>
                <span className="font-medium">
                  {selectedConv.score === "quente" ? "\u{1F525} Quente" : selectedConv.score === "morno" ? "\u{1F7E1} Morno" : "\u{2744}\uFE0F Frio"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={async () => {
                  const newState = !(selectedConv.use_ai ?? true);
                  await fetch("/api/whatsapp/toggle-ai", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tenant_id: tenantId, phone: selectedConv.phone, use_ai: newState }),
                  });
                  setConversations((prev) =>
                    prev.map((c) => c.phone === selectedConv.phone ? { ...c, use_ai: newState } : c)
                  );
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                  (selectedConv.use_ai ?? true)
                    ? "bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-700"
                    : "bg-red-50 text-red-700 hover:bg-emerald-50 hover:text-emerald-700"
                )}
              >
                {(selectedConv.use_ai ?? true) ? (
                  <><UserCheck className="h-3.5 w-3.5" /> Assumir</>
                ) : (
                  <><Bot className="h-3.5 w-3.5" /> Reativar IA</>
                )}
              </button>
            </div>
          </div>

          {/* AI status banner */}
          {!(selectedConv.use_ai ?? true) && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100">
              <UserCheck className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Atendimento humano ativo — IA desligada para este paciente</span>
            </div>
          )}

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-1 bg-parchment"
          >
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-2 text-ink-tertiary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Carregando...</span>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex mb-1", msg.role === "user" ? "justify-start" : "justify-end")}>
                    <div className={cn("max-w-[75%] rounded-2xl px-3 py-2 shadow-sm", msg.role === "user" ? "bg-canvas text-ink rounded-tl-md" : "bg-emerald-100 text-ink rounded-tr-md")}>
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-1 mb-0.5">
                          <Bot className="h-3 w-3 text-emerald-600" />
                          <span className="text-[10px] font-semibold text-emerald-600">ClinPRO</span>
                        </div>
                      )}
                      <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <span className="text-[10px] text-ink-tertiary">{formatMessageTime(msg.created_at)}</span>
                        {msg.role === "assistant" && <CheckCheck className="h-3 w-3 text-blue-500" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-hairline bg-canvas px-3 py-2">
            <div className="flex items-end gap-2">
              <button className="shrink-0 rounded-full p-2 text-ink-tertiary hover:bg-parchment transition-colors">
                <Smile className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite uma mensagem..."
                  rows={1}
                  className="w-full resize-none rounded-2xl bg-parchment border border-hairline px-4 py-2.5 text-sm text-ink placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className={cn(
                  "shrink-0 flex h-10 w-10 items-center justify-center rounded-full transition-all",
                  input.trim() ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200" : "bg-parchment text-ink-tertiary"
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden sm:flex flex-1 items-center justify-center bg-parchment/50">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-50 mb-4">
              <MessageCircle className="h-10 w-10 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-ink">WhatsApp ClinPRO</h3>
            <p className="text-sm text-ink-tertiary mt-1 max-w-xs">
              Selecione uma conversa para visualizar e responder mensagens
            </p>
            <div className="mt-4 flex items-center justify-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-600 font-medium">Conectado via Evolution API</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
