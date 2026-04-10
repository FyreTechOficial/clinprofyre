"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Building2, Users, Sparkles } from "lucide-react";

const TABS = [
  {
    label: "Clínica",
    href: "/settings/clinic",
    icon: Building2,
  },
  {
    label: "Usuários",
    href: "/settings/users",
    icon: Users,
  },
  {
    label: "IA",
    href: "/settings/ai",
    icon: Sparkles,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gerencie as configurações da sua clínica
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200 mb-8">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-sm font-medium",
                "border-b-2 transition-all duration-200",
                "-mb-px",
                isActive
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
