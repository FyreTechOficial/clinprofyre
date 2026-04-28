"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  Bot, MessageSquare, CalendarCheck, TrendingUp, Users, Zap, Star,
  Shield, Clock, ChevronDown, ChevronRight, CheckCircle2, ArrowRight,
  Sparkles, BarChart3, Phone, Menu, X, Play, Megaphone,
} from "lucide-react";

// ── Data ──

const PAIN_POINTS = [
  { icon: Phone, title: "Leads sem resposta", description: "Pacientes mandam mensagem e ficam horas sem retorno. Cada minuto sem resposta é um paciente perdido para o concorrente." },
  { icon: Clock, title: "No-show constante", description: "30% dos agendamentos não comparecem. Sem confirmação automática, sua agenda vira prejuízo." },
  { icon: Users, title: "Equipe sobrecarregada", description: "Recepcionistas gastam o dia inteiro no WhatsApp respondendo as mesmas perguntas. Zero tempo para vender." },
  { icon: TrendingUp, title: "Zero visibilidade", description: "Não sabe quantos leads chegam, quantos convertem, qual procedimento vende mais. Decisões no escuro." },
];

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Atendimento 24/7 por IA",
    description: "Responde WhatsApp em segundos, qualifica o lead, identifica interesse e agenda. Funciona de madrugada, feriado e domingo.",
    highlight: "Resposta em < 10 segundos",
  },
  {
    icon: Bot,
    title: "5 Agentes Inteligentes",
    description: "Atendimento, Qualificação, Confirmação, Follow-up e Pós-venda. Cada um faz o trabalho de um funcionário dedicado.",
    highlight: "Substituem 3 recepcionistas",
  },
  {
    icon: CalendarCheck,
    title: "Confirmação Automática",
    description: "Confirma consultas 48h e 24h antes. Reagenda automaticamente se o paciente não puder ir. Reduz no-show em até 40%.",
    highlight: "-40% de faltas",
  },
  {
    icon: TrendingUp,
    title: "Pipeline Visual",
    description: "Kanban com 8 estágios. A IA move os leads automaticamente conforme qualifica. Drag & drop para ajuste manual.",
    highlight: "Funil inteligente",
  },
  {
    icon: Zap,
    title: "Follow-up Automático",
    description: "D1, D3, D7 após primeiro contato. Recupera no-show. Reativa pacientes inativos há mais de 90 dias.",
    highlight: "+25% de reativação",
  },
  {
    icon: BarChart3,
    title: "Relatórios em Tempo Real",
    description: "Dashboard com métricas de leads, agendamentos, mensagens e performance dos agentes. Tudo atualizado ao vivo.",
    highlight: "Decisões com dados",
  },
];

const STEPS = [
  { step: "01", title: "Fale com um especialista", description: "Converse com nosso time, entendemos o contexto da sua clínica — procedimentos, tom de voz, público e objetivos." },
  { step: "02", title: "Implementação personalizada", description: "Nossa equipe configura os 5 agentes de IA, integra o WhatsApp e personaliza tudo para a realidade da sua clínica." },
  { step: "03", title: "Treinamento e ativação", description: "Te mostramos como usar o dashboard, acompanhar métricas e ajustar os agentes. Tudo pronto para funcionar 24/7." },
  { step: "04", title: "Acompanhamento contínuo", description: "Nosso time monitora os resultados, ajusta os agentes e otimiza a performance da sua clínica continuamente." },
];

