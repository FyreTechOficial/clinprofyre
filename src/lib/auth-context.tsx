"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenant_id: string | null;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  evolution_instance: string;
  owner_phone: string;
  phone?: string;
  address?: string;
  working_hours?: string;
  alert_group_id?: string;
  alert_group_name?: string;
  logo_url?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  tenant: Tenant | null;
  tenantId: string;
  isAdmin: boolean;
  loading: boolean;
  refreshTenant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tenant: null,
  tenantId: "",
  isAdmin: false,
  loading: true,
  refreshTenant: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setTenant(data.tenant);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refreshTenant = useCallback(async () => {
    await load();
  }, [load]);

  const isAdmin = user?.role === "super_admin";
  const tenantId = user?.tenant_id ?? tenant?.id ?? "";

  return (
    <AuthContext.Provider value={{ user, tenant, tenantId, isAdmin, loading, refreshTenant }}>
      {children}
    </AuthContext.Provider>
  );
}
