"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Modal } from "@/components/ui/modal";
import {
  Phone,
  Sparkles,
  MapPin,
  Clock,
  Tag,
  X,
  Plus,
  MessageSquare,
  User,
  Bot,
  Loader2,
} from "lucide-react";
import { pipelineStages } from "@/constants/nav-items";

interface LeadCardModalProps {
  leadId: string;
  phone: string;
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface LeadDetail {
  id: string;
  name: string;
  phone: string;
  procedure_interest: string | null;
  lead_score: string;
  pipeline_stage: string;
  last_interaction: string | null;
  source: string | null;
}

interface TagItem {
  id: string;
  tag: string;
  color: string;
}

interface Message {
  id: string;
  phone: string;
  role: string;
  content: string;
  created_at: string;
}

const TAG_COLORS = [
  "#9333ea",
  "#2563eb",
  "#059669",
  "#d97706",
  "#dc2626",
  "#ec4899",
  "#0891b2",
  "#4f46e5",
];

function ScoreBadge({ score }: { score: string }) {
  const config =
    score === "quente"
      ? { bg: "bg-emerald-500", label: "Quente" }
      : score === "morno"
        ? { bg: "bg-amber-500", label: "Morno" }
        : { bg: "bg-red-500", label: "Frio" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white",
        config.bg
      )}
    >
      <Sparkles className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export default function LeadCardModal({
  leadId,
  phone,
  tenantId,
  isOpen,
  onClose,
}: LeadCardModalProps) {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState("");
  const [newTagColor, setNewTagColor] = useState("#9333ea");
  const [addingTag, setAddingTag] = useState(false);

  useEffect(() => {
    if (!isOpen || !tenantId) return;
    setLoading(true);

    async function fetchData() {
      try {
        const [contactsRes, messagesRes, tagsRes] = await Promise.all([
          fetch(`/api/contacts?tenant_id=${tenantId}`),
          fetch(`/api/whatsapp/messages?tenant_id=${tenantId}&phone=${phone}`),
          fetch(`/api/tags?tenant_id=${tenantId}&lead_id=${leadId}`),
        ]);

        const contactsData = await contactsRes.json();
        const messagesData = await messagesRes.json();
        const tagsData = await tagsRes.json();

        const foundLead = (contactsData.contacts ?? []).find(
          (c: LeadDetail) => c.phone === phone
        );
        if (foundLead) setLead(foundLead);

        const allMsgs: Message[] = messagesData.messages ?? [];
        setMessages(allMsgs.slice(-10));

        setTags(tagsData.tags ?? []);
      } catch {
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isOpen, tenantId, phone, leadId]);

  async function handleAddTag() {
    if (!newTag.trim()) return;
    setAddingTag(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant_id: tenantId,
          lead_id: leadId,
          tag: newTag.trim(),
          color: newTagColor,
        }),
      });
      const data = await res.json();
      if (data.tag) {
        setTags((prev) => [...prev, data.tag]);
        setNewTag("");
      }
    } catch {
    } finally {
      setAddingTag(false);
    }
  }

  async function handleRemoveTag(tagId: string) {
    try {
      await fetch("/api/tags", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tagId }),
      });
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch {}
  }

  const stage = pipelineStages.find((s) => s.id === lead?.pipeline_stage);

  return (
    <Modal open={isOpen} onClose={onClose} size="xl" title="Detalhes do Contato">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
        </div>
      ) : !lead ? (
        <div className="py-12 text-center text-gray-400 text-sm">
          Contato nao encontrado
        </div>
      ) : (
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Lead info */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 font-bold text-sm">
              {(lead.name ?? lead.phone)
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900">
                  {lead.name ?? lead.phone}
                </h3>
                <ScoreBadge score={lead.lead_score} />
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                <Phone className="h-3.5 w-3.5" />
                {lead.phone.replace(
                  /(\d{2})(\d{2})(\d{5})(\d{4})/,
                  "+$1 ($2) $3-$4"
                )}
              </p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Pipeline
              </p>
              {stage ? (
                <span
                  className="inline-flex items-center gap-1.5 mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: stage.color }}
                >
                  {stage.label}
                </span>
              ) : (
                <p className="text-sm text-gray-600 mt-1">--</p>
              )}
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Interesse
              </p>
              <p className="text-sm font-medium text-gray-700 mt-1">
                {lead.procedure_interest || "--"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Origem
              </p>
              <p className="text-sm font-medium text-gray-700 mt-1">
                {lead.source || "--"}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Ultima interacao
              </p>
              <p className="text-sm font-medium text-gray-700 mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                {lead.last_interaction
                  ? new Date(lead.last_interaction).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--"}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Tags
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: t.color }}
                >
                  {t.tag}
                  <button
                    onClick={() => handleRemoveTag(t.id)}
                    className="ml-0.5 rounded-full hover:bg-white/20 p-0.5"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-gray-400">Nenhuma tag</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Nova tag..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <div className="flex items-center gap-1">
                {TAG_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewTagColor(c)}
                    className={cn(
                      "h-5 w-5 rounded-full transition-all",
                      newTagColor === c
                        ? "ring-2 ring-offset-1 ring-gray-400 scale-110"
                        : "hover:scale-110"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                onClick={handleAddTag}
                disabled={addingTag || !newTag.trim()}
                className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-40 transition-colors"
              >
                {addingTag ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          {/* Messages */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Ultimas mensagens
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">
                  Nenhuma mensagem encontrada
                </p>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        isUser ? "justify-start" : "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-xl px-3 py-2 text-xs",
                          isUser
                            ? "bg-gray-100 text-gray-700"
                            : "bg-brand-600 text-white"
                        )}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          {isUser ? (
                            <User className="h-2.5 w-2.5" />
                          ) : (
                            <Bot className="h-2.5 w-2.5" />
                          )}
                          <span className="font-semibold text-[10px] opacity-70">
                            {isUser ? "Paciente" : "IA"}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            isUser ? "text-gray-400" : "text-white/60"
                          )}
                        >
                          {new Date(msg.created_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
