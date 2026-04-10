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
import { Phone, Sparkles, GripVertical, Clock, User, Bot, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

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

  const { tenantId } = useAuth();

  const fetchLeads = useCallback(async (showLoader: boolean) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch(`/api/pipeline?tenant_id=${tenantId}`);
      const data = await res.json();
      const leads: Lead[] = data.leads ?? [];

      // Group by stage
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

  // Initial load + poll every 10s
  useEffect(() => {
    fetchLeads(true);
    const interval = setInterval(() => fetchLeads(false), 10000);
    return () => clearInterval(interval);
  }, [fetchLeads]);

  const totalLeads = Object.values(board).reduce((acc, leads) => acc + leads.length, 0);

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

    // Optimistic update
    setBoard((prev) => ({
      ...prev,
      [source.droppableId]: sourceCol,
      ...(source.droppableId !== destination.droppableId && { [destination.droppableId]: destCol }),
    }));

    // Save to Supabase if stage changed
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
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="mt-1 text-sm text-gray-500">
            {totalLeads} leads no funil &middot; Atualiza em tempo real conforme a IA qualifica
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchLeads(false)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Atualizar
          </button>
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 border border-brand-100">
            <Bot className="h-3.5 w-3.5 text-brand-600" />
            <span className="text-xs font-medium text-brand-700">IA movimenta automaticamente</span>
          </div>
        </div>
      </div>

      {/* Stage summary */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {pipelineStages.map((stage) => (
          <div key={stage.id} className="flex items-center gap-1.5 rounded-lg bg-white border border-gray-100 px-2.5 py-1.5 shrink-0">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
            <span className="text-xs font-medium text-gray-600">{stage.label}</span>
            <span className="text-xs font-bold text-gray-900">{(board[stage.id] ?? []).length}</span>
          </div>
        ))}
      </div>

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
                      "flex w-72 shrink-0 flex-col rounded-2xl transition-all duration-200",
                      snapshot.isDraggingOver ? "bg-brand-50/50 ring-2 ring-brand-200" : "bg-gray-50/80",
                    )}
                  >
                    <div className="flex items-center gap-2.5 px-4 py-3">
                      <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: stage.color }} />
                      <span className="text-sm font-bold text-gray-800">{stage.label}</span>
                      <span className="ml-auto flex h-6 min-w-[24px] items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-gray-600 shadow-sm">
                        {leads.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2 px-2 pb-3 min-h-[100px]">
                      {leads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "rounded-xl border bg-white p-3 transition-all duration-200",
                                snapshot.isDragging
                                  ? "border-brand-300 shadow-xl shadow-brand-200/40 rotate-1 scale-105"
                                  : "border-gray-100/80 shadow-sm hover:shadow-md hover:border-gray-200",
                              )}
                              style={provided.draggableProps.style}
                            >
                              <div className="flex items-start gap-2">
                                <div {...provided.dragHandleProps} className="mt-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
                                  <GripVertical className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{lead.name}</p>
                                    <ScoreBadge score={lead.lead_score} />
                                  </div>
                                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                                    <Phone className="h-3 w-3" />
                                    {lead.phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "+$1 ($2) $3-$4")}
                                  </p>
                                  <div className="mt-2 flex items-center justify-between gap-1">
                                    {lead.procedure_interest ? (
                                      <span className="rounded-lg bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500 truncate">
                                        {lead.procedure_interest}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-gray-300">Sem interesse definido</span>
                                    )}
                                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
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
                        <div className="flex flex-col items-center justify-center py-8 text-gray-300">
                          <User className="h-8 w-8 mb-1" />
                          <p className="text-xs">Sem leads</p>
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
    </div>
  );
}
