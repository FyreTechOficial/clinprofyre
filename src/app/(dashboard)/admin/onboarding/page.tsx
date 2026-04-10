"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  Building2,
  User,
  Bot,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Shield,
  Stethoscope,
  MessageSquare,
  Clock,
  CreditCard,
  Plus,
  X,
  Trash2,
  CalendarCheck,
  Zap,
  Star,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

interface StepResult {
  step: string;
  status: "ok" | "error";
  detail?: string;
}

interface Professional {
  name: string;
  role: string;
  procedures: string;
}

interface Procedure {
  name: string;
  price: string;
  duration: string;
}

const WEEKDAYS = [
  { key: "seg", label: "Seg" },
  { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" },
  { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" },
];

const STEPS = [
  { id: 1, title: "Clínica", icon: Building2 },
  { id: 2, title: "Horários & Equipe", icon: Clock },
  { id: 3, title: "Acesso", icon: User },
  { id: 4, title: "Agentes IA", icon: Bot },
  { id: 5, title: "Confirmar", icon: CheckCircle2 },
];

const PAYMENT_OPTIONS = [
  "Dinheiro", "PIX", "Cartão de Crédito", "Cartão de Débito",
  "Boleto", "Convênio", "Parcelamento",
];

const INPUT_CLASS = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<StepResult[]>([]);
  const [newTenantId, setNewTenantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Clinic data
  const [clinicName, setClinicName] = useState("");
  const [slug, setSlug] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [address, setAddress] = useState("");
  const [segment, setSegment] = useState("");

  // Step 2: Schedule & Team
  const [schedule, setSchedule] = useState<Record<string, { open: string; close: string; active: boolean }>>({
    seg: { open: "08:00", close: "18:00", active: true },
    ter: { open: "08:00", close: "18:00", active: true },
    qua: { open: "08:00", close: "18:00", active: true },
    qui: { open: "08:00", close: "18:00", active: true },
    sex: { open: "08:00", close: "18:00", active: true },
    sab: { open: "08:00", close: "12:00", active: true },
    dom: { open: "08:00", close: "12:00", active: false },
  });
  const [professionals, setProfessionals] = useState<Professional[]>([
    { name: "", role: "", procedures: "" },
  ]);
  const [procedures, setProcedures] = useState<Procedure[]>([
    { name: "", price: "", duration: "30" },
  ]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(["PIX", "Cartão de Crédito", "Dinheiro"]);

  // Step 3: Access
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [blackboxApiKey, setBlackboxApiKey] = useState("");

  // Step 4: AI Agents
  const [toneOfVoice, setToneOfVoice] = useState("Profissional e acolhedor, use emojis com moderação");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [faq, setFaq] = useState("");
  const [specialRules, setSpecialRules] = useState("");
  const [agentConfig, setAgentConfig] = useState({
    atendimento: true,
    qualificacao: true,
    agendamento: true,
    followup: true,
    pos_atendimento: false,
  });

  // Auto slug
  function handleClinicName(v: string) {
    setClinicName(v);
    setSlug(v.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
    if (!welcomeMessage) setWelcomeMessage(`Olá! Bem-vindo(a) à ${v}. Como posso ajudar você hoje?`);
  }

  // Build working hours string for Supabase
  function buildWorkingHours() {
    return WEEKDAYS
      .filter((d) => schedule[d.key].active)
      .map((d) => `${d.label}: ${schedule[d.key].open}-${schedule[d.key].close}`)
      .join(" | ");
  }

  // Build procedures string
  function buildProcedures() {
    return procedures
      .filter((p) => p.name)
      .map((p) => `${p.name}${p.price ? ` - R$ ${p.price}` : ""}${p.duration ? ` (${p.duration}min)` : ""}`)
      .join("\n");
  }

  // Build professionals string
  function buildProfessionals() {
    return professionals
      .filter((p) => p.name)
      .map((p) => `${p.name}${p.role ? ` (${p.role})` : ""}${p.procedures ? ` — ${p.procedures}` : ""}`)
      .join("\n");
  }

  function canProceed() {
    if (currentStep === 1) return clinicName && address;
    if (currentStep === 2) return procedures.some((p) => p.name);
    if (currentStep === 3) return ownerName && email && password && ownerPhone;
    if (currentStep === 4) return toneOfVoice;
    return true;
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    setResults([]);

    const payload = {
      clinicName,
      slug,
      address,
      clinicPhone,
      segment,
      ownerName,
      ownerPhone,
      email,
      password,
      blackboxApiKey,
      toneOfVoice,
      procedures: buildProcedures(),
      professionals: buildProfessionals(),
      workingHours: buildWorkingHours(),
      paymentMethods: paymentMethods.join(", "),
      welcomeMessage,
      systemPrompt,
      faq,
      specialRules,
      agentConfig,
    };

    try {
      const res = await fetch("/api/admin/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.steps) setResults(data.steps);
      if (data.tenantId) setNewTenantId(data.tenantId);
      if (data.error) setError(data.error);
    } catch (e: any) {
      setError("Erro de conexão: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const allOk = results.length > 0 && results.every((r) => r.status === "ok");

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-5 w-5 text-brand-600" />
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Onboarding</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Nova Clínica</h1>
        <p className="mt-1 text-sm text-gray-500">Tudo que os agentes IA precisam para funcionar perfeitamente</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isDone = step.id < currentStep || results.length > 0;
          return (
            <React.Fragment key={step.id}>
              {i > 0 && <div className={cn("flex-1 h-0.5 rounded", isDone ? "bg-brand-500" : "bg-gray-200")} />}
              <button
                onClick={() => { if (isDone && !results.length) setCurrentStep(step.id); }}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all",
                  isActive ? "bg-brand-100 text-brand-700" : isDone ? "bg-emerald-50 text-emerald-700 cursor-pointer" : "bg-gray-50 text-gray-400"
                )}
              >
                {isDone && !isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

        {/* ═══════ STEP 1: Clínica ═══════ */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600"><Building2 className="h-5 w-5" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Dados da Clínica</h2>
                <p className="text-xs text-gray-500">Informações que aparecem no atendimento da IA</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Clínica *</label>
                <input type="text" value={clinicName} onChange={(e) => handleClinicName(e.target.value)} placeholder="Ex: Clínica Sorriso" className={INPUT_CLASS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug / Instância</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="clinica-sorriso" className={cn(INPUT_CLASS, "font-mono")} />
                <p className="text-[10px] text-gray-400 mt-1">Nome da instância na Evolution API</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Segmento</label>
                <select value={segment} onChange={(e) => setSegment(e.target.value)} className={INPUT_CLASS}>
                  <option value="">Selecione...</option>
                  <option value="odontologia">Odontologia</option>
                  <option value="estetica">Estética</option>
                  <option value="dermatologia">Dermatologia</option>
                  <option value="medicina_estetica">Medicina Estética</option>
                  <option value="multidisciplinar">Multidisciplinar</option>
                  <option value="nutricao">Nutrição</option>
                  <option value="fisioterapia">Fisioterapia</option>
                  <option value="psicologia">Psicologia</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço completo *</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua XV de Novembro, 1234 - Centro, Curitiba - PR" className={INPUT_CLASS} />
                <p className="text-[10px] text-gray-400 mt-1">A IA envia esse endereço quando o paciente pergunta</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp da Clínica</label>
                <input type="text" value={clinicPhone} onChange={(e) => setClinicPhone(e.target.value)} placeholder="(41) 99999-9999" className={INPUT_CLASS} />
              </div>
            </div>
          </div>
        )}

        {/* ═══════ STEP 2: Horários, Equipe, Procedimentos ═══════ */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600"><Clock className="h-5 w-5" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Horários, Equipe & Procedimentos</h2>
                <p className="text-xs text-gray-500">O agente de agendamento usa esses dados para marcar consultas</p>
              </div>
            </div>

            {/* Working hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Funcionamento *</label>
              <div className="space-y-2">
                {WEEKDAYS.map((day) => {
                  const s = schedule[day.key];
                  return (
                    <div key={day.key} className="flex items-center gap-3">
                      <button
                        onClick={() => setSchedule((prev) => ({ ...prev, [day.key]: { ...prev[day.key], active: !prev[day.key].active } }))}
                        className={cn("w-12 text-center rounded-lg py-1.5 text-xs font-bold transition-all", s.active ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-400")}
                      >
                        {day.label}
                      </button>
                      {s.active ? (
                        <div className="flex items-center gap-2">
                          <input type="time" value={s.open} onChange={(e) => setSchedule((prev) => ({ ...prev, [day.key]: { ...prev[day.key], open: e.target.value } }))} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                          <span className="text-xs text-gray-400">até</span>
                          <input type="time" value={s.close} onChange={(e) => setSchedule((prev) => ({ ...prev, [day.key]: { ...prev[day.key], close: e.target.value } }))} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Fechado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Procedures */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Procedimentos / Serviços *</label>
              <p className="text-[10px] text-gray-400 mb-2">A IA usa esses dados para informar o paciente e agendar</p>
              <div className="space-y-2">
                {procedures.map((proc, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" placeholder="Nome do procedimento" value={proc.name} onChange={(e) => { const n = [...procedures]; n[i].name = e.target.value; setProcedures(n); }} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                    <input type="text" placeholder="Preço" value={proc.price} onChange={(e) => { const n = [...procedures]; n[i].price = e.target.value; setProcedures(n); }} className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                    <div className="flex items-center gap-1">
                      <input type="number" placeholder="Min" value={proc.duration} onChange={(e) => { const n = [...procedures]; n[i].duration = e.target.value; setProcedures(n); }} className="w-16 rounded-lg border border-gray-200 px-2 py-2 text-sm text-center focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                      <span className="text-[10px] text-gray-400">min</span>
                    </div>
                    {procedures.length > 1 && (
                      <button onClick={() => setProcedures(procedures.filter((_, j) => j !== i))} className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => setProcedures([...procedures, { name: "", price: "", duration: "30" }])} className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
                <Plus className="h-3.5 w-3.5" /> Adicionar procedimento
              </button>
            </div>

            {/* Professionals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profissionais</label>
              <p className="text-[10px] text-gray-400 mb-2">A IA menciona os profissionais ao agendar</p>
              <div className="space-y-2">
                {professionals.map((prof, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="text" placeholder="Nome" value={prof.name} onChange={(e) => { const n = [...professionals]; n[i].name = e.target.value; setProfessionals(n); }} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                    <input type="text" placeholder="Cargo/Especialidade" value={prof.role} onChange={(e) => { const n = [...professionals]; n[i].role = e.target.value; setProfessionals(n); }} className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                    {professionals.length > 1 && (
                      <button onClick={() => setProfessionals(professionals.filter((_, j) => j !== i))} className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => setProfessionals([...professionals, { name: "", role: "", procedures: "" }])} className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium">
                <Plus className="h-3.5 w-3.5" /> Adicionar profissional
              </button>
            </div>

            {/* Payment methods */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Formas de Pagamento</label>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_OPTIONS.map((pm) => (
                  <button
                    key={pm}
                    onClick={() => setPaymentMethods((prev) => prev.includes(pm) ? prev.filter((p) => p !== pm) : [...prev, pm])}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-all border",
                      paymentMethods.includes(pm) ? "bg-brand-600 text-white border-brand-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ STEP 3: Acesso ═══════ */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><User className="h-5 w-5" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Acesso & Login</h2>
                <p className="text-xs text-gray-500">Credenciais do responsável da clínica</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsável *</label>
                <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Dr. João Silva" className={INPUT_CLASS} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Pessoal *</label>
                <input type="text" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="5541999999999" className={INPUT_CLASS} />
                <p className="text-[10px] text-gray-400 mt-1">Recebe alertas de leads quentes</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de Login *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@clinicasorriso.com" className={INPUT_CLASS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className={INPUT_CLASS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key Blackbox <span className="text-gray-400 font-normal">(pode adicionar depois)</span></label>
              <input type="text" value={blackboxApiKey} onChange={(e) => setBlackboxApiKey(e.target.value)} placeholder="sk-..." className={cn(INPUT_CLASS, "font-mono")} />
            </div>
          </div>
        )}

        {/* ═══════ STEP 4: Agentes IA ═══════ */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><Bot className="h-5 w-5" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Configuração dos Agentes IA</h2>
                <p className="text-xs text-gray-500">Quanto mais detalhado, melhor o agente performa</p>
              </div>
            </div>

            {/* Tom de voz */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tom de Voz *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  { label: "Profissional e acolhedor", emoji: "😊" },
                  { label: "Informal e simpático", emoji: "🤙" },
                  { label: "Formal e técnico", emoji: "👨‍⚕️" },
                ].map((tone) => (
                  <button key={tone.label} onClick={() => setToneOfVoice(tone.label)} className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-all", toneOfVoice.startsWith(tone.label) ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                    {tone.emoji} {tone.label}
                  </button>
                ))}
              </div>
              <input type="text" value={toneOfVoice} onChange={(e) => setToneOfVoice(e.target.value)} className={INPUT_CLASS} />
            </div>

            {/* Welcome message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Boas-vindas</label>
              <p className="text-[10px] text-gray-400 mb-1">Primeira mensagem que o agente envia quando um lead novo aparece</p>
              <textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} rows={3} placeholder={`Olá! Bem-vindo(a) à ${clinicName || "Clínica"}. Como posso ajudar?`} className={cn(INPUT_CLASS, "resize-y")} />
            </div>

            {/* System Prompt — THE BIG ONE */}
            <div className="rounded-xl border-2 border-brand-200 bg-brand-50/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <label className="text-sm font-bold text-brand-800">Prompt Principal do Agente (System Prompt)</label>
              </div>
              <p className="text-xs text-brand-600/80 mb-3">
                Este é o prompt completo que define a personalidade, comportamento e conhecimento do agente.
                Quanto mais detalhado, melhor. Dados da clínica (horários, procedimentos, endereço) são injetados automaticamente.
              </p>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={16}
                placeholder={`Você é a assistente virtual da ${clinicName || "[Nome da Clínica]"}, uma clínica de ${segment || "[segmento]"} localizada em ${address || "[endereço]"}.

SEU PAPEL:
- Você é a recepcionista virtual da clínica
- Atende pacientes pelo WhatsApp de forma humanizada
- Seu objetivo é qualificar o lead, entender a necessidade e agendar uma consulta/avaliação

COMO SE COMPORTAR:
- Seja ${toneOfVoice.toLowerCase() || "profissional e acolhedor"}
- Responda sempre em português brasileiro
- Use mensagens CURTAS (máximo 2-3 linhas por mensagem)
- Use emojis com moderação (1-2 por mensagem)
- NUNCA envie mensagens longas, divida em partes se necessário
- Sempre pergunte o nome do paciente se não souber
- Trate o paciente pelo nome quando possível

FLUXO DE ATENDIMENTO:
1. Cumprimente e pergunte como pode ajudar
2. Identifique o procedimento de interesse
3. Tire dúvidas sobre o procedimento
4. Convide para agendar uma avaliação (gratuita se aplicável)
5. Colete: nome, melhor dia/horário, telefone se não tiver
6. Confirme o agendamento

REGRAS IMPORTANTES:
- NUNCA invente informações que não foram fornecidas
- Se não souber algo, diga que vai verificar com a equipe
- Não passe diagnósticos médicos
- Não fale mal de concorrentes
- Se o paciente insistir em preço exato e você não tiver, convide para avaliação

QUANDO O PACIENTE PERGUNTAR SOBRE PREÇOS:
- Informe os valores se estiverem cadastrados
- Se não tiver o valor exato, diga que varia conforme avaliação
- Sempre destaque o custo-benefício e qualidade

QUANDO NÃO ESTIVER EM HORÁRIO DE ATENDIMENTO:
- Informe os horários de funcionamento
- Diga que assim que abrir, a equipe entrará em contato
- Anote o interesse do paciente para follow-up`}
                className={cn(INPUT_CLASS, "resize-y min-h-[300px] font-mono text-xs leading-relaxed bg-white")}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-brand-600/60">{systemPrompt.length} caracteres</p>
                <button
                  onClick={() => setSystemPrompt(`Você é a assistente virtual da ${clinicName || "[Nome da Clínica]"}, uma clínica de ${segment || "[segmento]"} localizada em ${address || "[endereço]"}.

SEU PAPEL:
- Você é a recepcionista virtual da clínica
- Atende pacientes pelo WhatsApp de forma humanizada
- Seu objetivo é qualificar o lead, entender a necessidade e agendar uma consulta/avaliação

COMO SE COMPORTAR:
- Seja ${toneOfVoice.toLowerCase() || "profissional e acolhedor"}
- Responda sempre em português brasileiro
- Use mensagens CURTAS (máximo 2-3 linhas por mensagem)
- Use emojis com moderação (1-2 por mensagem)
- NUNCA envie mensagens longas, divida em partes se necessário
- Sempre pergunte o nome do paciente se não souber
- Trate o paciente pelo nome quando possível

FLUXO DE ATENDIMENTO:
1. Cumprimente e pergunte como pode ajudar
2. Identifique o procedimento de interesse
3. Tire dúvidas sobre o procedimento
4. Convide para agendar uma avaliação
5. Colete: nome, melhor dia/horário
6. Confirme o agendamento com os detalhes

REGRAS IMPORTANTES:
- NUNCA invente informações que não foram fornecidas
- Se não souber algo, diga que vai verificar com a equipe
- Não passe diagnósticos médicos
- Não fale mal de concorrentes
- Se o paciente insistir em preço exato e você não tiver, convide para avaliação

QUANDO NÃO ESTIVER EM HORÁRIO DE ATENDIMENTO:
- Informe os horários de funcionamento
- Diga que a equipe entrará em contato quando abrir
- Anote o interesse do paciente para follow-up`)}
                  className="text-[10px] text-brand-600 hover:text-brand-700 font-medium"
                >
                  Usar template padrão
                </button>
              </div>
            </div>

            {/* FAQ — expanded */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perguntas Frequentes (FAQ)</label>
              <p className="text-[10px] text-gray-400 mb-1">Perguntas que pacientes fazem frequentemente — a IA usa como base de conhecimento</p>
              <textarea
                value={faq}
                onChange={(e) => setFaq(e.target.value)}
                rows={8}
                placeholder={`Aceita convênio? Sim, aceitamos Unimed e Amil.
Tem estacionamento? Sim, estacionamento gratuito no local.
Primeira consulta é paga? A avaliação inicial é gratuita.
Quanto tempo dura o procedimento? Depende do procedimento, entre 30min e 2h.
Tem parcelas? Sim, parcelamos em até 12x no cartão.
Precisa de preparo antes? Depende do procedimento, orientamos no agendamento.
Pode fazer no mesmo dia da consulta? Em alguns casos sim, o profissional avalia.
Aceita emergência? Sim, entre em contato pelo WhatsApp.`}
                className={cn(INPUT_CLASS, "resize-y min-h-[160px]")}
              />
            </div>

            {/* Special rules — expanded */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regras Especiais & Restrições</label>
              <p className="text-[10px] text-gray-400 mb-1">Regras que os agentes devem seguir SEMPRE — funciona como um guardrail da IA</p>
              <textarea
                value={specialRules}
                onChange={(e) => setSpecialRules(e.target.value)}
                rows={8}
                placeholder={`NUNCA fale mal de outras clínicas ou concorrentes.
SEMPRE pergunte o nome do paciente antes de agendar.
NÃO passe diagnóstico médico, apenas o profissional pode fazer isso.
Se o paciente perguntar sobre preço e não tiver o valor, diga que varia e convide pra avaliação gratuita.
NÃO envie links externos.
Se perguntarem sobre procedimento que a clínica não faz, diga educadamente que não oferecemos e sugira os que temos.
Limite máximo de 2-3 linhas por mensagem, nunca envie textão.
Se o paciente parecer irritado, seja ainda mais educado e ofereça falar com um humano.
Horário de almoço: entre 12h e 13h o agendamento fica limitado.`}
                className={cn(INPUT_CLASS, "resize-y min-h-[160px]")}
              />
            </div>

            {/* Agent toggles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agentes para ativar</label>
              <div className="space-y-2">
                {[
                  { key: "atendimento", name: "Atendimento 24/7", desc: "Responde mensagens no WhatsApp automaticamente", icon: MessageSquare },
                  { key: "qualificacao", name: "Qualificação", desc: "Classifica leads em quente/morno/frio e preenche cadastro", icon: Star },
                  { key: "agendamento", name: "Agendamento", desc: "Confirma, reagenda e lembra pacientes 48h/24h antes", icon: CalendarCheck },
                  { key: "followup", name: "Follow-up", desc: "Envia follow-up D1/D3/D7, recupera no-show e reativa inativos", icon: Zap },
                  { key: "pos_atendimento", name: "Pós-Atendimento", desc: "Envia NPS, solicita review Google e programa de indicação", icon: UserCheck },
                ].map((agent) => {
                  const Icon = agent.icon;
                  const enabled = agentConfig[agent.key as keyof typeof agentConfig];
                  return (
                    <div key={agent.key} className={cn("flex items-center gap-3 rounded-xl border p-3 transition-all", enabled ? "border-emerald-200 bg-emerald-50/50" : "border-gray-100 bg-gray-50/50")}>
                      <Icon className={cn("h-5 w-5 shrink-0", enabled ? "text-emerald-600" : "text-gray-400")} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", enabled ? "text-gray-900" : "text-gray-500")}>{agent.name}</p>
                        <p className="text-[10px] text-gray-400">{agent.desc}</p>
                      </div>
                      <button
                        onClick={() => setAgentConfig((prev) => ({ ...prev, [agent.key]: !prev[agent.key as keyof typeof prev] }))}
                        className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0", enabled ? "bg-emerald-500" : "bg-gray-300")}
                      >
                        <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm", enabled ? "translate-x-6" : "translate-x-1")} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ STEP 5: Confirmation ═══════ */}
        {currentStep === 5 && (
          <div className="space-y-5">
            {!results.length && !isSubmitting && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Confirmar Onboarding</h2>
                    <p className="text-xs text-gray-500">Revise antes de criar — tudo reflete nos agentes IA</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Clínica</p>
                    <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                      <span className="text-gray-500">Nome</span><span className="font-medium text-gray-900">{clinicName}</span>
                      <span className="text-gray-500">Segmento</span><span className="font-medium text-gray-900">{segment || "—"}</span>
                      <span className="text-gray-500">Endereço</span><span className="font-medium text-gray-900 col-span-1 truncate">{address}</span>
                      <span className="text-gray-500">Instância</span><span className="font-medium text-gray-900 font-mono">{slug}</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Horários</p>
                    <p className="text-sm text-gray-700">{buildWorkingHours()}</p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Procedimentos ({procedures.filter((p) => p.name).length})</p>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{buildProcedures() || "—"}</p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Acesso</p>
                    <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                      <span className="text-gray-500">Responsável</span><span className="font-medium text-gray-900">{ownerName}</span>
                      <span className="text-gray-500">Email</span><span className="font-medium text-gray-900">{email}</span>
                      <span className="text-gray-500">WhatsApp</span><span className="font-medium text-gray-900">{ownerPhone}</span>
                      <span className="text-gray-500">Blackbox</span><span className="font-medium text-gray-900">{blackboxApiKey ? "sk-***" + blackboxApiKey.slice(-4) : "Não definida"}</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Agentes IA</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(agentConfig).map(([key, enabled]) => (
                        <span key={key} className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400")}>
                          {key.replace("_", "-")} {enabled ? "ON" : "OFF"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
                  <p className="text-sm text-brand-800 font-medium">Ao confirmar, o sistema cria automaticamente:</p>
                  <ol className="mt-2 space-y-1 text-xs text-brand-700">
                    <li>1. Tenant + dados da clínica no Supabase</li>
                    <li>2. Login do responsável (email/senha)</li>
                    <li>3. Instruções completas da IA (horários, procedimentos, FAQ, regras)</li>
                    <li>4. {Object.values(agentConfig).filter(Boolean).length} agentes ativos + {Object.values(agentConfig).filter((v) => !v).length} inativos</li>
                    <li>5. Instância WhatsApp na Evolution API</li>
                    <li>6. Webhook configurado automaticamente</li>
                  </ol>
                </div>
              </>
            )}

            {isSubmitting && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-10 w-10 text-brand-600 animate-spin mb-4" />
                <p className="text-lg font-bold text-gray-900">Criando clínica...</p>
                <p className="text-sm text-gray-500 mt-1">Configurando todos os serviços automaticamente</p>
              </div>
            )}

            {results.length > 0 && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", allOk ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
                    {allOk ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{allOk ? "Clínica criada com sucesso!" : "Concluído com avisos"}</h2>
                    <p className="text-xs text-gray-500">{allOk ? "Todos os serviços configurados" : "Alguns passos precisam de atenção"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {results.map((r, i) => (
                    <div key={i} className={cn("flex items-center gap-3 rounded-xl px-4 py-3 border", r.status === "ok" ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100")}>
                      {r.status === "ok" ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", r.status === "ok" ? "text-emerald-800" : "text-red-800")}>{r.step}</p>
                        {r.detail && r.status === "error" && <p className="text-xs text-red-600 mt-0.5 truncate">{r.detail}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                {allOk && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 mt-4">
                    <p className="text-sm text-emerald-800 font-medium">Próximo passo:</p>
                    <p className="text-xs text-emerald-700 mt-1">Conecte o WhatsApp da clínica via QR Code na aba WhatsApp.</p>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <Link href="/admin" className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 text-center hover:bg-gray-50 transition-all">
                    Voltar ao Painel
                  </Link>
                </div>
              </>
            )}

            {error && !results.length && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4"><p className="text-sm text-red-800 font-medium">{error}</p></div>
            )}
          </div>
        )}

        {/* Nav buttons */}
        {(currentStep < 5 || (!results.length && !isSubmitting)) && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {currentStep > 1 && !results.length ? (
              <button onClick={() => setCurrentStep((s) => s - 1)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
            ) : <div />}

            {currentStep < 5 ? (
              <button onClick={() => setCurrentStep((s) => s + 1)} disabled={!canProceed()} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-brand-200 transition-all hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed">
                Próximo <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              !results.length && !isSubmitting && (
                <button onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700">
                  <Sparkles className="h-4 w-4" /> Criar Clínica
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
