"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Search, Bot, User, Lock } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types & sample data                                                */
/* ------------------------------------------------------------------ */

interface Message {
  id: number;
  from: "user" | "assistant";
  text: string;
  time: string;
}

interface Conversation {
  id: number;
  name: string;
  phone: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
}

const conversations: Conversation[] = [
  {
    id: 1,
    name: "Maria Silva",
    phone: "(11) 99123-4567",
    lastMessage: "Olá, gostaria de agendar uma harmonização facial.",
    time: "2 min",
    unread: 2,
    messages: [
      { id: 1, from: "user", text: "Olá, gostaria de saber sobre harmonização facial.", time: "14:30" },
      { id: 2, from: "assistant", text: "Olá Maria! Que bom que você se interessou pela harmonização facial. Temos várias opções de tratamento. Posso te contar mais sobre os procedimentos disponíveis?", time: "14:30" },
      { id: 3, from: "user", text: "Sim, por favor! Quanto custa em média?", time: "14:32" },
      { id: 4, from: "assistant", text: "Os valores variam de acordo com o procedimento. A harmonização completa tem valores a partir de R$ 2.500. Gostaria de agendar uma avaliação gratuita para conversarmos pessoalmente?", time: "14:32" },
      { id: 5, from: "user", text: "Sim! Pode ser na quinta-feira à tarde?", time: "14:35" },
      { id: 6, from: "assistant", text: "Perfeito! Tenho horário disponível na quinta às 14h ou às 16h. Qual prefere?", time: "14:35" },
    ],
  },
  {
    id: 2,
    name: "João Pereira",
    phone: "(11) 98765-4321",
    lastMessage: "Obrigado pela informação!",
    time: "15 min",
    unread: 0,
    messages: [
      { id: 1, from: "user", text: "Boa tarde, vocês fazem botox?", time: "13:10" },
      { id: 2, from: "assistant", text: "Boa tarde João! Sim, realizamos aplicação de botox com profissionais especializados. O procedimento é rápido e seguro.", time: "13:10" },
      { id: 3, from: "user", text: "Obrigado pela informação!", time: "13:15" },
    ],
  },
  {
    id: 3,
    name: "Ana Costa",
    phone: "(11) 97654-3210",
    lastMessage: "Qual o valor do procedimento?",
    time: "32 min",
    unread: 1,
    messages: [
      { id: 1, from: "user", text: "Oi, tenho interesse em limpeza de pele.", time: "12:40" },
      { id: 2, from: "assistant", text: "Olá Ana! A limpeza de pele é um dos nossos procedimentos mais procurados. Trabalhamos com técnicas avançadas para diferentes tipos de pele.", time: "12:40" },
      { id: 3, from: "user", text: "Qual o valor do procedimento?", time: "12:45" },
    ],
  },
  {
    id: 4,
    name: "Pedro Santos",
    phone: "(31) 99234-5678",
    lastMessage: "Posso ir amanhã às 14h?",
    time: "1h",
    unread: 0,
    messages: [
      { id: 1, from: "user", text: "Olá! Gostaria de agendar um peeling.", time: "11:00" },
      { id: 2, from: "assistant", text: "Olá Pedro! O peeling químico é excelente para renovação da pele. Temos horários disponíveis esta semana.", time: "11:01" },
      { id: 3, from: "user", text: "Posso ir amanhã às 14h?", time: "11:05" },
    ],
  },
  {
    id: 5,
    name: "Lucia Mendes",
    phone: "(11) 96543-2109",
    lastMessage: "Confirmado, até lá!",
    time: "2h",
    unread: 0,
    messages: [
      { id: 1, from: "assistant", text: "Olá Lucia! Lembrando da sua consulta amanhã às 10h para a harmonização facial.", time: "10:00" },
      { id: 2, from: "user", text: "Confirmado, até lá!", time: "10:05" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Conversations page                                                 */
/* ------------------------------------------------------------------ */

export default function ConversationsPage() {
  const [selectedId, setSelectedId] = useState(conversations[0].id);
  const [searchTerm, setSearchTerm] = useState("");

  const selected = conversations.find((c) => c.id === selectedId)!;

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conversas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Conversas gerenciadas pela IA do ClinPRO
        </p>
      </div>

      <div className="flex h-[calc(100vh-220px)] min-h-[500px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Left panel - contact list */}
        <div className="flex w-80 shrink-0 flex-col border-r border-gray-100">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 transition-colors focus:border-brand-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50",
                  conv.id === selectedId
                    ? "bg-brand-50/50"
                    : "hover:bg-gray-50",
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-semibold">
                  {conv.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        "text-sm truncate",
                        conv.id === selectedId
                          ? "font-semibold text-brand-700"
                          : "font-medium text-gray-800",
                      )}
                    >
                      {conv.name}
                    </p>
                    <span className="shrink-0 text-xs text-gray-400">
                      {conv.time}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400 truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="mt-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right panel - chat thread */}
        <div className="flex flex-1 flex-col">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-sm font-semibold">
              {selected.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {selected.name}
              </p>
              <p className="text-xs text-gray-400">{selected.phone}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50/30">
            {selected.messages.map((msg, i) => (
              <div
                key={msg.id}
                className={cn(
                  "flex animate-slide-up",
                  msg.from === "user" ? "justify-end" : "justify-start",
                )}
                style={{
                  animationDelay: `${i * 80}ms`,
                  animationFillMode: "both",
                }}
              >
                <div
                  className={cn(
                    "flex max-w-[75%] items-end gap-2",
                    msg.from === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs",
                      msg.from === "user"
                        ? "bg-gray-200 text-gray-600"
                        : "bg-brand-100 text-brand-700",
                    )}
                  >
                    {msg.from === "user" ? (
                      <User className="h-3.5 w-3.5" />
                    ) : (
                      <Bot className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      msg.from === "user"
                        ? "rounded-br-md bg-gray-200 text-gray-800"
                        : "rounded-bl-md bg-brand-600 text-white",
                    )}
                  >
                    {msg.text}
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        msg.from === "user"
                          ? "text-gray-400"
                          : "text-brand-200",
                      )}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Disabled input */}
          <div className="border-t border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <Lock className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-400">
                Gerenciado pela IA — As respostas são enviadas automaticamente
                pelo assistente ClinPRO
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
