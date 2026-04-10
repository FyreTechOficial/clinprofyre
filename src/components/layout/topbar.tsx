"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronDown, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/avatar";

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

export default function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const title = getTitleFromPathname(pathname);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 items-center justify-between gap-4 px-6",
        "bg-white/80 backdrop-blur-md border-b border-gray-100/80",
      )}
    >
      <h1 className="text-xl font-bold text-gray-900 truncate">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className={cn(
              "h-9 w-56 rounded-xl border border-gray-200 bg-gray-50/80 pl-9 pr-4 text-sm",
              "placeholder:text-gray-400",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 focus:w-72 focus:bg-white",
            )}
          />
        </div>

        <button
          className={cn(
            "relative rounded-xl p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700",
            "transition-colors duration-150",
          )}
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white" />
        </button>

        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className={cn(
              "flex items-center gap-2 rounded-xl p-1.5 pr-3",
              "hover:bg-gray-100 transition-colors duration-150",
            )}
          >
            <Avatar
              src={user?.avatar}
              name={user?.name ?? "Usuario"}
              size="sm"
            />
            <span className="hidden text-sm font-medium text-gray-700 md:block">
              {user?.name ?? "Usuario"}
            </span>
            <ChevronDown
              className={cn(
                "hidden h-4 w-4 text-gray-400 transition-transform duration-200 md:block",
                dropdownOpen && "rotate-180",
              )}
            />
          </button>

          {dropdownOpen && (
            <div
              className={cn(
                "absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-1 shadow-lg",
                "animate-slide-up origin-top-right",
              )}
            >
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name ?? "Usuario"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email ?? ""}
                </p>
              </div>

              <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Settings className="h-4 w-4 text-gray-400" />
                Configurações
              </button>
              <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="h-4 w-4 text-red-400" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
