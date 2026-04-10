import { LayoutDashboard, KanbanSquare, Users, Calendar, BarChart3, Sparkles, Settings, MessageCircle, Bot, Shield, HelpCircle } from "lucide-react";

// Items visible to clinic users (tenants)
export const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { label: "Contatos", href: "/contacts", icon: Users },
  { label: "WhatsApp", href: "/whatsapp", icon: MessageCircle },
  { label: "Agenda", href: "/appointments", icon: Calendar },
  { label: "Agentes", href: "/agents", icon: Bot },
  { label: "Relatórios", href: "/reports", icon: BarChart3 },
  { label: "Clin.IA", href: "/clin-ia", icon: Sparkles },
  { label: "Suporte", href: "/suporte", icon: HelpCircle },
  { label: "Configurações", href: "/settings/clinic", icon: Settings },
];

// Items only visible to FYRE admins (operation)
export const adminNavItems = [
  { label: "Admin", href: "/admin", icon: Shield },
];

export const pipelineStages = [
  { id: "lead_novo", label: "Novo", color: "#8b5cf6" },
  { id: "contato", label: "Contato", color: "#6366f1" },
  { id: "qualificado", label: "Qualificado", color: "#3b82f6" },
  { id: "agendado", label: "Agendado", color: "#06b6d4" },
  { id: "atendido", label: "Atendido", color: "#10b981" },
  { id: "retorno", label: "Retorno", color: "#f59e0b" },
  { id: "fidelizado", label: "Fidelizado", color: "#22c55e" },
  { id: "perdido", label: "Perdido", color: "#ef4444" },
];
