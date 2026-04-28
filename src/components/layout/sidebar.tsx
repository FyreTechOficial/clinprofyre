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
import { Logo } from "@/components/ui/logo";

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
      <div className="flex h-14 items-center px-4 border-b border-divider/60">
        {!collapsed ? (
          <Logo size="sm" variant="dark" />
        ) : (
          <img src="/icon-clinpro.png" alt="clinpro" className="h-8 w-8 shrink-0" />
        )}
      </div>

      {/* Nav links */}
      <nav className="mt-3 flex-1 space-y-0.5 overflow-y-auto px-3 scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-full px-3 py-2 text-[14px] font-medium",
                "transition-all duration-150 ease-out",
                active
                  ? "brand-gradient text-white"
                  : "text-ink-secondary hover:bg-black/[0.04] hover:text-ink",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors",
                  active ? "text-white" : "text-ink-tertiary group-hover:text-ink-secondary",
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Admin section */}
        {isAdmin && (
          <>
            <div className={cn("my-3 border-t border-divider", collapsed && "mx-1")} />
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold text-ink-tertiary uppercase tracking-wider">
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
                    "group flex items-center gap-3 rounded-full px-3 py-2 text-[14px] font-medium",
                    "transition-all duration-150 ease-out",
                    active
                      ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white"
                      : "text-ink-secondary hover:bg-amber-50 hover:text-amber-700",
                    collapsed && "justify-center px-2",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
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
      <div className="border-t border-divider/60 px-3 py-3">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar src={user?.avatar} name={user?.name ?? "Usuario"} size="sm" />
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-[13px] font-semibold text-ink">{user?.name ?? "Usuario"}</p>
              <p className="truncate text-[11px] text-ink-tertiary">{user?.email ?? ""}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} className="rounded-full p-1.5 text-ink-tertiary hover:bg-red-50 hover:text-red-500 transition-colors" aria-label="Sair">
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
          "h-10 border-t border-divider/60 text-ink-tertiary hover:text-ink hover:bg-parchment",
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
        className="fixed left-4 top-3.5 z-50 rounded-full bg-canvas p-2 shadow-sm border border-divider lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5 text-ink" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-out lg:hidden",
          "bg-canvas border-r border-[var(--glass-border)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3.5 rounded-full p-1.5 text-ink-tertiary hover:text-ink"
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
          "glass border-r border-[var(--glass-border)]",
          "transition-all duration-300 ease-out",
          collapsed ? "lg:w-[72px]" : "lg:w-64",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