const TESTIMONIALS = [
  { name: "Dra. Marina Costa", clinic: "Sorriso Perfeito", text: "Reduzi 40% do no-show no primeiro mês. A IA confirma sozinha e os pacientes adoram a velocidade de resposta.", photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face" },
  { name: "Dr. Rafael Santos", clinic: "Instituto Oral Premium", text: "Antes eu perdia leads de madrugada. Agora a IA atende 24h e já agenda direto. Minha recepcionista foca em quem está na clínica.", photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" },
  { name: "Dra. Juliana Lima", clinic: "Estética Dental JL", text: "O pipeline mudou minha visão do negócio. Agora sei exatamente onde cada lead está e quanto vou faturar no mês.", photo: "https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=100&h=100&fit=crop&crop=face" },
  { name: "Dr. Pedro Almeida", clinic: "Odonto Vida Centro", text: "O follow-up automático reativou pacientes que eu achava perdidos. Já recuperei mais de R$30 mil em tratamentos.", photo: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop&crop=face" },
  { name: "Dra. Camila Ferreira", clinic: "CF Implantes", text: "A qualificação por IA é absurda. Ela identifica o interesse, classifica o lead e já sugere o procedimento certo.", photo: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=100&h=100&fit=crop&crop=face" },
  { name: "Dr. Lucas Mendes", clinic: "LM Ortodontia", text: "Melhor investimento que fiz. O retorno veio na primeira semana. Minha taxa de conversão dobrou.", photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face" },
];

const STATS = [
  { value: "< 10s", label: "Tempo de resposta" },
  { value: "-40%", label: "Redução no-show" },
  { value: "24/7", label: "Atendimento IA" },
  { value: "+60%", label: "Mais agendamentos" },
];

const FAQS = [
  { q: "Preciso trocar meu número de WhatsApp?", a: "Não. O ClinPro conecta no seu número atual via QR Code. Seus pacientes continuam falando com o mesmo número de sempre." },
  { q: "A IA substitui minha recepcionista?", a: "Não substitui, complementa. A IA cuida do primeiro atendimento, qualificação e confirmação. Sua recepcionista foca no atendimento presencial e em fechar vendas." },
  { q: "Funciona para qualquer tipo de clínica?", a: "Sim. Odontologia, estética, dermatologia, fisioterapia, medicina. Você configura os procedimentos, preços e tom de voz específicos da sua clínica." },
  { q: "Quanto tempo leva para configurar?", a: "Menos de 30 minutos. Conecte o WhatsApp, configure os dados da clínica e ative os agentes. Temos um wizard que guia todo o processo." },
  { q: "E se a IA não souber responder?", a: "Ela informa educadamente que vai encaminhar para a equipe e alerta seu grupo no WhatsApp. Você nunca perde o lead." },
  { q: "Posso desativar a IA para um paciente específico?", a: "Sim. Cada conversa tem um toggle para desativar a IA. Ideal quando você quer atender pessoalmente um caso específico." },
];

// ── Components ──

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-canvas/60 backdrop-blur-xl border-b border-divider/40 transition-all">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between h-16">
        <img src="/logo-clinpro-full.png" alt="ClinPro" className="h-8" />
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Funcionalidades", href: "#funcionalidades" },
            { label: "Sistema", href: "#veja-na-pratica" },
            { label: "Simulador", href: "#simulador" },
            { label: "Depoimentos", href: "#depoimentos" },
            { label: "FAQ", href: "#faq" },
          ].map((item) => (
            <a key={item.label} href={item.href} className="text-[14px] text-ink-secondary hover:text-ink transition-colors">{item.label}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <a href="/login" className="text-[14px] font-medium text-ink-secondary hover:text-ink transition-colors px-4 py-2">Entrar</a>
          <a href="https://wa.me/5541997038671?text=Eu%20quero%20o%20ClinPro" target="_blank" className="rounded-full brand-gradient px-5 py-2.5 text-[13px] font-medium text-white hover:brightness-110 active:scale-[0.97] transition-all">
            Eu quero o ClinPro
          </a>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-ink">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-canvas/95 backdrop-blur-xl border-t border-divider/40 px-4 py-4 space-y-3 animate-slide-up">
          {[
            { label: "Funcionalidades", href: "#funcionalidades" },
            { label: "Sistema", href: "#veja-na-pratica" },
            { label: "Simulador", href: "#simulador" },
            { label: "Depoimentos", href: "#depoimentos" },
            { label: "FAQ", href: "#faq" },
          ].map((item) => (
            <a key={item.label} href={item.href} onClick={() => setOpen(false)} className="block text-[14px] text-ink-secondary py-2">{item.label}</a>
          ))}
          <a href="/login" className="block text-[14px] text-ink py-2 font-medium">Entrar</a>
          <a href="https://wa.me/5541997038671?text=Eu%20quero%20o%20ClinPro" target="_blank" className="block text-center rounded-full brand-gradient px-5 py-3 text-[14px] font-medium text-white">Eu quero o ClinPro</a>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-0 lg:pt-36">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 via-transparent to-transparent" />

      {/* Floating icon bubbles */}
      <div className="hidden lg:block">
        {[
          { icon: MessageSquare, pos: "top-[18%] left-[8%]", size: "h-14 w-14", delay: "0s", dur: "6s" },
          { icon: Bot, pos: "top-[30%] right-[7%]", size: "h-12 w-12", delay: "1s", dur: "7s" },
          { icon: CalendarCheck, pos: "top-[55%] left-[5%]", size: "h-11 w-11", delay: "0.5s", dur: "5.5s" },
          { icon: TrendingUp, pos: "top-[22%] right-[15%]", size: "h-10 w-10", delay: "2s", dur: "6.5s" },
          { icon: Users, pos: "top-[48%] right-[4%]", size: "h-12 w-12", delay: "1.5s", dur: "7.5s" },
          { icon: Zap, pos: "top-[62%] left-[12%]", size: "h-10 w-10", delay: "0.8s", dur: "5s" },
          { icon: Star, pos: "top-[15%] left-[20%]", size: "h-9 w-9", delay: "2.5s", dur: "8s" },
          { icon: BarChart3, pos: "top-[60%] right-[14%]", size: "h-10 w-10", delay: "1.8s", dur: "6s" },
          { icon: Sparkles, pos: "top-[38%] left-[3%]", size: "h-11 w-11", delay: "0.3s", dur: "7s" },
          { icon: Phone, pos: "top-[40%] right-[10%]", size: "h-9 w-9", delay: "2.2s", dur: "5.5s" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={cn("absolute rounded-full bg-brand-100/40 flex items-center justify-center", item.pos, item.size)}
              style={{ animation: `floatBadge ${item.dur} ease-in-out infinite`, animationDelay: item.delay }}
            >
              <Icon className="h-[45%] w-[45%] text-brand-300" />
            </div>
          );
        })}
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        {/* Top content */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-canvas border border-divider px-4 py-2 mb-8 shadow-sm animate-[fadeInDown_0.6s_ease-out]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[13px] font-medium text-ink">Usado por +50 clínicas no Brasil</span>
          </div>

          <h1 className="text-[36px] sm:text-[48px] lg:text-[58px] font-bold text-ink tracking-tight leading-[1.08] animate-[fadeInUp_0.7s_ease-out_0.1s_both]">
            Sua clínica atendendo<br />
            <span className="gradient-text">24 horas por dia</span> sem<br />
            contratar ninguém
          </h1>

          <p className="mt-6 text-[16px] sm:text-[18px] text-ink-secondary max-w-2xl mx-auto leading-relaxed animate-[fadeInUp_0.7s_ease-out_0.25s_both]">
            5 agentes de IA que respondem WhatsApp em segundos, qualificam leads, confirmam consultas e fazem follow-up.{" "}
            <strong className="text-ink">Reduza no-show em 40%</strong> e{" "}
            <strong className="text-ink">dobre seus agendamentos</strong>.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fadeInUp_0.7s_ease-out_0.4s_both]">
            <a
              href="https://wa.me/5541997038671?text=Quero%20testar%20o%20ClinPro"
              target="_blank"
              className="rounded-full brand-gradient px-8 py-4 text-[16px] font-semibold text-white hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2 shadow-lg shadow-brand-900/20"
            >
              Eu quero o ClinPro <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* System mockup */}
        <div className="mt-16 relative animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
          {/* Glow behind mockup */}
          <div className="absolute -inset-4 bg-gradient-to-t from-brand-500/20 via-brand-400/10 to-transparent rounded-[28px] blur-2xl -z-10" />

          {/* Browser frame — full dashboard */}
          <div className="rounded-t-[20px] border border-divider border-b-0 bg-canvas overflow-hidden shadow-2xl shadow-brand-900/10">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-divider bg-parchment/80">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-1.5 rounded-full bg-canvas border border-divider px-3 py-1 max-w-[200px] w-full">
                  <Shield className="h-2.5 w-2.5 text-emerald-500" />
                  <span className="text-[10px] text-ink-tertiary">app.clinpro.com.br</span>
                </div>
              </div>
            </div>

            {/* Full system */}
            <div className="bg-parchment">
              {/* Topbar */}
              <div className="flex items-center justify-between px-5 py-2.5 bg-canvas/80 border-b border-divider">
                <div className="flex items-center gap-2">
                  <img src="/icon-clinpro-light.png" alt="" className="h-5 w-5" />
                  <span className="text-[12px] font-semibold text-ink">Dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-parchment border border-divider px-3 py-1">
                    <Users className="h-3 w-3 text-ink-tertiary" />
                    <span className="text-[9px] text-ink-tertiary">Buscar...</span>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-divider" />
                  <div className="h-6 w-6 rounded-full brand-gradient flex items-center justify-center text-[8px] font-bold text-white">JM</div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 space-y-3">
                {/* Banner */}
                <div className="relative overflow-hidden rounded-[14px] brand-gradient px-5 py-5">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/[0.06] blur-xl" />
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/[0.04] blur-xl" />
                  </div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-[8px] text-white/50 uppercase tracking-wider font-medium">Bem-vindo de volta</p>
                      <p className="text-[16px] sm:text-[18px] font-bold text-white mt-0.5">Olá, Dr. Rafael</p>
                      <p className="text-[10px] text-white/50 mt-1">Aqui está o resumo da sua clínica hoje</p>
                    </div>
                    <div className="hidden sm:flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-2.5 py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] text-white font-medium">5 agentes ativos</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-2.5 py-1">
                        <span className="text-[9px] text-white/70">segunda-feira, 28 de abril</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { v: "23", l: "Leads Hoje", icon: Users, color: "text-brand-600 bg-brand-50" },
                    { v: "8", l: "Agendamentos", icon: CalendarCheck, color: "text-blue-600 bg-blue-50" },
                    { v: "847", l: "Mensagens IA", icon: MessageSquare, color: "text-emerald-600 bg-emerald-50" },
                    { v: "5", l: "Leads Quentes", icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
                  ].map((m) => {
                    const MIcon = m.icon;
                    return (
                      <div key={m.l} className="rounded-[10px] bg-canvas border border-divider p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[8px] text-ink-tertiary">{m.l}</p>
                            <p className="text-[18px] sm:text-[20px] font-bold text-ink leading-none mt-1">{m.v}</p>
                          </div>
                          <div className={cn("h-7 w-7 rounded-[6px] flex items-center justify-center", m.color)}>
                            <MIcon className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 rounded-[10px] bg-canvas border border-divider p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-ink">Performance dos Agentes</span>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-brand-600" />
                        <span className="text-[7px] text-ink-tertiary">Hoje</span>
                      </div>
                    </div>
                    <svg viewBox="0 0 300 80" className="w-full h-20 sm:h-24">
                      <defs>
                        <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,70 L30,65 60,55 90,60 120,40 150,25 180,30 210,15 240,20 270,12 300,18" fill="none" stroke="#7c3aed" strokeWidth="2" />
                      <path d="M0,70 L30,65 60,55 90,60 120,40 150,25 180,30 210,15 240,20 270,12 300,18 L300,80 L0,80Z" fill="url(#heroGrad)" />
                      {[[30,65],[60,55],[120,40],[150,25],[210,15],[270,12]].map(([x,y]) => (
                        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#7c3aed" stroke="white" strokeWidth="1.5" />
                      ))}
                    </svg>
                    <div className="flex justify-between mt-1">
                      {["Confirm.", "Follow-up", "Pós-venda", "Atendimento", "Qualific."].map((l) => (
                        <span key={l} className="text-[7px] text-ink-tertiary">{l}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[10px] bg-canvas border border-divider p-3 flex flex-col">
                    <span className="text-[10px] font-semibold text-ink mb-2">Score dos Leads</span>
                    <div className="flex-1 flex items-center justify-center">
                      <svg viewBox="0 0 80 80" className="w-16 h-16 sm:w-20 sm:h-20">
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#e8e8ed" strokeWidth="8" />
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray="47 141" strokeDashoffset="0" strokeLinecap="round" />
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="75 113" strokeDashoffset="-47" strokeLinecap="round" />
                        <circle cx="40" cy="40" r="30" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray="66 122" strokeDashoffset="-122" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="flex justify-center gap-3 mt-1">
                      {[{c:"bg-emerald-500",l:"Quente 5"},{c:"bg-amber-500",l:"Morno 12"},{c:"bg-red-500",l:"Frio 8"}].map((i) => (
                        <div key={i.l} className="flex items-center gap-1">
                          <span className={cn("h-1.5 w-1.5 rounded-full",i.c)} />
                          <span className="text-[7px] text-ink-tertiary">{i.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Agents + Activity */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-[10px] bg-canvas border border-divider p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Bot className="h-3 w-3 text-brand-700" />
                      <span className="text-[10px] font-semibold text-ink">Agentes Hoje</span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        {name:"Atendimento",v:"342",on:true},
                        {name:"Qualificação",v:"189",on:true},
                        {name:"Confirmação",v:"156",on:true},
                        {name:"Follow-up",v:"98",on:true},
                        {name:"Pós-venda",v:"62",on:false},
                      ].map((a) => (
                        <div key={a.name} className="flex items-center justify-between rounded-[6px] bg-parchment px-2 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("h-1.5 w-1.5 rounded-full",a.on?"bg-emerald-500":"bg-ink-tertiary")} />
                            <span className="text-[8px] font-medium text-ink">{a.name}</span>
                          </div>
                          <span className="text-[9px] font-bold text-ink">{a.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 rounded-[10px] bg-canvas border border-divider p-3">
                    <span className="text-[10px] font-semibold text-ink">Atividade Recente</span>
                    <div className="mt-2 space-y-2">
                      {[
                        {t:"Novo lead: Ana Souza via WhatsApp",c:"text-blue-600 bg-blue-50",time:"2min"},
                        {t:"Agendamento confirmado: Carlos Lima",c:"text-emerald-600 bg-emerald-50",time:"15min"},
                        {t:"Lead qualificado como quente: Fernanda R.",c:"text-brand-700 bg-brand-50",time:"32min"},
                        {t:"Follow-up enviado para Pedro Martins",c:"text-amber-600 bg-amber-50",time:"1h"},
                        {t:"NPS recebido: 9/10 de Juliana Ferreira",c:"text-rose-600 bg-rose-50",time:"2h"},
                      ].map((item) => (
                        <div key={item.t} className="flex items-start gap-2">
                          <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",item.c)}>
                            <CheckCircle2 className="h-2.5 w-2.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[8px] text-ink truncate">{item.t}</p>
                            <p className="text-[7px] text-ink-tertiary">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dock */}
              <div className="flex justify-center pb-3">
                <div className="flex items-center gap-1 rounded-[12px] bg-canvas/80 backdrop-blur-sm border border-divider px-2 py-1.5 shadow-lg">
                  {[BarChart3, TrendingUp, Users, MessageSquare, CalendarCheck, Bot, Megaphone, Sparkles, Shield].map((DIcon, i) => (
                    <div key={i} className={cn("h-7 w-7 rounded-[6px] flex items-center justify-center", i === 0 ? "brand-gradient" : "bg-parchment")}>
                      <DIcon className={cn("h-3.5 w-3.5", i === 0 ? "text-white" : "text-ink-tertiary")} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Fade out bottom */}
          <div className="h-24 bg-gradient-to-t from-parchment to-transparent -mt-24 relative z-10" />
        </div>
      </div>
    </section>
  );
}

function PainPoints() {
  const problems = [
    {
      icon: Phone,
      stat: "78%",
      statLabel: "dos leads não recebem resposta em menos de 5 minutos",
      title: "Leads sem resposta",
      description: "Pacientes mandam mensagem e ficam horas esperando. Cada minuto sem resposta é um paciente que agenda no concorrente.",
      solution: "IA responde em < 10 segundos",
    },
    {
      icon: Clock,
      stat: "30%",
      statLabel: "dos agendamentos resultam em não comparecimento",
      title: "No-show constante",
      description: "Sem confirmação automática, pacientes simplesmente esquecem. Sua agenda fica cheia de buracos e dinheiro perdido.",
      solution: "Confirmação 48h e 24h antes",
    },
    {
      icon: Users,
      stat: "6h",
      statLabel: "por dia gastas respondendo as mesmas perguntas",
      title: "Equipe sobrecarregada",
      description: "Recepcionistas gastam o dia inteiro no WhatsApp respondendo dúvidas repetitivas. Zero tempo para vender e converter.",
      solution: "5 agentes IA trabalham 24/7",
    },
    {
      icon: TrendingUp,
      stat: "0",
      statLabel: "visibilidade sobre conversão e funil de vendas",
      title: "Decisões no escuro",
      description: "Não sabe quantos leads chegam, quantos convertem, qual procedimento vende mais. Impossível crescer sem dados.",
      solution: "Dashboard em tempo real",
    },
  ];

  return (
    <section className="py-24 bg-canvas relative overflow-hidden">
      {/* BG decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-red-500/[0.03] blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-red-500/[0.02] blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        {/* Header — left aligned with counter */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-14">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                <X className="h-3 w-3 text-white" />
              </div>
              <span className="text-[13px] font-semibold text-red-500 uppercase tracking-wider">O problema</span>
            </div>
            <h2 className="text-[32px] sm:text-[40px] font-bold text-ink tracking-tight leading-[1.1]">
              Sua clínica está <span className="text-red-500">perdendo<br />dinheiro</span> agora mesmo
            </h2>
            <p className="mt-4 text-[16px] text-ink-secondary leading-relaxed max-w-xl">
              Enquanto você lê isso, leads estão mandando mensagem e não recebendo resposta. Pacientes estão faltando consultas. E sua equipe está sobrecarregada com tarefas que a IA resolve em segundos.
            </p>
          </div>
          <div className="lg:col-span-2 flex items-center justify-center lg:justify-end">
            <div className="grid grid-cols-2 gap-3">
              {[
                { v: "R$ 4.500", l: "perdidos/mês em no-show", c: "text-red-600" },
                { v: "23 leads", l: "sem resposta por semana", c: "text-red-600" },
                { v: "6 horas", l: "desperdiçadas por dia", c: "text-red-600" },
                { v: "R$ 0", l: "investido em automação", c: "text-red-600" },
              ].map((s) => (
                <div key={s.l} className="rounded-[14px] border border-red-100 bg-red-50/50 px-4 py-3.5 text-center">
                  <p className={cn("text-[20px] font-bold", s.c)}>{s.v}</p>
                  <p className="text-[10px] text-ink-tertiary mt-0.5 leading-tight">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {problems.map((pain, i) => {
            const Icon = pain.icon;
            return (
              <div key={pain.title} className="rounded-[18px] border border-red-100 bg-canvas hover:border-red-200 transition-all flex flex-col">
                {/* Problem */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-red-100 text-red-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[28px] font-bold text-red-500/15">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="text-[28px] font-bold text-red-500 leading-none">{pain.stat}</p>
                  <p className="text-[11px] text-red-400 mt-1 mb-3 min-h-[30px]">{pain.statLabel}</p>
                  <h3 className="text-[15px] font-semibold text-ink">{pain.title}</h3>
                  <p className="text-[13px] text-ink-secondary mt-1 leading-relaxed flex-1">{pain.description}</p>
                </div>

                {/* Solution */}
                <div className="mx-3 mb-3 rounded-[12px] bg-brand-50/50 border border-brand-100 px-4 py-3 flex items-center gap-3 h-[64px]">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full brand-gradient text-white shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <p className="text-[13px] font-semibold text-brand-700 leading-tight">{pain.solution}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-[15px] text-ink-secondary mb-4">Reconheceu algum desses problemas?</p>
          <a
            href="https://wa.me/5541997038671?text=Quero%20resolver%20esses%20problemas%20na%20minha%20clínica"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full brand-gradient px-8 py-4 text-[15px] font-semibold text-white hover:brightness-110 active:scale-[0.97] transition-all shadow-lg shadow-brand-900/20"
          >
            Eu quero o ClinPro <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function SystemShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: "WhatsApp IA", icon: MessageSquare, status: "live" as const, description: "Atendimento automático 24/7 no WhatsApp. IA responde em segundos, entende contexto, transcreve áudios e qualifica leads automaticamente.", highlights: ["Resposta em < 10s", "Transcrição de áudio", "Qualificação automática", "Funciona 24/7"] },
    { label: "Pipeline", icon: TrendingUp, status: "live" as const, description: "Kanban visual com 8 estágios de funil. A IA move os leads automaticamente conforme qualifica. Drag & drop para ajuste manual.", highlights: ["8 estágios", "Movimentação por IA", "Drag & drop", "Lead scoring"] },
    { label: "Agentes IA", icon: Bot, status: "live" as const, description: "5 agentes especializados trabalhando 24/7: Atendimento, Qualificação, Confirmação de consultas, Follow-up e Pós-atendimento.", highlights: ["5 agentes", "Configuráveis", "Métricas em tempo real", "Toggle on/off"] },
    { label: "Clin.IA", icon: Sparkles, status: "live" as const, description: "Assistente inteligente que analisa dados da clínica, gera scripts de venda, cria conteúdo e dá dicas de marketing personalizadas.", highlights: ["Scripts de venda", "Análise de dados", "Geração de conteúdo", "Dicas de marketing"] },
    { label: "Dashboard", icon: BarChart3, status: "live" as const, description: "Métricas em tempo real: leads, agendamentos, mensagens dos agentes, funil de conversão e performance individual.", highlights: ["Tempo real", "Gráficos", "KPIs", "Atividade recente"] },
    { label: "Campanhas", icon: Megaphone, status: "soon" as const, description: "Envie mensagens em massa segmentadas via WhatsApp. Campanhas de reativação, promoções e follow-ups programados.", highlights: ["WhatsApp em massa", "Segmentação", "Agendamento", "Métricas"] },
    { label: "Tráfego", icon: TrendingUp, status: "soon" as const, description: "Dashboard integrado com Meta Ads e Google Ads. Acompanhe CPC, ROI, conversões e investimento em tempo real.", highlights: ["Meta Ads", "Google Ads", "ROI", "CPC"] },
  ];

  const screenContent = (idx: number) => {
    if (tabs[idx].status === "soon") {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
          <div className="h-16 w-16 rounded-[16px] bg-brand-50 flex items-center justify-center mb-4">
            {(() => { const I = tabs[idx].icon; return <I className="h-8 w-8 text-brand-400" />; })()}
          </div>
          <p className="text-[18px] font-bold text-ink mb-1">{tabs[idx].label}</p>
          <p className="text-[13px] text-ink-tertiary mb-4">Em breve disponível</p>
          <div className="rounded-full brand-gradient px-4 py-2 text-[11px] font-medium text-white">Lançamento em breve</div>
        </div>
      );
    }
    const screens: Record<number, React.ReactNode> = {
      0: ( /* WhatsApp */
        <div className="flex h-full">
          <div className="w-[32%] border-r border-divider bg-canvas/50">
            <div className="p-2.5 border-b border-divider"><div className="flex items-center gap-1.5 rounded-full bg-parchment px-2.5 py-1"><Users className="h-3 w-3 text-ink-tertiary" /><span className="text-[9px] text-ink-tertiary">Buscar conversas...</span></div></div>
            <div className="p-1.5 space-y-0.5">
              {[{n:"Ana Souza",m:"Quero agendar implante...",t:"agora",u:2,a:true},{n:"Carlos Lima",m:"Confirmado para quinta",t:"15min",u:0,a:false},{n:"Fernanda R.",m:"Quanto custa clareamento?",t:"1h",u:1,a:false},{n:"Dr. Marcos",m:"Ok, vou verificar",t:"3h",u:0,a:false},{n:"Juliana F.",m:"Obrigada pelo atendimento!",t:"5h",u:0,a:false}].map((c,i)=>(
                <div key={c.n} className={cn("flex items-center gap-2 rounded-[8px] p-2 cursor-pointer transition-all",i===0?"bg-brand-50 border border-brand-100":"hover:bg-parchment/80")}>
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0",i===0?"brand-gradient text-white":"bg-divider text-ink-tertiary")}>{c.n.split(" ").map(x=>x[0]).join("")}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between"><p className="text-[10px] font-semibold text-ink truncate">{c.n}</p><span className="text-[7px] text-ink-tertiary shrink-0">{c.t}</span></div>
                    <p className="text-[8px] text-ink-tertiary truncate">{c.m}</p>
                  </div>
                  {c.u>0&&<span className="h-4 min-w-[16px] rounded-full bg-brand-600 text-[7px] text-white flex items-center justify-center font-bold px-1">{c.u}</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col bg-parchment/30">
            <div className="border-b border-divider px-3 py-2 flex items-center gap-2 bg-canvas">
              <div className="h-7 w-7 rounded-full brand-gradient flex items-center justify-center text-[8px] font-bold text-white">AS</div>
              <div className="flex-1"><p className="text-[10px] font-semibold text-ink">Ana Souza</p><p className="text-[7px] text-emerald-500 font-medium">digitando...</p></div>
              <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5"><Bot className="h-2.5 w-2.5 text-emerald-600"/><span className="text-[7px] font-semibold text-emerald-700">IA Ativa</span></div>
            </div>
            <div className="flex-1 p-3 space-y-2 overflow-hidden">
              <div className="flex justify-end"><div className="rounded-[10px] rounded-tr-[4px] brand-gradient text-white px-3 py-1.5 text-[9px] max-w-[70%] shadow-sm">Olá, quero agendar uma consulta de implante dentário</div></div>
              <div className="flex gap-1.5"><div className="h-5 w-5 rounded-full brand-gradient flex items-center justify-center shrink-0 mt-0.5"><Bot className="h-2.5 w-2.5 text-white"/></div><div className="rounded-[10px] rounded-tl-[4px] bg-canvas border border-divider px-3 py-1.5 text-[9px] text-ink max-w-[70%] shadow-sm">Olá Ana! 😊 Que bom que se interessou! Temos ótimos horários disponíveis. Você prefere <strong>manhã ou tarde</strong>?</div></div>
              <div className="flex justify-end"><div className="rounded-[10px] rounded-tr-[4px] brand-gradient text-white px-3 py-1.5 text-[9px] max-w-[70%] shadow-sm">Prefiro pela manhã, se possível quinta</div></div>
              <div className="flex gap-1.5"><div className="h-5 w-5 rounded-full brand-gradient flex items-center justify-center shrink-0 mt-0.5"><Bot className="h-2.5 w-2.5 text-white"/></div><div className="rounded-[10px] rounded-tl-[4px] bg-canvas border border-divider px-3 py-1.5 text-[9px] text-ink max-w-[70%] shadow-sm">Perfeito! 📅 Agendei para <strong>quinta-feira às 9h</strong> com o <strong>Dr. Marcos</strong>. Vou te enviar a confirmação 24h antes. Algo mais?</div></div>
              <div className="flex justify-end"><div className="rounded-[10px] rounded-tr-[4px] brand-gradient text-white px-3 py-1.5 text-[9px] max-w-[70%] shadow-sm">Perfeito, obrigada!</div></div>
              <div className="flex gap-1.5"><div className="h-5 w-5 rounded-full brand-gradient flex items-center justify-center shrink-0 mt-0.5"><Bot className="h-2.5 w-2.5 text-white"/></div><div className="rounded-[10px] rounded-tl-[4px] bg-canvas border border-divider px-3 py-1.5 text-[9px] text-ink max-w-[70%] shadow-sm">Por nada, Ana! Qualquer dúvida é só chamar. Até quinta! ✨</div></div>
            </div>
            <div className="border-t border-divider p-2 flex items-center gap-2 bg-canvas">
              <div className="flex-1 rounded-full bg-parchment border border-divider px-3 py-1.5 text-[8px] text-ink-tertiary">Digite uma mensagem...</div>
              <div className="h-6 w-6 rounded-full brand-gradient flex items-center justify-center"><ArrowRight className="h-3 w-3 text-white"/></div>
            </div>
          </div>
        </div>
      ),
      1: ( /* Pipeline */
        <div className="p-3 space-y-2.5 h-full">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-ink">Pipeline</span>
            <div className="flex gap-1">{["Novo","Contato","Qualificado","Agendado","Atendido","Fidelizado"].map((s,i)=>(
              <span key={s} className="rounded-full px-1.5 py-0.5 text-[6px] font-semibold" style={{backgroundColor:["#8b5cf615","#6366f115","#3b82f615","#06b6d415","#10b98115","#22c55e15"][i],color:["#8b5cf6","#6366f1","#3b82f6","#06b6d4","#10b981","#22c55e"][i]}}>{s}</span>
            ))}</div>
          </div>
          <div className="flex gap-1.5 overflow-hidden flex-1">
            {[
              {s:"Novo",c:"#8b5cf6",l:[{n:"Ana S.",sc:"quente",p:"Implante",t:"2min"},{n:"Carlos L.",sc:"morno",p:"Clareamento",t:"15min"},{n:"Pedro M.",sc:"frio",p:"Avaliação",t:"1h"}]},
              {s:"Qualificado",c:"#3b82f6",l:[{n:"Juliana F.",sc:"quente",p:"Lente",t:"30min"},{n:"Rafael A.",sc:"quente",p:"Implante",t:"2h"}]},
              {s:"Agendado",c:"#06b6d4",l:[{n:"Maria C.",sc:"quente",p:"Botox",t:"1d"},{n:"Lucas R.",sc:"morno",p:"Limpeza",t:"2d"}]},
              {s:"Atendido",c:"#10b981",l:[{n:"Camila P.",sc:"quente",p:"Implante",t:"3d"}]},
              {s:"Fidelizado",c:"#22c55e",l:[{n:"Bruno S.",sc:"quente",p:"Manutenção",t:"7d"},{n:"Laura M.",sc:"quente",p:"Retorno",t:"14d"}]},
            ].map((col)=>(
              <div key={col.s} className="flex-1 min-w-0 rounded-[8px] bg-canvas/50 border border-divider/50 p-1.5">
                <div className="flex items-center gap-1 mb-1.5 px-0.5">
                  <span className="h-2 w-2 rounded-full ring-1 ring-canvas" style={{backgroundColor:col.c}}/>
                  <span className="text-[8px] font-semibold text-ink">{col.s}</span>
                  <span className="ml-auto text-[7px] font-bold text-ink-tertiary bg-parchment rounded-full h-4 w-4 flex items-center justify-center">{col.l.length}</span>
                </div>
                <div className="space-y-1">
                  {col.l.map((lead)=>(
                    <div key={lead.n} className="rounded-[6px] bg-canvas border border-divider p-1.5 shadow-sm">
                      <div className="flex items-center justify-between"><p className="text-[8px] font-semibold text-ink truncate">{lead.n}</p><span className={cn("rounded-full px-1 py-0.5 text-[6px] font-bold",lead.sc==="quente"?"bg-emerald-50 text-emerald-700":lead.sc==="morno"?"bg-amber-50 text-amber-700":"bg-red-50 text-red-700")}>{lead.sc}</span></div>
                      <div className="flex items-center justify-between mt-0.5"><span className="text-[7px] text-ink-tertiary truncate">{lead.p}</span><span className="text-[6px] text-ink-tertiary">{lead.t}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      2: ( /* Agents */
        <div className="p-3 space-y-2">
          <div className="grid grid-cols-4 gap-1.5">
            {[{v:"5/5",l:"Ativos",c:"text-brand-700"},{v:"847",l:"Msgs Hoje",c:"text-blue-600"},{v:"98%",l:"Sucesso",c:"text-emerald-600"},{v:"1.2K",l:"Total",c:"text-amber-600"}].map(s=>(
              <div key={s.l} className="rounded-[8px] bg-canvas border border-divider p-2 text-center"><p className={cn("text-[14px] font-bold",s.c)}>{s.v}</p><p className="text-[7px] text-ink-tertiary">{s.l}</p></div>
            ))}
          </div>
          {[
            {name:"Atendimento 24/7",color:"from-brand-500 to-brand-700",msgs:342,rate:"99%",on:true},
            {name:"Qualificação",color:"from-amber-500 to-amber-600",msgs:189,rate:"97%",on:true},
            {name:"Confirmação",color:"from-blue-500 to-blue-600",msgs:156,rate:"98%",on:true},
            {name:"Follow-up",color:"from-emerald-500 to-emerald-600",msgs:98,rate:"96%",on:true},
            {name:"Pós-venda",color:"from-rose-500 to-rose-600",msgs:62,rate:"100%",on:true},
          ].map(a=>(
            <div key={a.name} className="flex items-center gap-2.5 rounded-[10px] bg-canvas border border-divider p-2">
              <div className={cn("h-8 w-8 rounded-[8px] bg-gradient-to-br flex items-center justify-center text-white shrink-0",a.color)}><Bot className="h-3.5 w-3.5"/></div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-ink">{a.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-0.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/><span className="text-[7px] text-ink-tertiary">Online</span></span>
                  <span className="text-[7px] text-ink-tertiary">•</span>
                  <span className="text-[7px] text-emerald-600 font-medium">{a.rate}</span>
                </div>
              </div>
              <span className="text-[12px] font-bold text-ink">{a.msgs}</span>
              <div className="h-4 w-8 rounded-full bg-brand-600 relative shrink-0"><span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow-sm"/></div>
            </div>
          ))}
        </div>
      ),
      3: ( /* Clin.IA */
        <div className="flex flex-col h-full">
          <div className="flex-1 p-3 space-y-2 overflow-hidden">
            <div className="text-center py-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] brand-gradient mb-1"><Sparkles className="h-5 w-5 text-white"/></div>
              <p className="text-[10px] font-bold text-ink">Clin.IA</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {["Analise meu funil","Script de captação","Dicas de marketing","Post para Instagram"].map(s=>(
                <div key={s} className="rounded-[8px] border border-divider bg-canvas px-2 py-1.5 text-[8px] text-ink-secondary text-center cursor-pointer hover:border-brand-200">{s}</div>
              ))}
            </div>
            <div className="flex justify-end"><div className="rounded-[10px] rounded-tr-[4px] brand-gradient text-white px-3 py-1.5 text-[9px] max-w-[75%]">Crie um script de captação para implantes</div></div>
            <div className="flex gap-1.5"><div className="h-5 w-5 rounded-full brand-gradient flex items-center justify-center shrink-0 mt-0.5"><Sparkles className="h-2.5 w-2.5 text-white"/></div><div className="rounded-[10px] rounded-tl-[4px] bg-canvas border border-divider px-3 py-1.5 text-[9px] text-ink max-w-[80%]"><strong className="text-brand-700">Script WhatsApp — Implante Dentário</strong><br/><br/>1️⃣ <strong>Saudação</strong>: "Olá [nome]! Vi que você se interessou..."<br/>2️⃣ <strong>Dor</strong>: "Está com dificuldade para mastigar?"<br/>3️⃣ <strong>Solução</strong>: "O implante resolve em 1 sessão..."<br/>4️⃣ <strong>CTA</strong>: "Quer uma avaliação gratuita?"</div></div>
          </div>
          <div className="border-t border-divider p-2 flex items-center gap-2 bg-canvas"><div className="flex-1 rounded-full bg-parchment border border-divider px-3 py-1.5 text-[8px] text-ink-tertiary">Pergunte qualquer coisa...</div><div className="h-6 w-6 rounded-full brand-gradient flex items-center justify-center"><ArrowRight className="h-3 w-3 text-white"/></div></div>
        </div>
      ),
      4: ( /* Dashboard */
        <div className="p-3 space-y-2">
          <div className="rounded-[10px] brand-gradient p-3 flex items-center justify-between relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/[0.06] blur-lg"/>
            <div><p className="text-[7px] text-white/50 uppercase tracking-wider font-medium">Bem-vindo</p><p className="text-[14px] font-bold text-white">Olá, Dr. Rafael</p></div>
            <div className="flex items-center gap-1 rounded-full bg-white/10 border border-white/10 px-2 py-0.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/><span className="text-[8px] text-white font-medium">5 ativos</span></div>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[{v:"23",l:"Leads",c:"text-brand-600 bg-brand-50",i:Users},{v:"8",l:"Agenda",c:"text-blue-600 bg-blue-50",i:CalendarCheck},{v:"847",l:"Msgs IA",c:"text-emerald-600 bg-emerald-50",i:MessageSquare},{v:"5",l:"Quentes",c:"text-amber-600 bg-amber-50",i:TrendingUp}].map(m=>{const I=m.i;return(
              <div key={m.l} className="rounded-[8px] bg-canvas border border-divider p-2"><div className="flex items-start justify-between"><div><p className="text-[7px] text-ink-tertiary">{m.l}</p><p className="text-[14px] font-bold text-ink leading-none mt-0.5">{m.v}</p></div><div className={cn("h-5 w-5 rounded-[4px] flex items-center justify-center",m.c)}><I className="h-2.5 w-2.5"/></div></div></div>
            );})}
          </div>
          <div className="rounded-[8px] bg-canvas border border-divider p-2.5">
            <div className="flex items-center justify-between mb-1.5"><span className="text-[9px] font-semibold text-ink">Performance</span><div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-brand-600"/><span className="text-[6px] text-ink-tertiary">Hoje</span></div></div>
            <svg viewBox="0 0 300 60" className="w-full h-14"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2"/><stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/></linearGradient></defs><path d="M0,50 L40,46 80,38 120,42 160,28 200,18 240,22 300,12" fill="none" stroke="#7c3aed" strokeWidth="1.5"/><path d="M0,50 L40,46 80,38 120,42 160,28 200,18 240,22 300,12 L300,60 L0,60Z" fill="url(#sg)"/>{[[40,46],[80,38],[160,28],[200,18],[300,12]].map(([x,y])=>(<circle key={`${x}`} cx={x} cy={y} r="2.5" fill="#7c3aed" stroke="white" strokeWidth="1.5"/>))}</svg>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="rounded-[8px] bg-canvas border border-divider p-2"><p className="text-[8px] text-ink-tertiary mb-1">Score</p><svg viewBox="0 0 60 60" className="w-10 h-10 mx-auto"><circle cx="30" cy="30" r="22" fill="none" stroke="#e8e8ed" strokeWidth="6"/><circle cx="30" cy="30" r="22" fill="none" stroke="#22c55e" strokeWidth="6" strokeDasharray="35 103" strokeLinecap="round"/><circle cx="30" cy="30" r="22" fill="none" stroke="#f59e0b" strokeWidth="6" strokeDasharray="55 83" strokeDashoffset="-35" strokeLinecap="round"/><circle cx="30" cy="30" r="22" fill="none" stroke="#ef4444" strokeWidth="6" strokeDasharray="48 90" strokeDashoffset="-90" strokeLinecap="round"/></svg></div>
            <div className="col-span-2 rounded-[8px] bg-canvas border border-divider p-2"><p className="text-[8px] text-ink-tertiary mb-1">Atividade</p><div className="space-y-1">{["Novo lead: Ana Souza","Agendamento: Carlos Lima","Qualificado: Fernanda R.","Follow-up: Pedro M."].map(t=><div key={t} className="flex items-center gap-1"><CheckCircle2 className="h-2 w-2 text-brand-500 shrink-0"/><p className="text-[7px] text-ink truncate">{t}</p></div>)}</div></div>
          </div>
        </div>
      ),
    };
    return screens[idx] || null;
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand-500/[0.03] blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-[13px] font-semibold text-brand-600 uppercase tracking-wider">Veja na prática</span>
          <h2 className="mt-2 text-[32px] sm:text-[40px] font-bold text-ink tracking-tight leading-[1.1]">
            Conheça o sistema<br className="hidden sm:block" /> por dentro
          </h2>
          <p className="mt-3 text-[16px] text-ink-secondary max-w-2xl mx-auto">
            Navegue pelas telas e veja como o ClinPro transforma a operação da sua clínica.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            return (
              <button key={tab.label} onClick={() => setActiveTab(i)} className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all active:scale-[0.97]",
                activeTab === i ? "brand-gradient text-white shadow-lg shadow-brand-900/20" : "bg-canvas border border-divider text-ink-secondary hover:text-ink hover:border-hairline"
              )}>
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.status === "soon" && <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[8px] font-bold">BREVE</span>}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-6xl mx-auto">
          {/* Info */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <div className="sticky top-24">
              <div className="flex items-center gap-3 mb-4">
                {(() => { const I = tabs[activeTab].icon; return <div className="h-12 w-12 rounded-[14px] brand-gradient flex items-center justify-center shadow-lg shadow-brand-900/20"><I className="h-6 w-6 text-white" /></div>; })()}
                <div>
                  <h3 className="text-[20px] font-bold text-ink">{tabs[activeTab].label}</h3>
                  {tabs[activeTab].status === "soon" && <span className="text-[11px] font-semibold text-amber-600">Em breve</span>}
                </div>
              </div>
              <p className="text-[15px] text-ink-secondary leading-relaxed mb-6">{tabs[activeTab].description}</p>

              {/* Highlights */}
              <div className="space-y-2 mb-8">
                {tabs[activeTab].highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded-full brand-gradient flex items-center justify-center shrink-0"><CheckCircle2 className="h-3 w-3 text-white" /></div>
                    <span className="text-[14px] text-ink font-medium">{h}</span>
                  </div>
                ))}
              </div>

              <a href="https://wa.me/5541997038671?text=Quero%20ver%20uma%20demo%20do%20ClinPro" target="_blank" className="inline-flex items-center gap-2 rounded-full brand-gradient px-6 py-3 text-[14px] font-medium text-white hover:brightness-110 active:scale-[0.97] transition-all shadow-lg shadow-brand-900/20">
                Eu quero o ClinPro <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Mockup */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-brand-500/10 via-brand-400/5 to-transparent rounded-[28px] blur-2xl -z-10" />
              <div className="rounded-[18px] border border-divider bg-canvas overflow-hidden shadow-2xl shadow-brand-900/10">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-divider bg-parchment/80">
                  <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"/><div className="w-2.5 h-2.5 rounded-full bg-amber-400"/><div className="w-2.5 h-2.5 rounded-full bg-emerald-400"/></div>
                  <div className="flex-1 flex justify-center"><div className="flex items-center gap-1.5 rounded-full bg-canvas border border-divider px-3 py-1 max-w-[200px] w-full"><Shield className="h-2.5 w-2.5 text-emerald-500"/><span className="text-[10px] text-ink-tertiary">app.clinpro.com.br/{tabs[activeTab].label.toLowerCase().replace(/\s/g,"-")}</span></div></div>
                </div>
                <div className="h-[440px] bg-parchment overflow-hidden">
                  <div key={activeTab} className="h-full animate-[fadeInUp_0.35s_ease-out]">
                    {screenContent(activeTab)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="funcionalidades" className="py-24 bg-canvas relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-brand-500/[0.03] blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
          <div>
            <span className="text-[13px] font-semibold text-brand-600 uppercase tracking-wider">Funcionalidades</span>
            <h2 className="mt-2 text-[32px] sm:text-[40px] font-bold text-ink tracking-tight leading-[1.1]">
              Tudo que sua clínica precisa.{" "}
              <span className="gradient-text">Nada que não precisa.</span>
            </h2>
          </div>
          <div className="flex items-end">
            <p className="text-[16px] text-ink-secondary leading-relaxed">
              Do primeiro contato no WhatsApp ao pós-atendimento com NPS. Cada funcionalidade foi pensada para resolver um problema real de clínicas — sem floreio, sem feature inútil.
            </p>
          </div>
        </div>

        {/* Feature grid — first 2 large, rest in 4-col */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {FEATURES.slice(0, 2).map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-[18px] border border-divider bg-parchment/50 p-7 hover:border-brand-200 transition-all group">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[16px] brand-gradient text-white shadow-lg shadow-brand-900/20">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="rounded-full brand-gradient text-white px-3 py-1 text-[11px] font-semibold">{feature.highlight}</span>
                </div>
                <h3 className="text-[20px] font-bold text-ink group-hover:text-brand-700 transition-colors">{feature.title}</h3>
                <p className="text-[14px] text-ink-secondary mt-2 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {FEATURES.slice(2).map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-[18px] border border-divider bg-canvas p-6 hover:border-brand-200 transition-all group">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] brand-gradient text-white mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-brand-50 text-brand-700 px-2.5 py-0.5 text-[10px] font-semibold">{feature.highlight}</span>
                <h3 className="text-[16px] font-semibold text-ink group-hover:text-brand-700 transition-colors mt-3">{feature.title}</h3>
                <p className="text-[13px] text-ink-secondary mt-1.5 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="como-funciona" className="py-20 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[13px] font-semibold text-brand-600 uppercase tracking-wider">Como funciona</span>
          <h2 className="mt-2 text-[28px] sm:text-[36px] font-bold text-ink tracking-tight">
            Nós fazemos tudo por você
          </h2>
          <p className="mt-3 text-[16px] text-ink-secondary max-w-2xl mx-auto">
            Sem instalação, sem código, sem complicação. Nossa equipe implementa, personaliza e acompanha os resultados.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {STEPS.map((step, i) => (
            <div key={step.step} className="text-center relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-divider" />
              )}
              <div className="relative z-10 inline-flex h-16 w-16 items-center justify-center rounded-full brand-gradient text-white text-[20px] font-bold mb-4 shadow-lg shadow-brand-900/20">
                {step.step}
              </div>
              <h3 className="text-[15px] font-semibold text-ink">{step.title}</h3>
              <p className="text-[13px] text-ink-secondary mt-2 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <a
            href="https://wa.me/5541997038671?text=Quero%20falar%20com%20um%20especialista%20ClinPro"
            target="_blank"
            className="rounded-full brand-gradient px-8 py-4 text-[16px] font-semibold text-white hover:brightness-110 active:scale-[0.97] transition-all inline-flex items-center gap-2 shadow-lg shadow-brand-900/20"
          >
            Eu quero o ClinPro <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

function LossCalculator() {
  const [consultas, setConsultas] = useState(80);
  const [ticket, setTicket] = useState(350);
  const [noshow, setNoshow] = useState(30);
  const [leadsdia, setLeadsdia] = useState(5);

  const perdaNoshow = Math.round((consultas * (noshow / 100)) * ticket);
  const perdaLeads = Math.round(leadsdia * 20 * ticket * 0.3);
  const perdaTotal = perdaNoshow + perdaLeads;
  const comClinpro = Math.round(perdaNoshow * 0.6 + perdaLeads * 0.65);
  const economia = perdaTotal - comClinpro;

  return (
    <section id="simulador" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 brand-gradient opacity-[0.03]" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand-500/[0.05] blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <span className="text-[13px] font-semibold text-red-500 uppercase tracking-wider">Calculadora de perdas</span>
          <h2 className="mt-2 text-[32px] sm:text-[40px] font-bold text-ink tracking-tight leading-[1.1]">
            Quanto sua clínica <span className="text-red-500">perde por mês</span><br className="hidden sm:block" /> sem automação?
          </h2>
          <p className="mt-3 text-[16px] text-ink-secondary max-w-2xl mx-auto">
            Preencha com os dados da sua clínica e veja o impacto real de não ter IA atendendo, confirmando e fazendo follow-up.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Inputs */}
          <div className="rounded-[22px] border border-divider bg-canvas p-6 sm:p-8 space-y-6">
            <h3 className="text-[17px] font-semibold text-ink">Dados da sua clínica</h3>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-medium text-ink">Consultas por mês</label>
                <span className="text-[14px] font-bold text-ink">{consultas}</span>
              </div>
              <input type="range" min={10} max={300} value={consultas} onChange={(e) => setConsultas(Number(e.target.value))} className="w-full accent-brand-600 h-2 rounded-full" />
              <div className="flex justify-between text-[10px] text-ink-tertiary mt-1"><span>10</span><span>300</span></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-medium text-ink">Ticket médio (R$)</label>
                <span className="text-[14px] font-bold text-ink">R$ {ticket}</span>
              </div>
              <input type="range" min={50} max={2000} step={50} value={ticket} onChange={(e) => setTicket(Number(e.target.value))} className="w-full accent-brand-600 h-2 rounded-full" />
              <div className="flex justify-between text-[10px] text-ink-tertiary mt-1"><span>R$ 50</span><span>R$ 2.000</span></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-medium text-ink">Taxa de no-show atual (%)</label>
                <span className="text-[14px] font-bold text-red-500">{noshow}%</span>
              </div>
              <input type="range" min={5} max={50} value={noshow} onChange={(e) => setNoshow(Number(e.target.value))} className="w-full accent-red-500 h-2 rounded-full" />
              <div className="flex justify-between text-[10px] text-ink-tertiary mt-1"><span>5%</span><span>50%</span></div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[13px] font-medium text-ink">Leads/dia sem resposta rápida</label>
                <span className="text-[14px] font-bold text-red-500">{leadsdia}</span>
              </div>
              <input type="range" min={0} max={30} value={leadsdia} onChange={(e) => setLeadsdia(Number(e.target.value))} className="w-full accent-red-500 h-2 rounded-full" />
              <div className="flex justify-between text-[10px] text-ink-tertiary mt-1"><span>0</span><span>30</span></div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Loss card */}
            <div className="rounded-[22px] border border-red-200 bg-red-50/50 p-6 sm:p-8">
              <p className="text-[13px] font-semibold text-red-500 uppercase tracking-wider mb-1">Sem automação</p>
              <p className="text-[40px] sm:text-[48px] font-bold text-red-600 leading-none">R$ {perdaTotal.toLocaleString("pt-BR")}</p>
              <p className="text-[14px] text-red-400 mt-2">perdidos por mês</p>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center"><Clock className="h-3.5 w-3.5 text-red-500" /></div>
                    <span className="text-[13px] text-ink">No-show ({noshow}% de {consultas} consultas)</span>
                  </div>
                  <span className="text-[14px] font-bold text-red-600">-R$ {perdaNoshow.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center"><Phone className="h-3.5 w-3.5 text-red-500" /></div>
                    <span className="text-[13px] text-ink">Leads não respondidos ({leadsdia}/dia)</span>
                  </div>
                  <span className="text-[14px] font-bold text-red-600">-R$ {perdaLeads.toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </div>

            {/* ClinPro card */}
            <div className="rounded-[22px] brand-gradient p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/[0.06] blur-xl" />
              <div className="relative">
                <p className="text-[13px] font-semibold text-white/70 uppercase tracking-wider mb-1">Com ClinPro</p>
                <p className="text-[40px] sm:text-[48px] font-bold text-white leading-none">R$ {economia.toLocaleString("pt-BR")}</p>
                <p className="text-[14px] text-white/60 mt-2">recuperados por mês</p>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-2 text-white/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                    <span className="text-[13px]">IA responde WhatsApp em 5 segundos, 24h</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                    <span className="text-[13px]">Confirmação automática 48h e 24h antes</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                    <span className="text-[13px]">Follow-up D1, D3 e D7 sem depender de pessoa</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                    <span className="text-[13px]">Avaliação no Google após boa experiência</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://wa.me/5541997038671?text=Quero%20recuperar%20esses%20valores%20na%20minha%20clínica"
                    target="_blank"
                    className="rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-brand-700 hover:bg-white/90 active:scale-[0.97] transition-all text-center"
                  >
                    Eu quero o ClinPro
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom note */}
            <p className="text-[12px] text-ink-tertiary text-center">
              * Cálculo baseado na redução média de 60% no no-show e 65% de recuperação de leads com IA. Resultados podem variar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const clinicLogos = TESTIMONIALS.map((t) => t.clinic);

  return (
    <section id="depoimentos" className="py-24 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Clinic logos marquee */}
        <div className="mb-16 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-canvas to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-canvas to-transparent z-10" />
          <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap">
            {[...Array(3)].map((_, r) => (
              <div key={r} className="flex items-center shrink-0">
                {clinicLogos.map((name) => (
                  <div key={`${r}-${name}`} className="flex items-center gap-2.5 mx-8 shrink-0">
                    <div className="h-8 w-8 rounded-[8px] bg-parchment flex items-center justify-center">
                      <span className="text-[10px] font-bold text-ink-tertiary">{name.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>
                    </div>
                    <span className="text-[14px] font-medium text-ink-tertiary">{name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mb-12">
          <span className="text-[13px] font-semibold text-brand-600 uppercase tracking-wider">Depoimentos</span>
          <h2 className="mt-2 text-[32px] sm:text-[40px] font-bold text-ink tracking-tight leading-[1.1]">
            Quem usa, recomenda
          </h2>
          <p className="mt-3 text-[16px] text-ink-secondary max-w-2xl mx-auto">
            Clínicas de todo o Brasil já transformaram seu atendimento com o ClinPro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-[18px] border border-divider bg-parchment/30 p-6 flex flex-col">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-[14px] text-ink leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-divider">
                <img src={t.photo} alt={t.name} className="h-11 w-11 rounded-full object-cover ring-2 ring-canvas" />
                <div>
                  <p className="text-[13px] font-semibold text-ink">{t.name}</p>
                  <p className="text-[11px] text-ink-tertiary">{t.clinic}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <section id="faq" className="py-20 bg-canvas">
      <div className="max-w-3xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[13px] font-semibold text-brand-600 uppercase tracking-wider">FAQ</span>
          <h2 className="mt-2 text-[28px] sm:text-[36px] font-bold text-ink tracking-tight">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-[14px] border border-divider bg-parchment/50 overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-[14px] font-semibold text-ink pr-4">{faq.q}</span>
                <ChevronDown className={cn("h-4 w-4 text-ink-tertiary shrink-0 transition-transform", openIdx === i && "rotate-180")} />
              </button>
              {openIdx === i && (
                <div className="px-5 pb-4 animate-slide-up">
                  <p className="text-[14px] text-ink-secondary leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-[22px] brand-gradient px-8 py-14 sm:px-14 sm:py-16 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/[0.07] blur-2xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/[0.05] blur-2xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-[28px] sm:text-[36px] font-bold text-white tracking-tight leading-tight">
              Pare de perder pacientes.<br />Comece hoje.
            </h2>
            <p className="mt-4 text-[16px] text-white/70 max-w-xl mx-auto">
              7 dias grátis, sem cartão de crédito. Configure em 30 minutos e veja seus agendamentos aumentarem já na primeira semana.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/5541997038671?text=Quero%20testar%20o%20ClinPro%20grátis"
                target="_blank"
                className="rounded-full bg-white px-8 py-4 text-[16px] font-semibold text-brand-700 hover:bg-white/90 active:scale-[0.97] transition-all flex items-center gap-2"
              >
                Eu quero o ClinPro <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-divider bg-canvas py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/icon-clinpro-light.png" alt="ClinPro" className="h-7 dark:hidden" />
            <img src="/icon-clinpro.png" alt="ClinPro" className="h-7 hidden dark:block" />
            <span className="text-[14px] text-ink-secondary">ClinPro por FyreTech</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/login" className="text-[13px] text-ink-secondary hover:text-ink transition-colors">Entrar</a>
            <a href="#funcionalidades" className="text-[13px] text-ink-secondary hover:text-ink transition-colors">Funcionalidades</a>
            <a href="#faq" className="text-[13px] text-ink-secondary hover:text-ink transition-colors">FAQ</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-divider text-center">
          <p className="text-[12px] text-ink-tertiary">&copy; {new Date().getFullYear()} ClinPro. Todos os direitos reservados. Produto FyreTech.</p>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-parchment">
      <Nav />
      <Hero />

      {/* Marquee banner */}
      <div className="relative overflow-hidden brand-gradient py-4">
        <div className="flex animate-[marquee_25s_linear_infinite] whitespace-nowrap">
          {[...Array(2)].map((_, r) => (
            <div key={r} className="flex items-center shrink-0">
              {[
                "Atendimento 24/7 por IA",
                "5 Agentes Inteligentes",
                "-40% No-Show",
                "Pipeline Kanban",
                "WhatsApp Automatizado",
                "+60% Agendamentos",
                "Qualificação Automática",
                "Follow-up D1/D3/D7",
                "NPS Pós-Consulta",
                "Multi-Tenant",
                "Dark Mode",
                "Confirmação Automática",
              ].map((text) => (
                <span key={`${r}-${text}`} className="flex items-center gap-3 mx-6">
                  <Sparkles className="h-3.5 w-3.5 text-white/50" />
                  <span className="text-[14px] font-medium text-white/90">{text}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <PainPoints />
      <SystemShowcase />
      <FeaturesSection />
      <HowItWorks />
      <LossCalculator />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
