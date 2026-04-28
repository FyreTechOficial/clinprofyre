"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronDown, Settings, LogOut, Flame, X, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/use-theme";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pipeline": "Pipeline",
  "/contacts": "Contatos",
  "/whatsapp": "WhatsApp",
  "/appointments": "Agenda",
  "/agents": "Agentes IA",
  "/reports": "Relatórios",
  "/clin-ia": "Clin.IA",
  "/suporte": "Suporte",
  "/settings": "Configurações",
  "/admin": "Admin",
  "/teste-agentes": "Teste de Agentes",
};

function getTitleFromPathname(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const base = "/" + pathname.split("/").filter(Boolean)[0];
  return pageTitles[base] ?? "ClinPRO";
}

interface TopbarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

interface HotLead {
  id: string;
  name: string;
  phone: string;
  procedure_interest: string | null;
  last_interaction: string;
}

export default function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const title = getTitleFromPathname(pathname);
  const { tenantId } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const [dismissedAt, setDismissedAt] = useState<string | null>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("clinpro_notif_dismissed");
    return null;
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    async function fetchNotifs() {
      try {
        const res = await fetch(`/api/notifications?tenant_id=${tenantId}`);
        const data = await res.json();
        setHotLeads(data.hotLeads ?? []);
      } catch {}
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [tenantId]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const visibleLeads = dismissedAt
    ? hotLeads.filter((lead) => new Date(lead.last_interaction) > new Date(dismissedAt))
    : hotLeads;

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 px-6 glass border-b border-[var(--glass-border)]">
      <div className="flex items-center gap-3">
        <img src={isDark ? "/icon-clinpro.png" : "/icon-clinpro-light.png"} alt="clinpro" className="h-6 w-6" />
        <h1 className="text-[17px] font-semibold text-ink tracking-tight truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
          <input
            type="text"
            placeholder="Buscar..."
            className={cn(
              "h-9 w-52 rounded-full border border-divider bg-parchment pl-9 pr-4 text-[14px]",
              "placeholder:text-ink-tertiary transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:w-72 focus:bg-canvas",
            )}
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-ink-secondary hover:bg-parchment transition-colors duration-150"
          aria-label="Alternar tema"
        >
          {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-full p-2 text-ink-secondary hover:bg-parchment transition-colors duration-150"
            aria-label="Notificações"
          >
            <Bell className="h-[18px] w-[18px]" />
            {visibleLeads.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-canvas">
                {visibleLeads.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-[18px] border border-divider bg-canvas shadow-lg shadow-black/8 animate-slide-up origin-top-right">
              <div className="flex items-center justify-between border-b border-divider px-4 py-3">
                <p className="text-[14px] font-semibold text-ink">Notificações</p>
                <div className="flex items-center gap-2">
                  {visibleLeads.length > 0 && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                      {visibleLeads.length}
                    </span>
                  )}
                  {visibleLeads.length > 0 && (
                    <button onClick={() => { const now = new Date().toISOString(); setDismissedAt(now); localStorage.setItem("clinpro_notif_dismissed", now); setNotifOpen(false); }} className="text-[12px] text-ink-tertiary hover:text-ink">
                      Limpar
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {visibleLeads.length === 0 ? (
                  <p className="px-4 py-6 text-center text-[14px] text-ink-tertiary">Sem notificações</p>
                ) : (
                  visibleLeads.map((lead) => (
                    <div key={lead.id} className="flex items-start gap-3 px-4 py-3 border-b border-divider/50 hover:bg-parchment transition-colors cursor-pointer">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <Flame className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-ink">{lead.name || lead.phone}</p>
                        <p className="text-[12px] text-ink-secondary">{lead.procedure_interest || "Interesse geral"}</p>
                        <p className="text-[10px] text-ink-tertiary mt-0.5">
                          {new Date(lead.last_interaction).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User dropdown */}
        <div ref={dropdownRef} className="relative">
          <button onClick={() => setDropdownOpen((v) => !v)} className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-parchment transition-colors duration-150">
            <Avatar src={user?.avatar} name={user?.name ?? "Usuario"} size="sm" />
            <span className="hidden text-[13px] font-medium text-ink md:block">{user?.name ?? "Usuario"}</span>
            <ChevronDown className={cn("hidden h-3.5 w-3.5 text-ink-tertiary transition-transform duration-200 md:block", dropdownOpen && "rotate-180")} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-[18px] border border-divider bg-canvas py-1 shadow-lg shadow-black/8 animate-slide-up origin-top-right">
              <div className="border-b border-divider px-4 py-3">
                <p className="text-[13px] font-semibold text-ink">{user?.name ?? "Usuario"}</p>
                <p className="text-[12px] text-ink-tertiary truncate">{user?.email ?? ""}</p>
              </div>
              <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[14px] text-ink-secondary hover:bg-parchment transition-colors">
                <Settings className="h-4 w-4 text-ink-tertiary" /> Configurações
              </button>
              <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[14px] text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="h-4 w-4 text-red-400" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
