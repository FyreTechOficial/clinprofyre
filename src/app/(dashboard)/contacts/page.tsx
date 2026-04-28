"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { pipelineStages } from "@/constants/nav-items";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Filter,
  Phone,
  MessageSquare,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import LeadCardModal from "@/components/lead-card-modal";

interface Contact {
  id: string;
  name: string;
  phone: string;
  procedure_interest: string | null;
  lead_score: string;
  pipeline_stage: string;
  last_interaction: string | null;
  source: string | null;
}

const PAGE_SIZE = 10;

function ScoreBadge({ score }: { score: string }) {
  const config = score === "quente"
    ? { bg: "bg-emerald-500", text: "Quente" }
    : score === "morno"
      ? { bg: "bg-amber-500", text: "Morno" }
      : { bg: "bg-red-500", text: "Frio" };

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white", config.bg)}>
      <Sparkles className="h-3 w-3" />
      {config.text}
    </span>
  );
}

function StageBadge({ stageId }: { stageId: string }) {
  const stage = pipelineStages.find((s) => s.id === stageId);
  if (!stage) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: stage.color }}>
      {stage.label}
    </span>
  );
}

export default function ContactsPage() {
  const { tenantId } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      try {
        const res = await fetch(`/api/contacts?tenant_id=${tenantId}`);
        const data = await res.json();
        setContacts(data.contacts ?? []);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [tenantId]);

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.procedure_interest ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesStage = stageFilter === "all" || c.pipeline_stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [contacts, search, stageFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-brand-500" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Contatos</h1>
          <p className="mt-1 text-sm text-ink-secondary">{contacts.length} leads e pacientes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: contacts.length, color: "bg-brand-100 text-brand-700" },
          { label: "Quentes", value: contacts.filter((c) => c.lead_score === "quente").length, color: "bg-emerald-100 text-emerald-700" },
          { label: "Mornos", value: contacts.filter((c) => c.lead_score === "morno").length, color: "bg-amber-100 text-amber-700" },
          { label: "Frios", value: contacts.filter((c) => c.lead_score === "frio").length, color: "bg-red-100 text-red-700" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-hairline bg-canvas p-4 shadow-sm text-center">
            <p className={cn("inline-flex items-center justify-center h-10 w-10 rounded-xl text-sm font-bold mx-auto", stat.color)}>{stat.value}</p>
            <p className="text-xs text-ink-secondary mt-1.5 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
          <input type="text" placeholder="Buscar..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-divider bg-canvas py-2.5 pl-10 pr-4 text-sm placeholder:text-ink-tertiary focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
          <select value={stageFilter} onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
            className="appearance-none rounded-xl border border-divider bg-canvas py-2.5 pl-10 pr-10 text-sm focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100">
            <option value="all">Todos os estágios</option>
            {pipelineStages.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="!shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline bg-parchment/80">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">Paciente</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">Interesse</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">Score</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">Pipeline</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">Origem</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-ink-secondary uppercase tracking-wider">Atividade</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c, i) => (
                  <tr key={c.id} className="border-b border-hairline hover:bg-brand-50/20 transition-colors cursor-pointer" onClick={() => setSelectedContact(c)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                          {(c.name ?? c.phone).split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{c.name ?? c.phone}</p>
                          <p className="text-xs text-ink-tertiary flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-lg bg-parchment px-2 py-1 text-xs font-medium text-ink-secondary">
                        {c.procedure_interest || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5"><ScoreBadge score={c.lead_score ?? "morno"} /></td>
                    <td className="px-5 py-3.5"><StageBadge stageId={c.pipeline_stage ?? "lead_novo"} /></td>
                    <td className="px-5 py-3.5 text-xs text-ink-secondary">{c.source || "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-ink-tertiary">
                      {c.last_interaction ? new Date(c.last_interaction).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-ink-tertiary">
                    {contacts.length === 0 ? "Nenhum contato ainda. Leads aparecerão aqui quando pacientes mandarem mensagem." : "Nenhum resultado para essa busca."}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-secondary">Mostrando {paginated.length} de {filtered.length}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-xl border border-divider bg-canvas px-3 py-2 text-sm font-medium text-ink hover:bg-parchment disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-divider bg-canvas px-3 py-2 text-sm font-medium text-ink hover:bg-parchment disabled:opacity-40">
              Próximo <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {selectedContact && (
        <LeadCardModal
          leadId={selectedContact.id}
          phone={selectedContact.phone}
          tenantId={tenantId}
          isOpen={!!selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </div>
  );
}
