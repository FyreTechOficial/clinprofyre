import { createAdminClient } from "@/lib/supabase/server";

export function getEvolutionConfig() {
  return {
    url: process.env.EVOLUTION_API_URL!,
    key: process.env.EVOLUTION_API_KEY!,
  };
}

export async function resolveInstance(tenantId?: string | null): Promise<string | null> {
  if (tenantId) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("tenants")
      .select("evolution_instance")
      .eq("id", tenantId)
      .limit(1)
      .single();
    if (data?.evolution_instance) return data.evolution_instance;
  }
  // Fallback to env var for backwards compat
  return process.env.EVOLUTION_INSTANCE || null;
}
