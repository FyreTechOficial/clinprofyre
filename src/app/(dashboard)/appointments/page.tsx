"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  X,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    agendado: "bg-blue-50 text-blue-700 ring-blue-200",
    confirmado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    atendido: "bg-green-50 text-green-700 ring-green-200",
    no_show: "bg-red-50 text-red-700 ring-red-200",
    cancelado: "bg-gray-50 text-gray-600 ring-gray-200",
  };
  const labels: Record<string, string> = {
    agendado: "Agendado",
    confirmado: "Confirmado",
    atendido: "Atendido",
    no_show: "No-show",
    cancelado: "Cancelado",
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
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAppt, setNewAppt] = useState({ patient_name: "", phone: "", procedure: "", professional: "", date: "", time: "" });

  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      try {
        const res = await fetch(`/api/appointments?tenant_id=${tenantId}`);
        const data = await res.json();
        setAppointments(data.appointments ?? []);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [tenantId]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const appointmentDays = useMemo(() => {
    const set = new Set<number>();
    appointments.forEach((a) => {
      const d = new Date(a.datetime);
      if (d.getMonth() === month && d.getFullYear() === year) set.add(d.getDate());
    });
    return set;
  }, [appointments, month, year]);

  const dayAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const d = new Date(a.datetime);
        return d.getDate() === selectedDay && d.getMonth() === month && d.getFullYear() === year;
      })
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  }, [appointments, selectedDay, month, year]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

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
          datetime: `${newAppt.date}T${newAppt.time}:00`,
        }),
      });
      // Refresh
      const res = await fetch(`/api/appointments?tenant_id=${tenantId}`);
      const data = await res.json();
      setAppointments(data.appointments ?? []);
      setModalOpen(false);
      setNewAppt({ patient_name: "", phone: "", procedure: "", professional: "", date: "", time: "" });
    } catch {} finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="mt-1 text-sm text-gray-500">{appointments.length} agendamentos</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-brand-600/20 hover:bg-brand-700">
          <Plus className="h-4 w-4" /> Novo Agendamento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2 !shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{MONTH_NAMES[month]} {year}</CardTitle>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={nextMonth} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"><ChevronRight className="h-5 w-5" /></button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAY_LABELS.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const isSelected = day === selectedDay;
                const hasAppt = appointmentDays.has(day);
                return (
                  <button key={day} onClick={() => setSelectedDay(day)}
                    className={cn(
                      "relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-medium transition-all",
                      isSelected ? "bg-brand-600 text-white shadow-md" : isToday ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-gray-50",
                    )}>
                    {day}
                    {hasAppt && <span className={cn("absolute bottom-1.5 h-1.5 w-1.5 rounded-full", isSelected ? "bg-white" : "bg-brand-500")} />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day appointments */}
        <Card className="!shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-brand-600" />
              {selectedDay} de {MONTH_NAMES[month]}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dayAppointments.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">Sem agendamentos para este dia</p>
            )}
            {dayAppointments.map((appt) => (
              <div key={appt.id} className="flex items-start gap-3 rounded-xl border border-gray-100 p-3 hover:border-brand-200 transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{appt.patient_name}</p>
                    <StatusBadge status={appt.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{appt.procedure || "Consulta"}</p>
                  {appt.professional && <p className="text-xs text-gray-400">{appt.professional}</p>}
                  <p className="mt-1 text-xs font-medium text-brand-600">
                    {new Date(appt.datetime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="animate-slide-up w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Novo Agendamento</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
                <input type="text" value={newAppt.patient_name} onChange={(e) => setNewAppt({ ...newAppt, patient_name: e.target.value })} placeholder="Nome do paciente"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input type="text" value={newAppt.phone} onChange={(e) => setNewAppt({ ...newAppt, phone: e.target.value })} placeholder="5541999999999"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Procedimento</label>
                <input type="text" value={newAppt.procedure} onChange={(e) => setNewAppt({ ...newAppt, procedure: e.target.value })} placeholder="Tipo de procedimento"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
                <input type="text" value={newAppt.professional} onChange={(e) => setNewAppt({ ...newAppt, professional: e.target.value })} placeholder="Dr. ..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                  <input type="date" value={newAppt.date} onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário *</label>
                  <input type="time" value={newAppt.time} onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                </div>
              </div>
              <button onClick={handleCreate} disabled={saving || !newAppt.patient_name || !newAppt.date || !newAppt.time}
                className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white shadow-md hover:bg-brand-700 disabled:opacity-40">
                {saving ? "Agendando..." : "Agendar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
