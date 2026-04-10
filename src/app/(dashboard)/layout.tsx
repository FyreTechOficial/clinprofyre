"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-brand-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50/50">
      <Sidebar user={user} />
      <div className={cn("flex flex-1 flex-col transition-all duration-300", "lg:ml-64")}>
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Clin.IA FAB */}
      <Link
        href="/clin-ia"
        title="Clin.IA"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-300/40 transition-transform duration-200 hover:scale-110"
      >
        <Sparkles className="h-6 w-6" />
      </Link>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardInner>{children}</DashboardInner>
    </AuthProvider>
  );
}
