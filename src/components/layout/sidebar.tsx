"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { navItems, adminNavItems } from "@/constants/nav-items";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ user, onCollapsedChange }: SidebarProps) {
  const router = useRouter();
  const isAdmin = user?.role === "super_admin";
  const { tenant } = useAuth();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-gray-100/50">
        {tenant && (tenant as any).logo_url ? (
          <img
            src={(tenant as any).logo_url}
            alt={tenant.name}
            className="h-9 w-9 shrink-0 rounded-xl object-contain"
          />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30">
            CP
          </div>
        )}
        {!collapsed && (
          <span className="text-lg font-bold text-gray-900 tracking-tight whitespace-nowrap">
            {tenant?.name ? tenant.name : (<>Clin<span className="gradient-text">PRO</span></>)}
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto px-3 scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                "transition-all duration-200 ease-out",
                active
                  ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md shadow-brand-600/25"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  active ? "text-white" : "text-gray-400 group-hover:text-gray-600",
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Admin section — only for FYRE operation */}
        {isAdmin && (
          <>
            <div className={cn("my-3 border-t border-gray-100", collapsed && "mx-1")} />
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Operação FYRE
              </p>
            )}
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                    "transition-all duration-200 ease-out",
                    active
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25"
                      : "text-gray-600 hover:bg-amber-50 hover:text-amber-700",
                    collapsed && "justify-center px-2",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      active ? "text-white" : "text-amber-500 group-hover:text-amber-600",
                    )}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom: user info */}
      <div className="border-t border-gray-100/50 px-3 py-4">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar src={user?.avatar} name={user?.name ?? "Usuario"} size="sm" />
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-gray-900">{user?.name ?? "Usuario"}</p>
              <p className="truncate text-xs text-gray-500">{user?.email ?? ""}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => { setCollapsed((v) => { const next = !v; onCollapsedChange?.(next); return next; }); }}
        className={cn(
          "hidden lg:flex items-center justify-center",
          "h-10 border-t border-gray-100/50 text-gray-400 hover:text-gray-600 hover:bg-gray-50",
          "transition-colors duration-150",
        )}
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-white/90 p-2 shadow-md backdrop-blur lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-out lg:hidden",
          "bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-4 rounded-lg p-1.5 text-gray-400 hover:text-gray-600"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30",
          "bg-white/80 backdrop-blur-xl border-r border-gray-200/50",
          "transition-all duration-300 ease-out",
          collapsed ? "lg:w-[72px]" : "lg:w-64",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
