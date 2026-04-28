"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Building2,
  Plus,
  Users,
  Bot,
  Wifi,
  WifiOff,
  Search,
  ChevronRight,
  Shield,
  Activity,
  Smartphone,
} from "lucide-react";
import Link from "next/link";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  evolution_instance: string;
  status: string;
  plan: string;
  created_at: string;
  _count?: { users: number; leads: number };
}

export default function AdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTenants() {
      try {
        const res = await fetch("/api/admin/tenants");
        const data = await res.json();
        if (data.tenants) setTenants(data.tenants);
      } catch {} finally {
        setLoading(false);
      }
    }
    fetchTenants();
  }, []);

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-brand-600" />
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Admin FYRE</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">Painel de Clínicas</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Gerencie todas as clínicas cadastradas no ClinPRO
          </p>
        </div>
        <Link
          href="/admin/onboarding"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-200 transition-all hover:bg-brand-700 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Nova Clínica
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Clínicas Ativas", value: tenants.filter((t) => t.status === "active").length, icon: Building2, color: "bg-brand-100 text-brand-700" },
          { label: "Total Leads", value: "—", icon: Users, color: "bg-blue-100 text-blue-700" },
          { label: "Agentes Ativos", value: "—", icon: Bot, color: "bg-emerald-100 text-emerald-700" },
          { label: "Instâncias Online", value: "—", icon: Smartphone, color: "bg-amber-100 text-amber-700" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-hairline bg-canvas p-4 shadow-sm">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl mb-2", stat.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-ink">{stat.value}</p>
              <p className="text-xs text-ink-secondary mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary" />
        <input
          type="text"
          placeholder="Buscar clínica..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-divider bg-canvas pl-10 pr-4 py-2.5 text-sm placeholder:text-ink-tertiary focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* Clinic list */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-ink-tertiary">Carregando...</div>
        ) : filtered.length === 0 ? (
          <Card className="!shadow-sm">
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-ink-tertiary mx-auto mb-3" />
              <p className="text-ink-secondary font-medium">Nenhuma clínica cadastrada</p>
              <p className="text-sm text-ink-tertiary mt-1">Clique em &quot;Nova Clínica&quot; para começar o onboarding</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((tenant, i) => (
            <div
              key={tenant.id}
              className="animate-slide-up flex items-center gap-4 rounded-2xl border border-hairline bg-canvas p-4 shadow-sm transition-all hover:shadow-md hover:border-divider cursor-pointer"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-sm shadow-md">
                {tenant.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-ink">{tenant.name}</p>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    tenant.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-parchment text-ink-secondary"
                  )}>
                    {tenant.status === "active" ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-ink-secondary">
                  <span>{tenant.email}</span>
                  <span className="text-ink-tertiary">&middot;</span>
                  <span className="flex items-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    {tenant.evolution_instance || "Sem instância"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1">
                  <span className={cn("h-2 w-2 rounded-full", tenant.status === "active" ? "bg-emerald-500" : "bg-gray-300")} />
                  <span className="text-xs text-ink-tertiary">{tenant.evolution_instance ? "Conectado" : "—"}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-tertiary" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
