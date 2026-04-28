"use client";

import { cn } from "@/lib/utils/cn";
import { Lock } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function ComingSoon({ title, description, children }: ComingSoonProps) {
  return (
    <div className="relative min-h-[70vh] rounded-[22px] overflow-hidden">
      {/* Blurred background content */}
      <div className="pointer-events-none select-none blur-[6px] opacity-40">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-parchment/60 backdrop-blur-sm z-10">
        <img
          src="/icon-clinpro.png"
          alt="clinpro"
          className="h-12 w-12 mb-6 opacity-30"
        />
        <div className="flex items-center gap-2 mb-3">
          <Lock className="h-4 w-4 text-ink-tertiary" />
          <h2 className="text-[24px] font-bold text-ink tracking-tight">{title}</h2>
        </div>
        <p className="text-[15px] text-ink-secondary max-w-md text-center">
          {description || "Estamos trabalhando nessa funcionalidade. Em breve estará disponível para você."}
        </p>
        <div className="mt-6 rounded-full brand-gradient px-6 py-2.5 text-[13px] font-medium text-white opacity-80">
          Em breve disponível
        </div>
      </div>
    </div>
  );
}
