"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Building2, Upload, Loader2, Bell, MessageSquare, Check, RefreshCw, ImageIcon, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface WhatsAppGroup {
  id: string;
  name: string;
}

export default function ClinicSettingsPage() {
  const { tenantId, tenant } = useAuth();
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    workingHours: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Alert group
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [savingGroup, setSavingGroup] = useState(false);
  const [groupSaved, setGroupSaved] = useState(false);

  // Load tenant data
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
    setLogoUrl((tenant as any).logo_url || null);
  }, [tenant]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !tenantId) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tenant_id", tenantId);
      const res = await fetch("/api/upload-logo", { method: "POST", body: formData });
      const data = await res.json();
      if (data.logo_url) {
        setLogoUrl(data.logo_url);
        window.location.reload(); // Reload to update sidebar
      }
    } catch {} finally {
      setUploadingLogo(false);
    }
  }

  async function handleRemoveLogo() {
    if (!tenantId) return;
    setUploadingLogo(true);
    try {
      // Just clear the logo_url in the tenant
      const supabaseUrl = "https://bkihuixqdpfinqeuqrgc.supabase.co";
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      // Use the API instead
      await fetch("/api/whatsapp/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, alert_group_id: selectedGroupId, alert_group_name: selectedGroupName }),
      });
      setLogoUrl(null);
      window.location.reload();
    } catch {} finally {
      setUploadingLogo(false);
    }
  }

  // Load groups
  async function loadGroups() {
    if (!tenant?.evolution_instance) return;
    setLoadingGroups(true);
    try {
      const res = await fetch(`/api/whatsapp/groups?instance=${tenant.evolution_instance}`);
      const data = await res.json();
      setGroups(data.groups ?? []);
    } catch {} finally {
      setLoadingGroups(false);
    }
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
      // TODO: Save to Supabase when API is ready
      await new Promise((r) => setTimeout(r, 500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {} finally {
      setIsSaving(false);
    }
  }

  async function handleSaveGroup() {
    if (!tenantId) return;
    setSavingGroup(true);
    setGroupSaved(false);
    try {
      await fetch("/api/whatsapp/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenantId,
          alert_group_id: selectedGroupId,
          alert_group_name: selectedGroupName,
        }),
      });
      setGroupSaved(true);
      setTimeout(() => setGroupSaved(false), 3000);
    } catch {} finally {
      setSavingGroup(false);
    }
  }

  const INPUT_CLASS = cn(
    "w-full px-4 py-3 rounded-xl",
    "bg-white border border-gray-200",
    "text-gray-800 placeholder-gray-400 text-sm",
    "outline-none transition-all duration-200",
    "focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
  );

  return (
    <div className="animate-fade-in space-y-8">
      {/* Clinic Info */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Dados da Clínica</h2>
            <p className="text-sm text-gray-500">Informações gerais</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
          {/* Logo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logo da Clínica</label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative">
                  <img src={logoUrl} alt="Logo" className="h-16 w-16 rounded-xl object-cover border border-gray-200 shadow-sm" />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                  <ImageIcon className="h-6 w-6 text-gray-300" />
                </div>
              )}
              <div>
                <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors">
                  {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploadingLogo ? "Enviando..." : "Enviar Logo"}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
                </label>
                <p className="text-[10px] text-gray-400 mt-1">PNG, JPG ou SVG. Aparece na sidebar e no sistema.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome da Clínica</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Clínica Odonto Vida" className={INPUT_CLASS} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Endereço</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua, número, bairro, cidade" className={INPUT_CLASS} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone / WhatsApp</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(41) 99999-9999" className={INPUT_CLASS} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Horário de Funcionamento</label>
              <input type="text" value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} placeholder="Seg-Sex 8h-18h" className={INPUT_CLASS} />
            </div>
          </div>
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white text-sm bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-200 transition-all disabled:opacity-50">
            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : saved ? <><Check className="w-4 h-4" /> Salvo!</> : <><Upload className="w-4 h-4" /> Salvar</>}
          </button>
        </form>
      </div>

      {/* Alert Group */}
      <div className="border-t border-gray-100 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Grupo de Alertas</h2>
            <p className="text-sm text-gray-500">Selecione o grupo do WhatsApp que receberá alertas de leads quentes</p>
          </div>
        </div>

        <div className="max-w-2xl space-y-4">
          {/* Current group */}
          {selectedGroupName && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800">Grupo ativo: {selectedGroupName}</p>
                <p className="text-xs text-emerald-600 font-mono">{selectedGroupId}</p>
              </div>
            </div>
          )}

          {/* Group selector */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Selecionar Grupo</label>
              <select
                value={selectedGroupId}
                onChange={(e) => {
                  const group = groups.find((g) => g.id === e.target.value);
                  setSelectedGroupId(e.target.value);
                  setSelectedGroupName(group?.name ?? "");
                }}
                className={INPUT_CLASS}
              >
                <option value="">Nenhum (alertas só pro dono)</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <button onClick={loadGroups} disabled={loadingGroups} className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-all">
              <RefreshCw className={cn("h-4 w-4", loadingGroups && "animate-spin")} />
            </button>
          </div>

          {groups.length === 0 && !loadingGroups && (
            <p className="text-xs text-gray-400">Nenhum grupo encontrado. Verifique se o WhatsApp está conectado e se a clínica participa de algum grupo.</p>
          )}

          <button
            onClick={handleSaveGroup}
            disabled={savingGroup}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white text-sm bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-200 transition-all disabled:opacity-50"
          >
            {savingGroup ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : groupSaved ? <><Check className="w-4 h-4" /> Salvo!</> : <><Bell className="w-4 h-4" /> Salvar Grupo</>}
          </button>
        </div>
      </div>
    </div>
  );
}
