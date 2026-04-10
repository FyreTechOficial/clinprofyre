"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsLoading(true);
    setError("");

    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email ou senha incorretos"
          : authError.message
      );
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="animate-[fadeInUp_0.6s_ease-out]">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-300" />
          <span className="text-purple-200 text-sm font-medium">
            ClinPRO AI
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white">Bem-vindo de volta</h2>
        <p className="text-purple-200/70 text-sm mt-1">
          Acesse sua conta para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-red-500/20 border border-red-400/30 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-purple-100 mb-1.5">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className={cn(
              "w-full px-4 py-3 rounded-xl",
              "bg-white/10 border border-white/20",
              "text-white placeholder-purple-300/50",
              "outline-none transition-all duration-200",
              "focus:border-purple-300 focus:bg-white/15 focus:ring-2 focus:ring-purple-300/20",
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-100 mb-1.5">
            Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(
                "w-full px-4 py-3 pr-12 rounded-xl",
                "bg-white/10 border border-white/20",
                "text-white placeholder-purple-300/50",
                "outline-none transition-all duration-200",
                "focus:border-purple-300 focus:bg-white/15 focus:ring-2 focus:ring-purple-300/20",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/60 hover:text-purple-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-3 rounded-xl font-semibold text-white",
            "bg-purple-500 hover:bg-purple-400",
            "border border-purple-400/30",
            "shadow-lg shadow-purple-900/30",
            "transition-all duration-200",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            "active:scale-[0.98]",
            "flex items-center justify-center gap-2",
          )}
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Entrando...</>
          ) : (
            "Entrar"
          )}
        </button>
      </form>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
