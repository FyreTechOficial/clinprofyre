"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { Sparkles, Send, Bot, User, Plus, MessageSquare, Trash2, ChevronLeft } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Olá! Sou a **Clin.IA**, sua assistente inteligente. Posso ajudar com:\n\n- Análises de performance da clínica\n- Scripts de venda e atendimento\n- Dicas de marketing e captação\n- Geração de conteúdo\n- Dúvidas sobre gestão\n\nComo posso ajudar você hoje?",
};

function formatMessageContent(content: string) {
  const parts = content.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function ClinIAPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: "1", title: "Nova conversa", messages: [WELCOME_MESSAGE], createdAt: new Date() },
  ]);
  const [activeConvId, setActiveConvId] = useState("1");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? conversations[0];
  const messages = activeConv?.messages ?? [WELCOME_MESSAGE];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  function newConversation() {
    const conv: Conversation = {
      id: Date.now().toString(),
      title: "Nova conversa",
      messages: [WELCOME_MESSAGE],
      createdAt: new Date(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(conv.id);
  }

  function deleteConversation(id: string) {
    if (conversations.length <= 1) return;
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    if (activeConvId === id) setActiveConvId(remaining[0].id);
  }

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: trimmed };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConvId) return c;
        const updated = { ...c, messages: [...c.messages, userMessage] };
        if (c.title === "Nova conversa") {
          updated.title = trimmed.slice(0, 40) + (trimmed.length > 40 ? "..." : "");
        }
        return updated;
      })
    );
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/clin-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Desculpe, não consegui processar sua solicitação.",
      };
      setConversations((prev) =>
        prev.map((c) => c.id === activeConvId ? { ...c, messages: [...c.messages, aiMessage] } : c)
      );
    } catch {
      setConversations((prev) =>
        prev.map((c) => c.id === activeConvId ? {
          ...c,
          messages: [...c.messages, { id: (Date.now() + 1).toString(), role: "assistant", content: "Desculpe, ocorreu um erro. Tente novamente." }],
        } : c)
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -mx-4 -my-6 lg:-mx-8">
      {/* Sidebar - conversation list */}
      <div className={cn(
        "flex flex-col border-r border-gray-100 bg-gray-50/80 transition-all duration-300",
        sidebarOpen ? "w-72" : "w-0 overflow-hidden"
      )}>
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-800">Clin.IA</span>
          </div>
          <button
            onClick={newConversation}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
            title="Nova conversa"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={cn(
                "group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-all",
                conv.id === activeConvId
                  ? "bg-brand-100/80 text-brand-800"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <MessageSquare className="h-4 w-4 shrink-0 opacity-60" />
              <span className="flex-1 text-sm truncate">{conv.title}</span>
              {conversations.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 shrink-0 rounded-md p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 flex-col bg-white">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-200">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-gray-900">Clin.IA</h2>
            <p className="text-xs text-gray-400">Assistente inteligente da sua clínica</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-[fadeIn_0.3s_ease-out]",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[75%]",
                  message.role === "user"
                    ? "bg-brand-600 text-white shadow-md shadow-brand-200"
                    : "bg-gray-50 text-gray-800 border border-gray-100"
                )}>
                  <p className="whitespace-pre-wrap">{formatMessageContent(message.content)}</p>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start animate-[fadeIn_0.3s_ease-out]">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5 items-center h-5">
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 bg-white p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 rounded-2xl border border-gray-200 bg-gray-50/50 p-2 transition-all focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 focus-within:bg-white">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte qualquer coisa..."
                rows={1}
                className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "flex-shrink-0 w-9 h-9 rounded-xl",
                  "bg-brand-600 hover:bg-brand-500 text-white",
                  "flex items-center justify-center",
                  "transition-all duration-200",
                  "disabled:opacity-30 disabled:cursor-not-allowed",
                  "active:scale-95",
                  "shadow-md shadow-brand-200"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-2">
              Clin.IA pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
