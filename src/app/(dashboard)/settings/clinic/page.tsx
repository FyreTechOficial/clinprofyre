"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Building2, Loader2, Bell, MessageSquare, Check, RefreshCw, MapPin, Phone, Clock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface WhatsAppGroup {
  id: string;
  name: string;
}

export default function ClinicSettingsPage() {
  const { tenantId, tenant, refreshTenant } = useAuth();
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    workingHours: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [savingGroup, setSavingGroup] = useState(false);
  const [groupSaved, setGroupSaved] = useState(false);

  useEffect(() => {
    if (!tenant) return;
    setForm({
      name: tenant.name || "",
      address: (tenant as any).address || "",
      phone: (tenant as any).phone || "",
      workingHours: (tenant as any).working_hours || "",
    });
    setSelectedGroupId((tenant as any).alert_group_id || "");
    setSelectedGroupName((tenant as any).alert_group_name || "");
  }, [tenant]);

  async function loadGroups() {
    if (!tenant?.evolution_instance) return;
    setLoadingGroups(true);
    try {
      const res = await fetch(`/api/whatsapp/groups?instance=${tenant.evolution_instance}`);
      const data = await res.json();
      setGroups(data.groups ?? []);
    } catch {} finally { setLoadingGroups(false); }
  }

  useEffect(() => {
    if (tenant?.evolution_instance) loadGroups();
  }, [tenant]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantId) return;
    setIsSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings/clinic", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenantId,
          name: form.name,
          address: form.address,
          phone: form.phone,
          working_hours: form.workingHours,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      await refreshTenant();
      setSaved(true);
      toast.success("Dados da clínica salvos!");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Erro ao salvar dados");
    } finally { setIsSaving(false); }
  }

  async function handleSaveGroup() {
    if (!tenantId) return;
    setSavingGroup(true);
    setGroupSaved(false);
    try {
      await fetch("/api/whatsapp/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, alert_group_id: selectedGroupId, alert_group_name: selectedGroupName }),
      });
      setGroupSaved(true);
      setTimeout(() => setGroupSaved(false), 3000);
    } catch {} finally { setSavingGroup(false); }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Clinic Info Card */}
      <div className="rounded-[18px] border border-divider bg-canvas overflow-hidden">
        <div className="px-6 py-4 border-b border-divider flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-50 text-brand-700">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Dados da Clínica</h2>
            <p className="text-[12px] text-ink-tertiary">Informações gerais do estabelecimento</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-semibold text-ink mb-1.5">
              <Building2 className="h-3.5 w-3.5 text-ink-tertiary" />
              Nome da Clínica
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Clínica Odonto Vida"
              className="w-full px-4 py-2.5 rounded-[12px] bg-canvas border border-hairline text-[14px] text-ink placeholder:text-ink-tertiary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all hover:border-ink-tertiary"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-semibold text-ink mb-1.5">
              <MapPin className="h-3.5 w-3.5 text-ink-tertiary" />
              Endereço
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Rua, número, bairro, cidade"
              className="w-full px-4 py-2.5 rounded-[12px] bg-canvas border border-hairline text-[14px] text-ink placeholder:text-ink-tertiary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all hover:border-ink-tertiary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-[13px] font-semibold text-ink mb-1.5">
                <Phone className="h-3.5 w-3.5 text-ink-tertiary" />
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(41) 99999-9999"
                className="w-full px-4 py-2.5 rounded-[12px] bg-canvas border border-hairline text-[14px] text-ink placeholder:text-ink-tertiary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all hover:border-ink-tertiary"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[13px] font-semibold text-ink mb-1.5">
                <Clock className="h-3.5 w-3.5 text-ink-tertiary" />
                Horário de Funcionamento
              </label>
              <input
                type="text"
                value={form.workingHours}
                onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                placeholder="Seg-Sex 8h-18h"
                className="w-full px-4 py-2.5 rounded-[12px] bg-canvas border border-hairline text-[14px] text-ink placeholder:text-ink-tertiary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all hover:border-ink-tertiary"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-full brand-gradient px-6 py-2.5 text-[14px] font-medium text-white hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : saved ? <><Check className="w-4 h-4" /> Salvo!</> : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>

      {/* Alert Group Card */}
      <div className="rounded-[18px] border border-divider bg-canvas overflow-hidden">
        <div className="px-6 py-4 border-b border-divider flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-amber-50 text-amber-600">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Grupo de Alertas</h2>
            <p className="text-[12px] text-ink-tertiary">Grupo do WhatsApp que receberá alertas de leads quentes</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {selectedGroupName && (
            <div className="flex items-center gap-3 rounded-[12px] border border-emerald-200 bg-emerald-50/50 px-4 py-3">
              <MessageSquare className="h-4 w-4 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-emerald-800">{selectedGroupName}</p>
                <p className="text-[11px] text-emerald-600 font-mono truncate">{selectedGroupId}</p>
              </div>
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-[13px] font-semibold text-ink mb-1.5 block">Selecionar Grupo</label>
              <select
                value={selectedGroupId}
                onChange={(e) => {
                  const group = groups.find((g) => g.id === e.target.value);
                  setSelectedGroupId(e.target.value);
                  setSelectedGroupName(group?.name ?? "");
                }}
                className="w-full px-4 py-2.5 rounded-[12px] bg-canvas border border-hairline text-[14px] text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all hover:border-ink-tertiary"
              >
                <option value="">Nenhum (alertas só pro dono)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={loadGroups}
              disabled={loadingGroups}
              className="shrink-0 flex items-center justify-center h-[42px] w-[42px] rounded-[12px] border border-hairline bg-canvas text-ink-secondary hover:bg-parchment transition-all active:scale-[0.97]"
            >
              <RefreshCw className={cn("h-4 w-4", loadingGroups && "animate-spin")} />
            </button>
          </div>

          {groups.length === 0 && !loadingGroups && (
            <p className="text-[12px] text-ink-tertiary">Nenhum grupo encontrado. Verifique se o WhatsApp está conectado.</p>
          )}

          <div className="pt-1">
            <button
              onClick={handleSaveGroup}
              disabled={savingGroup}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-[14px] font-medium text-white hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50"
            >
              {savingGroup ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : groupSaved ? <><Check className="w-4 h-4" /> Salvo!</> : <><Bell className="w-4 h-4" /> Salvar Grupo</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
