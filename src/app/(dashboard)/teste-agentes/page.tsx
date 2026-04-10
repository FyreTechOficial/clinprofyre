"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import {
  Send,
  Bot,
  User,
  Loader2,
  Phone,
  Settings,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Wifi,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  debug?: any;
  status?: "sending" | "sent" | "error";
}

interface TestConfig {
  phone: string;
  instanceName: string;
  pushName: string;
}

export default function TesteAgentesPage() {
  const { tenant } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [expandedDebug, setExpandedDebug] = useState<string | null>(null);
  const [config, setConfig] = useState<TestConfig>({
    phone: "5511999998888",
    instanceName: tenant?.evolution_instance ?? "clinica-odonto-vida",
    pushName: "Paciente Teste",
  });
  const [showConfig, setShowConfig] = useState(false);
  const [stats, setStats] = useState({ total: 0, success: 0, errors: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update instanceName when tenant loads
  useEffect(() => {
    if (tenant?.evolution_instance) {
      setConfig((c) => ({ ...c, instanceName: tenant.evolution_instance }));
    }
  }, [tenant]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    // Add "typing" indicator
    const typingId = `typing_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: typingId, role: "system", content: "Processando no n8n...", timestamp: new Date(), status: "sending" },
    ]);

    try {
      const startTime = Date.now();
      const res = await fetch("/api/test-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          phone: config.phone,
          instanceName: config.instanceName,
          pushName: config.pushName,
        }),
      });

      const data = await res.json();

      // Remove typing indicator
      setMessages((prev) => prev.filter((m) => m.id !== typingId));

      if (data.success && data.aiMessages) {
        for (const msg of data.aiMessages) {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai_${Date.now()}_${Math.random()}`,
              role: "assistant",
              content: msg,
              timestamp: new Date(),
              status: "sent",
              debug: {
                elapsed: data.elapsed,
                lead: data.lead,
              },
            },
          ]);
        }

        // Show lead info if available
        if (data.lead) {
          setMessages((prev) => [
            ...prev,
            {
              id: `lead_${Date.now()}`,
              role: "system",
              content: `📊 Lead: ${data.lead.name || "—"} | Score: ${data.lead.score || "—"} | Stage: ${data.lead.stage || "—"} | Interesse: ${data.lead.interest || "—"}`,
              timestamp: new Date(),
              status: "sent",
              debug: data.lead,
            },
          ]);
        }

        setStats((s) => ({ ...s, total: s.total + 1, success: s.success + 1 }));
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error_${Date.now()}`,
            role: "system",
            content: `Erro: ${data.error || "Sem resposta do agente"}`,
            timestamp: new Date(),
            status: "error",
            debug: data,
          },
        ]);
        setStats((s) => ({ ...s, total: s.total + 1, errors: s.errors + 1 }));
      }
    } catch (e: any) {
      setMessages((prev) => prev.filter((m) => m.id !== typingId));
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: "system",
          content: `Erro de conexão: ${e.message}`,
          timestamp: new Date(),
          status: "error",
        },
      ]);
      setStats((s) => ({ ...s, total: s.total + 1, errors: s.errors + 1 }));
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function clearChat() {
    setMessages([]);
    setStats({ total: 0, success: 0, errors: 0 });
  }

  function copyDebug(debug: any) {
    navigator.clipboard.writeText(JSON.stringify(debug, null, 2));
  }

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-4rem)] -mx-4 -my-6 lg:-mx-8 lg:mx-0 lg:my-0 lg:h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-200">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">Teste de Agentes</h1>
            <p className="text-xs text-gray-500">Simula mensagens sem usar WhatsApp real</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Stats */}
          <div className="hidden sm:flex items-center gap-3 mr-2">
            <div className="flex items-center gap-1 text-xs">
              <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-500">{stats.total}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-600">{stats.success}</span>
            </div>
            {stats.errors > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <XCircle className="h-3.5 w-3.5 text-red-500" />
                <span className="text-red-600">{stats.errors}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all",
              showConfig ? "bg-brand-50 border-brand-200 text-brand-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <Settings className="h-3.5 w-3.5" />
            Config
          </button>
          <button
            onClick={clearChat}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpar
          </button>
        </div>
      </div>

      {/* Config panel */}
      {showConfig && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80 animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Instância Evolution</label>
              <input
                type="text"
                value={config.instanceName}
                onChange={(e) => setConfig({ ...config, instanceName: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-mono focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Telefone Simulado</label>
              <input
                type="text"
                value={config.phone}
                onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nome do Paciente</label>
              <input
                type="text"
                value={config.pushName}
                onChange={(e) => setConfig({ ...config, pushName: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Wifi className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[10px] text-gray-500">
              Webhook: <span className="font-mono text-gray-700">{process.env.NEXT_PUBLIC_N8N_URL || "n8n.fyreoficial.com.br"}/webhook/clinpro-webhook</span>
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}>
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 mb-4">
                <Bot className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-700">Ambiente de Teste</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
                Simule conversas como se fosse um paciente. As mensagens vão direto pro n8n sem passar pelo WhatsApp.
                O agente vai responder aqui e você vê o debug completo.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["Olá, tudo bem?", "Quero agendar uma consulta", "Quanto custa implante?", "Vocês atendem sábado?"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id}>
              <div className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role !== "user" && (
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                    msg.role === "assistant" ? "bg-gradient-to-br from-brand-500 to-brand-700" :
                    msg.status === "error" ? "bg-red-100" :
                    msg.status === "sending" ? "bg-amber-100" : "bg-gray-100"
                  )}>
                    {msg.role === "assistant" ? <Bot className="w-4 h-4 text-white" /> :
                     msg.status === "error" ? <AlertCircle className="w-4 h-4 text-red-500" /> :
                     msg.status === "sending" ? <Loader2 className="w-4 h-4 text-amber-500 animate-spin" /> :
                     <Bot className="w-4 h-4 text-gray-400" />}
                  </div>
                )}

                <div className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm max-w-[80%]",
                  msg.role === "user" ? "bg-brand-600 text-white rounded-tr-md" :
                  msg.role === "assistant" ? "bg-white border border-gray-100 text-gray-800 rounded-tl-md shadow-sm" :
                  msg.status === "error" ? "bg-red-50 border border-red-100 text-red-700 rounded-tl-md" :
                  "bg-amber-50 border border-amber-100 text-amber-700 rounded-tl-md"
                )}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={cn("text-[10px] mt-1", msg.role === "user" ? "text-brand-200" : "text-gray-400")}>
                    {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    {msg.debug?.elapsed && ` · ${msg.debug.elapsed}`}
                  </p>
                </div>

                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Debug toggle */}
              {msg.debug && (
                <div className={cn("mt-1", msg.role === "user" ? "mr-10 text-right" : "ml-10")}>
                  <button
                    onClick={() => setExpandedDebug(expandedDebug === msg.id ? null : msg.id)}
                    className="inline-flex items-center gap-1 text-[10px] text-gray-400 hover:text-brand-600 transition-colors"
                  >
                    {expandedDebug === msg.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    Debug
                  </button>
                  {expandedDebug === msg.id && (
                    <div className="mt-1 rounded-lg bg-gray-900 text-gray-300 p-3 text-[11px] font-mono overflow-x-auto text-left relative">
                      <button
                        onClick={() => copyDebug(msg.debug)}
                        className="absolute top-2 right-2 rounded-md p-1 text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <pre className="whitespace-pre-wrap">{JSON.stringify(msg.debug, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 bg-white px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <div className="flex-1 flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50/50 p-2 transition-all focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 focus-within:bg-white">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Simule uma mensagem de paciente..."
              rows={1}
              disabled={sending}
              className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-gray-800 placeholder-gray-400 outline-none disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className={cn(
                "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                input.trim() && !sending
                  ? "bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-200"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-1.5">
          Envia payload simulado direto pro n8n · Não envia pelo WhatsApp · Debug completo disponível
        </p>
      </div>
    </div>
  );
}
