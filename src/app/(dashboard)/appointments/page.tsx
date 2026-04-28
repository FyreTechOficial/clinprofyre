"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChevronLeft, ChevronRight, Plus, Clock, X, Calendar as CalendarIcon,
  Loader2, Ban, Pencil, Trash2, Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// Treat datetime as local time (São Paulo) — n8n saves without proper offset
function parseLocalDt(dt: string) {
  // Remove trailing Z so JS doesn't treat as UTC
  const clean = dt.replace(/Z$/, "").replace(/\+00:00$/, "");
  return new Date(clean);
}

function formatTime(dt: string) {
  return parseLocalDt(dt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dt: string) {
  return parseLocalDt(dt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }

const MONTH_NAMES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAY_LABELS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  procedure: string;
  professional: string;
  datetime: string;
  duration_minutes: number;
  status: string;
  confirmed: boolean;
}

interface BlockedSlot {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean;
  reason: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    agendado: "bg-blue-50 text-blue-700 ring-blue-200",
    confirmado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    atendido: "bg-green-50 text-green-700 ring-green-200",
    no_show: "bg-red-50 text-red-700 ring-red-200",
    cancelado: "bg-parchment text-ink-secondary ring-hairline",
  };
  const labels: Record<string, string> = {
    agendado: "Agendado", confirmado: "Confirmado", atendido: "Atendido",
    no_show: "No-show", cancelado: "Cancelado",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", styles[status] ?? styles.agendado)}>
      {labels[status] ?? status}
    </span>
  );
}

