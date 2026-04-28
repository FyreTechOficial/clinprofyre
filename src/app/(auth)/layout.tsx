"use client";

import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/ui/logo";
import GradientBlinds from "@/components/ui/gradient-blinds";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center",
        "bg-ink",
        "relative overflow-hidden"
      )}
    >
      {/* Animated gradient background */}
      <GradientBlinds
        gradientColors={["#3b0764", "#7c3aed", "#9333ea"]}
        angle={45}
        noise={0.15}
        blindCount={10}
        blindMinWidth={80}
        spotlightRadius={0.6}
        spotlightSoftness={1.2}
        spotlightOpacity={0.8}
        mouseDampening={0.2}
        distortAmount={0}
        shineDirection="left"
        mixBlendMode="normal"
      />

      {/* Logo */}
      <div className="relative z-10 mb-10 text-center">
        <Logo size="lg" variant="light" className="inline-block" />
      </div>

      {/* Card */}
      <div
        className={cn(
          "relative z-10 w-full max-w-[420px] mx-4",
          "bg-white/[0.06] backdrop-blur-2xl",
          "border border-white/[0.1]",
          "rounded-[22px]",
          "p-8"
        )}
      >
        {children}
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-white/30 text-[12px]">
        &copy; {new Date().getFullYear()} ClinPRO. Todos os direitos reservados.
      </p>
    </div>
  );
}
