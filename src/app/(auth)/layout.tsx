import { cn } from "@/lib/utils/cn";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center",
        "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900",
        "relative overflow-hidden"
      )}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-300/15 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
      </div>

      {/* Logo */}
      <div className="relative z-10 mb-8 text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight">
          Clin<span className="text-purple-200">PRO</span>
        </h1>
        <p className="text-purple-200/70 text-sm mt-1 tracking-widest uppercase">
          Gestão inteligente
        </p>
      </div>

      {/* Glassmorphism card */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md mx-4",
          "bg-white/10 backdrop-blur-xl",
          "border border-white/20",
          "rounded-2xl shadow-2xl shadow-purple-950/40",
          "p-8"
        )}
      >
        {children}
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-purple-200/50 text-xs">
        &copy; {new Date().getFullYear()} ClinPRO. Todos os direitos reservados.
      </p>
    </div>
  );
}
