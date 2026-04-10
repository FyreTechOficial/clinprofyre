"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
}

interface AuthContextType {
  user: AuthUser | null;
  tenant: Tenant | null;
  tenantId: string;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tenant: null,
  tenantId: "",
  isAdmin: false,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
    }
    load();
  }, []);

  const isAdmin = user?.role === "super_admin";
  const tenantId = user?.tenant_id ?? tenant?.id ?? "";

  return (
    <AuthContext.Provider value={{ user, tenant, tenantId, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
