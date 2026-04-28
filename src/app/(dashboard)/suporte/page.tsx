"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  HelpCircle,
  ChevronDown,
  Mail,
  MessageCircle,
  Play,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "Como conectar o WhatsApp?",
    answer:
      "Acesse a página de Agentes IA ou WhatsApp e clique em 'Conectar QR Code'. Escaneie o QR Code com o WhatsApp do celular em Configurações > Aparelhos conectados > Conectar um aparelho.",
  },
  {
    question: "Como configurar os agentes?",
    answer:
      "Na página Agentes, cada agente possui um botão de toggle para ativar/desativar e um botão 'Editar' para ajustar delays de digitação, intervalo entre mensagens e quantidade máxima de mensagens por resposta.",
  },
  {
    question: "Como criar uma nova clínica?",
    answer:
      "Somente administradores FYRE podem criar novas clínicas. Entre em contato pelo e-mail suporte@fyreoficial.com ou pelo WhatsApp informando os dados da clínica (nome, CNPJ, responsável).",
  },
  {
    question: "Como bloquear horários na agenda?",
    answer:
      "Na página Agenda, clique no horário desejado e selecione 'Bloquear horário'. Você pode bloquear horários individuais ou intervalos completos para almoço, reuniões, etc.",
  },
  {
    question: "O que fazer quando a IA não responde?",
    answer:
      "Verifique se: 1) O WhatsApp está conectado (página Agentes). 2) O agente de Atendimento está ativo. 3) A conversa não está em modo 'Atendimento humano'. Se o problema persistir, entre em contato com o suporte.",
  },
];

const videoTutorials = [
  { title: "Primeiros passos no ClinPRO", duration: "5:30" },
  { title: "Configurando agentes de IA", duration: "8:15" },
  { title: "Gerenciando o pipeline de leads", duration: "6:45" },
  { title: "Usando a Clin.IA", duration: "4:20" },
];

export default function SuportePage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink">Central de Suporte</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Tire suas dúvidas e entre em contato com nossa equipe
        </p>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-brand-600" />
          Perguntas Frequentes
        </h2>
        <div className="space-y-2">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-hairline bg-canvas shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-parchment/80"
              >
                <span className="text-sm font-semibold text-ink">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-ink-tertiary transition-transform duration-200 shrink-0 ml-2",
                    openFaq === i && "rotate-180"
                  )}
                />
              </button>
              {openFaq === i && (
                <div className="border-t border-hairline px-5 py-4">
                  <p className="text-sm text-ink-secondary leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div>
        <h2 className="text-lg font-bold text-ink mb-4">
          Fale Conosco
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <a
            href="mailto:suporte@fyreoficial.com"
            className="group flex items-center gap-4 rounded-2xl border border-hairline bg-canvas p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">E-mail</p>
              <p className="text-sm text-ink-secondary">suporte@fyreoficial.com</p>
            </div>
            <ExternalLink className="h-4 w-4 text-ink-tertiary ml-auto group-hover:text-brand-500 transition-colors" />
          </a>
          <a
            href="https://wa.me/5541997246413"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-hairline bg-canvas p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">WhatsApp</p>
              <p className="text-sm text-ink-secondary">(41) 99724-6413</p>
            </div>
            <ExternalLink className="h-4 w-4 text-ink-tertiary ml-auto group-hover:text-emerald-500 transition-colors" />
          </a>
        </div>
      </div>

      {/* Video Tutorials */}
      <div>
        <h2 className="text-lg font-bold text-ink mb-4">
          Tutoriais em Vídeo
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {videoTutorials.map((video, i) => (
            <div
              key={i}
              className="group cursor-pointer rounded-2xl border border-hairline bg-canvas shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-canvas/90 shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="h-6 w-6 text-brand-600 ml-0.5" />
                </div>
                <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {video.duration}
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-ink">
                  {video.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
