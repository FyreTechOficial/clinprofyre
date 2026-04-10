"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronDown, Settings, LogOut, Flame, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pipeline": "Pipeline",
  "/contacts": "Contatos",
  "/whatsapp": "WhatsApp",
  "/appointments": "Agenda",
  "/agents": "Agentes IA",
  "/reports": "Relatórios",
  "/clin-ia": "Clin.IA",
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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hotLeads, setHotLeads] = useState<HotLead[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Poll for hot leads
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

  return (
    <header className={cn("sticky top-0 z-20 flex h-16 items-center justify-between gap-4 px-6", "bg-white/80 backdrop-blur-md border-b border-gray-100/80")}>
      <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar..." className={cn("h-9 w-56 rounded-xl border border-gray-200 bg-gray-50/80 pl-9 pr-4 text-sm", "placeholder:text-gray-400 transition-all duration-200", "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 focus:w-72 focus:bg-white")} />
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className={cn("relative rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-150")}
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            {hotLeads.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {hotLeads.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className={cn("absolute right-0 mt-2 w-80 rounded-xl border border-gray-100 bg-white shadow-lg animate-slide-up origin-top-right")}>
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-bold text-gray-900">Notificações</p>
                <div className="flex items-center gap-2">
                  {hotLeads.length > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                      {hotLeads.length}
                    </span>
                  )}
                  {hotLeads.length > 0 && (
                    <button onClick={() => { setHotLeads([]); setNotifOpen(false); }} className="text-xs text-gray-400 hover:text-gray-600">
                      Limpar
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {hotLeads.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">Sem notificações</p>
                ) : (
                  hotLeads.map((lead) => (
                    <div key={lead.id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-red-50/50 transition-colors cursor-pointer">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                        <Flame className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{lead.name || lead.phone}</p>
                        <p className="text-xs text-gray-500">{lead.procedure_interest || "Interesse geral"}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
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
          <button onClick={() => setDropdownOpen((v) => !v)} className={cn("flex items-center gap-2 rounded-xl p-1.5 pr-3 hover:bg-gray-100 transition-colors duration-150")}>
            <Avatar src={user?.avatar} name={user?.name ?? "Usuario"} size="sm" />
            <span className="hidden text-sm font-medium text-gray-700 md:block">{user?.name ?? "Usuario"}</span>
            <ChevronDown className={cn("hidden h-4 w-4 text-gray-400 transition-transform duration-200 md:block", dropdownOpen && "rotate-180")} />
          </button>

          {dropdownOpen && (
            <div className={cn("absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-1 shadow-lg animate-slide-up origin-top-right")}>
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-medium text-gray-900">{user?.name ?? "Usuario"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email ?? ""}</p>
              </div>
              <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings className="h-4 w-4 text-gray-400" /> Configurações
              </button>
              <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="h-4 w-4 text-red-400" /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
