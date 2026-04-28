"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Building2, Users, Sparkles, Settings } from "lucide-react";

const TABS = [
  { label: "Clínica", href: "/settings/clinic", icon: Building2 },
  { label: "Usuários", href: "/settings/users", icon: Users },
  { label: "IA", href: "/settings/ai", icon: Sparkles },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[21px] font-semibold text-ink tracking-tight">Configurações</h1>
        <p className="text-[14px] text-ink-secondary mt-0.5">Gerencie as configurações da sua clínica</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-8 bg-parchment rounded-full p-1 w-fit">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-5 py-2 text-[13px] font-medium rounded-full transition-all duration-200",
                isActive
                  ? "brand-gradient text-white"
                  : "text-ink-secondary hover:text-ink hover:bg-canvas"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
