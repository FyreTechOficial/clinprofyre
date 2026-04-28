"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { Sparkles, Send, Bot, User, Plus, MessageSquare, Trash2, Lightbulb, BarChart3, Megaphone, FileText } from "lucide-react";

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

const SUGGESTIONS = [
  { icon: BarChart3, text: "Analise a performance dos meus agentes" },
  { icon: Megaphone, text: "Crie um script de captação para implantes" },
  { icon: Lightbulb, text: "Dê dicas para reduzir no-show" },
  { icon: FileText, text: "Gere um post para Instagram sobre clareamento" },
];

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? conversations[0];
  const messages = activeConv?.messages ?? [WELCOME_MESSAGE];
  const isNewConv = messages.length <= 1;

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

  async function sendMessage(text: string) {
    const trimmed = text.trim();
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
      sendMessage(input);
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem-5.5rem)] -mx-4 -my-6 lg:-mx-8">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r border-divider bg-parchment/50">
        <div className="p-3">
          <button
            onClick={newConversation}
            className="w-full flex items-center justify-center gap-2 rounded-full brand-gradient px-4 py-2.5 text-[13px] font-medium text-white hover:brightness-110 active:scale-[0.97] transition-all"
          >
            <Plus className="h-4 w-4" />
            Nova conversa
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={cn(
                "group flex items-center gap-2 rounded-full px-3 py-2 cursor-pointer transition-all",
                conv.id === activeConvId
                  ? "bg-canvas border border-divider text-ink"
                  : "text-ink-secondary hover:text-ink hover:bg-canvas/50"
              )}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-50" />
              <span className="flex-1 text-[13px] truncate">{conv.title}</span>
              {conversations.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 shrink-0 rounded-full p-1 text-ink-tertiary hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Welcome / Empty state */}
            {isNewConv && (
              <div className="text-center mb-10 mt-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-[20px] brand-gradient mb-4 shadow-lg shadow-brand-900/20">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-[24px] font-bold text-ink tracking-tight">Clin.IA</h2>
                <p className="text-[14px] text-ink-secondary mt-1 max-w-sm mx-auto">
                  Sua assistente inteligente para gestão, marketing e vendas da clínica
                </p>

                {/* Suggestion cards */}
                <div className="grid grid-cols-2 gap-2 mt-8 max-w-lg mx-auto">
                  {SUGGESTIONS.map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.text}
                        onClick={() => sendMessage(s.text)}
                        className="flex items-start gap-2.5 rounded-[14px] border border-divider bg-canvas p-3 text-left hover:border-brand-300 hover:bg-brand-50/30 transition-all active:scale-[0.98] group"
                      >
                        <Icon className="h-4 w-4 text-ink-tertiary group-hover:text-brand-600 shrink-0 mt-0.5" />
                        <span className="text-[12px] text-ink-secondary group-hover:text-ink leading-relaxed">{s.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.filter((m) => !(isNewConv && m.id === "welcome")).map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 mb-6",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full brand-gradient flex items-center justify-center mt-0.5">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div className={cn(
                  "rounded-[16px] px-4 py-3 text-[14px] leading-relaxed max-w-[80%]",
                  message.role === "user"
                    ? "brand-gradient text-white"
                    : "bg-canvas border border-divider text-ink"
                )}>
                  <p className="whitespace-pre-wrap">{formatMessageContent(message.content)}</p>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-parchment border border-divider flex items-center justify-center mt-0.5">
                    <User className="w-4 h-4 text-ink-secondary" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 mb-6">
                <div className="flex-shrink-0 w-8 h-8 rounded-full brand-gradient flex items-center justify-center mt-0.5">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-canvas border border-divider rounded-[16px] px-4 py-3">
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
        <div className="border-t border-divider p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-2 rounded-[16px] border border-divider bg-canvas p-2 transition-all focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/20">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte qualquer coisa..."
                rows={1}
                className="flex-1 resize-none bg-transparent px-2 py-1.5 text-[14px] text-ink placeholder:text-ink-tertiary outline-none"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all",
                  input.trim() && !isLoading
                    ? "brand-gradient text-white hover:brightness-110 active:scale-95"
                    : "bg-parchment text-ink-tertiary"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[11px] text-ink-tertiary mt-2">
              Clin.IA pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
