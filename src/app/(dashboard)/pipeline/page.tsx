"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { pipelineStages } from "@/constants/nav-items";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Phone, Sparkles, GripVertical, Clock, User, Bot, Loader2, RefreshCw, TrendingUp, Users, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import LeadCardModal from "@/components/lead-card-modal";

interface Lead {
  id: string;
  name: string;
  phone: string;
  procedure_interest: string | null;
  lead_score: string;
  pipeline_stage: string;
  last_interaction: string | null;
  source: string | null;
}

type BoardData = Record<string, Lead[]>;

function ScoreBadge({ score }: { score: string }) {
  const config =
    score === "quente" ? { bg: "bg-emerald-500", label: "Quente" }
    : score === "morno" ? { bg: "bg-amber-500", label: "Morno" }
    : { bg: "bg-red-500", label: "Frio" };

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white", config.bg)}>
      <Sparkles className="h-2.5 w-2.5" />
      {config.label}
    </span>
  );
}

function timeAgo(date: string | null) {
  if (!date) return "—";
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export default function PipelinePage() {
  const [board, setBoard] = useState<BoardData>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { tenantId } = useAuth();

  const fetchLeads = useCallback(async (showLoader: boolean) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch(`/api/pipeline?tenant_id=${tenantId}`);
      const data = await res.json();
      const leads: Lead[] = data.leads ?? [];

      const grouped: BoardData = {};
      for (const stage of pipelineStages) {
        grouped[stage.id] = [];
      }
      for (const lead of leads) {
        const stage = lead.pipeline_stage || "lead_novo";
        if (!grouped[stage]) grouped[stage] = [];
        grouped[stage].push(lead);
      }
      setBoard(grouped);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchLeads(true);
    const interval = setInterval(() => fetchLeads(false), 10000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  const totalLeads = Object.values(board).reduce((acc, leads) => acc + leads.length, 0);
  const hotLeads = Object.values(board).flat().filter((l) => l.lead_score === "quente").length;
  const warmLeads = Object.values(board).flat().filter((l) => l.lead_score === "morno").length;

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = [...(board[source.droppableId] ?? [])];
    const destCol = source.droppableId === destination.droppableId
      ? sourceCol
      : [...(board[destination.droppableId] ?? [])];

    const [moved] = sourceCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, moved);

    setBoard((prev) => ({
      ...prev,
      [source.droppableId]: sourceCol,
      ...(source.droppableId !== destination.droppableId && { [destination.droppableId]: destCol }),
    }));

    if (source.droppableId !== destination.droppableId) {
      try {
        await fetch("/api/pipeline", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenant_id: tenantId,
            lead_id: draggableId,
            pipeline_stage: destination.droppableId,
            from_stage: source.droppableId,
          }),
        });
      } catch {}
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-brand-700" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-ink tracking-tight">Pipeline</h1>
          <p className="mt-0.5 text-[14px] text-ink-secondary">
            Funil de vendas com movimentação automática por IA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLeads(false)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-full border border-divider bg-canvas px-4 py-2 text-[13px] font-medium text-ink-secondary hover:bg-parchment transition-all active:scale-[0.97]"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 rounded-[14px] bg-canvas border border-divider px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-50 text-brand-700">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-ink-tertiary uppercase tracking-wider">Total</p>
            <p className="text-[20px] font-bold text-ink leading-none mt-0.5">{totalLeads}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[14px] bg-canvas border border-divider px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-600">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-ink-tertiary uppercase tracking-wider">Quentes</p>
            <p className="text-[20px] font-bold text-ink leading-none mt-0.5">{hotLeads}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[14px] bg-canvas border border-divider px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-amber-50 text-amber-600">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-ink-tertiary uppercase tracking-wider">Mornos</p>
            <p className="text-[20px] font-bold text-ink leading-none mt-0.5">{warmLeads}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-[14px] bg-canvas border border-divider px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-50 text-brand-700">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-ink-tertiary uppercase tracking-wider">IA ativa</p>
            <p className="text-[13px] font-semibold text-brand-700 leading-none mt-1">Movimenta auto</p>
          </div>
        </div>
      </div>

      {/* Stage pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {pipelineStages.map((stage) => {
          const count = (board[stage.id] ?? []).length;
          return (
            <div
              key={stage.id}
              className="flex items-center gap-1.5 rounded-full bg-canvas border border-divider px-3 py-1.5 shrink-0 transition-all hover:border-hairline"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
              <span className="text-[12px] font-medium text-ink-secondary">{stage.label}</span>
              <span className="text-[12px] font-bold text-ink">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 lg:-mx-8 lg:px-8">
          {pipelineStages.map((stage) => {
            const leads = board[stage.id] ?? [];
            return (
              <Droppable key={stage.id} droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex w-72 shrink-0 flex-col rounded-[18px] border transition-all duration-200",
                      snapshot.isDraggingOver
                        ? "bg-brand-50/30 border-brand-200 ring-2 ring-brand-100"
                        : "bg-canvas/50 border-divider",
                    )}
                  >
                    {/* Column header */}
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-divider/60">
                      <div className="h-2.5 w-2.5 rounded-full ring-2 ring-canvas" style={{ backgroundColor: stage.color }} />
                      <span className="text-[13px] font-semibold text-ink">{stage.label}</span>
                      <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-parchment px-1.5 text-[11px] font-bold text-ink-secondary">
                        {leads.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 space-y-2 p-2 min-h-[120px]">
                      {leads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "rounded-[14px] border bg-canvas p-3 transition-all duration-200 cursor-pointer group",
                                snapshot.isDragging
                                  ? "border-brand-300 shadow-xl shadow-brand-200/30 rotate-1 scale-[1.03]"
                                  : "border-divider hover:border-hairline hover:shadow-sm",
                              )}
                              style={provided.draggableProps.style}
                              onClick={() => setSelectedLead(lead)}
                            >
                              <div className="flex items-start gap-2">
                                <div {...provided.dragHandleProps} className="mt-0.5 text-ink-tertiary opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                  <GripVertical className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="text-[13px] font-semibold text-ink truncate">{lead.name}</p>
                                    <ScoreBadge score={lead.lead_score} />
                                  </div>
                                  <p className="mt-1 flex items-center gap-1 text-[12px] text-ink-tertiary">
                                    <Phone className="h-3 w-3" />
                                    {lead.phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "+$1 ($2) $3-$4")}
                                  </p>
                                  <div className="mt-2 flex items-center justify-between gap-1">
                                    {lead.procedure_interest ? (
                                      <span className="rounded-full bg-parchment px-2 py-0.5 text-[11px] font-medium text-ink-secondary truncate max-w-[140px]">
                                        {lead.procedure_interest}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-ink-tertiary italic">Sem interesse</span>
                                    )}
                                    <span className="flex items-center gap-0.5 text-[10px] text-ink-tertiary shrink-0">
                                      <Clock className="h-2.5 w-2.5" />
                                      {timeAgo(lead.last_interaction)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {leads.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-ink-tertiary">
                          <div className="h-10 w-10 rounded-full bg-parchment flex items-center justify-center mb-2">
                            <User className="h-5 w-5" />
                          </div>
                          <p className="text-[12px] font-medium">Sem leads</p>
                          <p className="text-[11px] text-ink-tertiary mt-0.5">Nesta etapa</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {selectedLead && (
        <LeadCardModal
          leadId={selectedLead.id}
          phone={selectedLead.phone}
          tenantId={tenantId}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
