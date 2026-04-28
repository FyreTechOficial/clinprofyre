"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-[21px] font-semibold text-white tracking-tight">
          Bem-vindo de volta
        </h2>
        <p className="text-white/50 text-[14px] mt-1">
          Acesse sua conta para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-[12px] bg-red-500/15 border border-red-400/20 px-4 py-3 text-[14px] text-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[13px] font-medium text-white/70 mb-1.5">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className={cn(
              "w-full px-4 py-3 rounded-[12px]",
              "bg-white/[0.06] border border-white/[0.12]",
              "text-white placeholder-white/30",
              "outline-none transition-all duration-200",
              "focus:border-brand-500/60 focus:bg-white/[0.1] focus:ring-2 focus:ring-brand-500/20",
            )}
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-white/70 mb-1.5">
            Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(
                "w-full px-4 py-3 pr-12 rounded-[12px]",
                "bg-white/[0.06] border border-white/[0.12]",
                "text-white placeholder-white/30",
                "outline-none transition-all duration-200",
                "focus:border-brand-500/60 focus:bg-white/[0.1] focus:ring-2 focus:ring-brand-500/20",
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-3 rounded-full font-medium text-white text-[15px]",
            "brand-gradient hover:brightness-110",
            "transition-all duration-200",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "active:scale-[0.97]",
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
    </div>
  );
}