export default function AppointmentsPage() {
  const { tenantId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [modalOpen, setModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingBlock, setSavingBlock] = useState(false);
  const [newAppt, setNewAppt] = useState({ patient_name: "", phone: "", procedure: "", professional: "", date: "", time: "" });
  const [newBlock, setNewBlock] = useState({ date: "", start_time: "", end_time: "", all_day: false, reason: "" });

  async function loadData() {
    if (!tenantId) return;
    try {
      const [apptRes, blockRes] = await Promise.all([
        fetch(`/api/appointments?tenant_id=${tenantId}`),
        fetch(`/api/appointments/blocked?tenant_id=${tenantId}`),
      ]);
      setAppointments((await apptRes.json()).appointments ?? []);
      setBlockedSlots((await blockRes.json()).blocked_slots ?? []);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { loadData(); const i = setInterval(loadData, 15000); return () => clearInterval(i); }, [tenantId]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const appointmentDays = useMemo(() => {
    const set = new Set<number>();
    appointments.forEach((a) => {
      const localDate = parseLocalDt(a.datetime);
      if (localDate.getMonth() === month && localDate.getFullYear() === year) set.add(localDate.getDate());
    });
    return set;
  }, [appointments, month, year]);

  const blockedDays = useMemo(() => {
    const set = new Set<number>();
    blockedSlots.forEach((b) => {
      const d = new Date(b.date + "T12:00:00");
      if (d.getMonth() === month && d.getFullYear() === year) set.add(d.getDate());
    });
    return set;
  }, [blockedSlots, month, year]);

  const dayAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const localDate = parseLocalDt(a.datetime);
      return localDate.getDate() === selectedDay && localDate.getMonth() === month && localDate.getFullYear() === year;
    }).sort((a, b) => parseLocalDt(a.datetime).getTime() - parseLocalDt(b.datetime).getTime());
  }, [appointments, selectedDay, month, year]);

  const dayBlockedSlots = useMemo(() => {
    return blockedSlots.filter((b) => {
      const d = new Date(b.date + "T12:00:00");
      return d.getDate() === selectedDay && d.getMonth() === month && d.getFullYear() === year;
    });
  }, [blockedSlots, selectedDay, month, year]);

  async function handleCreate() {
    if (!newAppt.patient_name || !newAppt.date || !newAppt.time) return;
    setSaving(true);
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenantId,
          patient_name: newAppt.patient_name,
          phone: newAppt.phone,
          procedure: newAppt.procedure,
          professional: newAppt.professional,
          datetime: `${newAppt.date}T${newAppt.time}:00-03:00`,
        }),
      });
      await loadData();
      setModalOpen(false);
      setNewAppt({ patient_name: "", phone: "", procedure: "", professional: "", date: "", time: "" });
    } catch {} finally { setSaving(false); }
  }

  async function handleUpdateStatus(id: string, status: string) {
    try {
      await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, tenant_id: tenantId, status }),
      });
      await loadData();
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return;
    await handleUpdateStatus(id, "cancelado");
  }

  async function handleCreateBlock() {
    if (!newBlock.date || (!newBlock.all_day && (!newBlock.start_time || !newBlock.end_time))) return;
    setSavingBlock(true);
    try {
      await fetch("/api/appointments/blocked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, ...newBlock, start_time: newBlock.all_day ? null : newBlock.start_time, end_time: newBlock.all_day ? null : newBlock.end_time }),
      });
      await loadData();
      setBlockModalOpen(false);
      setNewBlock({ date: "", start_time: "", end_time: "", all_day: false, reason: "" });
    } catch {} finally { setSavingBlock(false); }
  }

  async function handleDeleteBlock(id: string) {
    try {
      await fetch("/api/appointments/blocked", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, tenant_id: tenantId }),
      });
      setBlockedSlots((prev) => prev.filter((b) => b.id !== id));
    } catch {}
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Agenda</h1>
          <p className="mt-1 text-sm text-ink-secondary">{appointments.filter((a) => a.status !== "cancelado").length} agendamentos ativos</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setBlockModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-canvas px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
            <Ban className="h-4 w-4" /> Bloquear
          </button>
          <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:bg-brand-700">
            <Plus className="h-4 w-4" /> Novo Agendamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2 !shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{MONTH_NAMES[month]} {year}</CardTitle>
              <div className="flex items-center gap-1">
                <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }} className="rounded-lg p-1.5 text-ink-secondary hover:bg-parchment"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }} className="rounded-lg p-1.5 text-ink-secondary hover:bg-parchment"><ChevronRight className="h-5 w-5" /></button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAY_LABELS.map((d) => <div key={d} className="py-2 text-center text-xs font-semibold text-ink-tertiary uppercase">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSelected = day === selectedDay;
                const hasAppt = appointmentDays.has(day);
                const isBlocked = blockedDays.has(day);
                return (
                  <button key={day} onClick={() => setSelectedDay(day)} className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-medium transition-all",
                    isSelected ? "bg-brand-600 text-white shadow-md" : isToday ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-parchment",
                  )}>
                    {day}
                    <div className="absolute bottom-1 flex gap-0.5">
                      {hasAppt && <span className={cn("h-1.5 w-1.5 rounded-full", isSelected ? "bg-canvas" : "bg-brand-500")} />}
                      {isBlocked && <span className={cn("h-1.5 w-1.5 rounded-full", isSelected ? "bg-red-200" : "bg-red-500")} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day view */}
        <Card className="!shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-brand-600" />
              {selectedDay} de {MONTH_NAMES[month]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Blocked slots */}
            {dayBlockedSlots.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3">
                <div>
                  <p className="text-sm font-medium text-red-700">{b.all_day ? "Dia inteiro" : `${b.start_time} - ${b.end_time}`}</p>
                  <p className="text-xs text-red-500">{b.reason || "Bloqueado"}</p>
                </div>
                <button onClick={() => handleDeleteBlock(b.id)} className="rounded-lg p-1 text-red-400 hover:bg-red-100"><X className="h-4 w-4" /></button>
              </div>
            ))}

            {/* Appointments */}
            {dayAppointments.length === 0 && dayBlockedSlots.length === 0 && (
              <p className="text-sm text-ink-tertiary text-center py-8">Sem agendamentos</p>
            )}
            {dayAppointments.map((appt) => (
              <div key={appt.id} className={cn("rounded-xl border p-3 transition-colors", appt.status === "cancelado" ? "border-divider bg-parchment opacity-50" : "border-hairline hover:border-brand-200")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink truncate">{appt.patient_name}</p>
                      <StatusBadge status={appt.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-ink-secondary">{appt.procedure || "Consulta"}</p>
                    {appt.professional && <p className="text-xs text-ink-tertiary">{appt.professional}</p>}
                    <p className="mt-1 text-xs font-medium text-brand-600">{formatTime(appt.datetime)}</p>
                  </div>
                  {appt.status !== "cancelado" && (
                    <div className="flex items-center gap-1">
                      {appt.status === "agendado" && (
                        <button onClick={() => handleUpdateStatus(appt.id, "confirmado")} className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-50" title="Confirmar">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(appt.id)} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50" title="Cancelar">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="animate-slide-up w-full max-w-md rounded-2xl bg-canvas p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-ink">Novo Agendamento</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 text-ink-tertiary hover:bg-parchment"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Paciente *</label>
                <input type="text" value={newAppt.patient_name} onChange={(e) => setNewAppt({...newAppt, patient_name: e.target.value})} placeholder="Nome" className="w-full rounded-xl border border-divider px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Telefone</label>
                <input type="text" value={newAppt.phone} onChange={(e) => setNewAppt({...newAppt, phone: e.target.value})} placeholder="5541..." className="w-full rounded-xl border border-divider px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Procedimento</label>
                  <input type="text" value={newAppt.procedure} onChange={(e) => setNewAppt({...newAppt, procedure: e.target.value})} className="w-full rounded-xl border border-divider px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Profissional</label>
                  <input type="text" value={newAppt.professional} onChange={(e) => setNewAppt({...newAppt, professional: e.target.value})} className="w-full rounded-xl border border-divider px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Data *</label>
                  <input type="date" value={newAppt.date} onChange={(e) => setNewAppt({...newAppt, date: e.target.value})} className="w-full rounded-xl border border-divider px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Horário *</label>
                  <input type="time" value={newAppt.time} onChange={(e) => setNewAppt({...newAppt, time: e.target.value})} className="w-full rounded-xl border border-divider px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                </div>
              </div>
              <button onClick={handleCreate} disabled={saving || !newAppt.patient_name || !newAppt.date || !newAppt.time} className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white shadow-md hover:bg-brand-700 disabled:opacity-40">
                {saving ? "Agendando..." : "Agendar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="animate-slide-up w-full max-w-md rounded-2xl bg-canvas p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-ink">Bloquear Horário</h2>
              <button onClick={() => setBlockModalOpen(false)} className="rounded-lg p-1.5 text-ink-tertiary hover:bg-parchment"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Data *</label>
                <input type="date" value={newBlock.date} onChange={(e) => setNewBlock({...newBlock, date: e.target.value})} className="w-full rounded-xl border border-divider px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={newBlock.all_day} onChange={(e) => setNewBlock({...newBlock, all_day: e.target.checked})} className="rounded border-hairline text-brand-600 focus:ring-brand-500" />
                <span className="text-sm text-ink">Dia inteiro</span>
              </label>
              {!newBlock.all_day && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Início</label>
                    <input type="time" value={newBlock.start_time} onChange={(e) => setNewBlock({...newBlock, start_time: e.target.value})} className="w-full rounded-xl border border-divider px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Fim</label>
                    <input type="time" value={newBlock.end_time} onChange={(e) => setNewBlock({...newBlock, end_time: e.target.value})} className="w-full rounded-xl border border-divider px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Motivo</label>
                <input type="text" value={newBlock.reason} onChange={(e) => setNewBlock({...newBlock, reason: e.target.value})} placeholder="Ex: Feriado, reunião..." className="w-full rounded-xl border border-divider px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              </div>
              <button onClick={handleCreateBlock} disabled={savingBlock} className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white shadow-md hover:bg-red-700 disabled:opacity-40">
                {savingBlock ? "Bloqueando..." : "Bloquear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
