"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Topbar from "@/components/layout/topbar";
import DockNav from "@/components/layout/dock";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-parchment">
        <div className="text-center">
          <Loader2 className="h-6 w-6 text-brand-700 animate-spin mx-auto mb-3" />
          <p className="text-[14px] text-ink-tertiary">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-parchment">
      <Topbar user={user} />
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 py-6 lg:px-8">
          {children}
        </div>
      </main>
      <DockNav isAdmin={isAdmin} />
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
