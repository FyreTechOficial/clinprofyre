"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { MessageSquare, Bot, User, Search, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ConversationSummary {
  phone: string;
  lastMessage: string;
  lastRole: string;
  lastAt: string;
  messageCount: number;
  score: string;
  stage: string;
  use_ai: boolean;
}

interface MessageRecord {
  id: string;
  phone: string;
  role: string;
  content: string;
  created_at: string;
}

function formatPhone(phone: string) {
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 13) return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`;
  if (clean.length === 12) return `+${clean.slice(0, 2)} (${clean.slice(2, 4)}) ${clean.slice(4, 8)}-${clean.slice(8)}`;
  return phone;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export default function ConversationsPage() {
  const { tenantId } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    if (!tenantId) return;
    try {
      const res = await fetch(`/api/whatsapp/conversations?tenant_id=${tenantId}`);
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {} finally { setLoadingConvs(false); }
  }, [tenantId]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedPhone || !tenantId) return;
    setLoadingMsgs(true);
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/whatsapp/messages?tenant_id=${tenantId}&phone=${selectedPhone}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch {} finally { setLoadingMsgs(false); }
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedPhone, tenantId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = search
    ? conversations.filter((c) => c.phone.includes(search) || c.lastMessage?.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  const selectedConv = conversations.find((c) => c.phone === selectedPhone);

  return (
    <div className="flex h-[calc(100vh-3.5rem-5.5rem)] -mx-4 -my-6 lg:-mx-8 animate-fade-in">
      {/* Conversation list */}
      <div className="w-80 border-r border-divider bg-canvas/50 flex flex-col shrink-0">
        <div className="p-3 border-b border-divider">
          <div className="flex items-center gap-2 rounded-full bg-parchment border border-divider px-3 py-2">
            <Search className="h-4 w-4 text-ink-tertiary" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar conversa..." className="flex-1 bg-transparent text-[13px] text-ink placeholder:text-ink-tertiary outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-brand-700" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="h-8 w-8 text-ink-tertiary mx-auto mb-2" />
              <p className="text-[13px] text-ink-tertiary">Nenhuma conversa ainda</p>
            </div>
          ) : (
            filtered.map((conv) => (
              <div
                key={conv.phone}
                onClick={() => setSelectedPhone(conv.phone)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-divider/50",
                  selectedPhone === conv.phone ? "bg-brand-50" : "hover:bg-parchment/50"
                )}
              >
                <div className="h-10 w-10 rounded-full bg-parchment border border-divider flex items-center justify-center text-[11px] font-bold text-ink-secondary shrink-0">
                  {conv.phone.slice(-4, -2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-ink truncate">{formatPhone(conv.phone)}</p>
                    <span className="text-[10px] text-ink-tertiary shrink-0">{timeAgo(conv.lastAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {conv.lastRole === "assistant" && <Bot className="h-3 w-3 text-brand-500 shrink-0" />}
                    <p className="text-[11px] text-ink-tertiary truncate">{conv.lastMessage || "..."}</p>
                  </div>
                </div>
                {conv.use_ai && <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="IA ativa" />}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 flex flex-col bg-parchment/30 min-w-0">
        {!selectedPhone ? (
          <div className="flex-1 flex flex-col items-center justify-center text-ink-tertiary">
            <MessageSquare className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-[15px] font-medium">Selecione uma conversa</p>
            <p className="text-[12px] mt-1">para visualizar as mensagens</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-5 py-3 border-b border-divider bg-canvas">
              <div className="h-9 w-9 rounded-full bg-parchment border border-divider flex items-center justify-center text-[10px] font-bold text-ink-secondary">
                {selectedPhone.slice(-4, -2)}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-ink">{formatPhone(selectedPhone)}</p>
                {selectedConv && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", selectedConv.score === "quente" ? "bg-emerald-50 text-emerald-700" : selectedConv.score === "morno" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700")}>{selectedConv.score || "—"}</span>
                    <span className="text-[10px] text-ink-tertiary">{selectedConv.stage || "—"}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-parchment">
                <Bot className="h-3 w-3 text-brand-600" />
                <span className="text-[10px] font-semibold text-ink-secondary">{selectedConv?.use_ai ? "IA ativa" : "IA pausada"}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-brand-700" /></div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                      {msg.role === "assistant" && (
                        <div className="h-7 w-7 rounded-full brand-gradient flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div className={cn(
                        "rounded-[14px] px-3.5 py-2 text-[13px] max-w-[75%] leading-relaxed",
                        msg.role === "user" ? "brand-gradient text-white" : "bg-canvas border border-divider text-ink"
                      )}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={cn("text-[9px] mt-1", msg.role === "user" ? "text-white/50" : "text-ink-tertiary")}>
                          {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {msg.role === "user" && (
                        <div className="h-7 w-7 rounded-full bg-parchment border border-divider flex items-center justify-center shrink-0 mt-0.5">
                          <User className="h-3.5 w-3.5 text-ink-secondary" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="border-t border-divider bg-canvas px-5 py-3 flex items-center justify-center gap-2 text-ink-tertiary">
              <Lock className="h-4 w-4" />
              <span className="text-[12px] font-medium">Conversas gerenciadas pela IA · Visualização somente leitura</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
