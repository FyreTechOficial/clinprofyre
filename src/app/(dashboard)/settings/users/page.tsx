"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { Users, UserPlus, Trash2, AlertCircle, X, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  profissional: "Profissional",
  recepcionista: "Recepcionista",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-brand-100 text-brand-700",
  admin: "bg-purple-100 text-purple-700",
  profissional: "bg-blue-100 text-blue-700",
  recepcionista: "bg-amber-100 text-amber-700",
};

export default function UsersSettingsPage() {
  const { tenantId } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("profissional");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    fetch(`/api/settings/users?tenant_id=${tenantId}`)
      .then((r) => r.json())
      .then((d) => setUsers(d.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenantId]);

  async function handleRemove(id: string) {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return;
    try {
      const res = await fetch("/api/settings/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id, tenant_id: tenantId }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Usuário removido");
    } catch {
      toast.error("Erro ao remover usuário");
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch("/api/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_id: tenantId, email: inviteEmail, name: inviteName, role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      // Refresh list
      const updated = await fetch(`/api/settings/users?tenant_id=${tenantId}`).then((r) => r.json());
      setUsers(updated.users || []);
      setShowInvite(false);
      setInviteEmail("");
      setInviteName("");
      toast.success(`Usuário criado! Senha temporária: ${data.tempPassword}`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao convidar usuário");
    } finally {
      setInviting(false);
    }
  }

  const isAtLimit = users.length >= 5;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Gerenciar Usuários</h2>
            <p className="text-sm text-ink-secondary">Gerencie quem tem acesso à sua clínica</p>
          </div>
        </div>
        <button onClick={() => setShowInvite(true)} disabled={isAtLimit} className="inline-flex items-center gap-2 rounded-full brand-gradient px-5 py-2.5 text-[13px] font-medium text-white hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50">
          <UserPlus className="w-4 h-4" /> Convidar Usuário
        </button>
      </div>

      {!isAtLimit && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-[12px] bg-amber-50 border border-amber-200 mb-6">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">{5 - users.length} vaga(s) disponível(is).</p>
        </div>
      )}

      <div className="overflow-hidden rounded-[18px] border border-divider bg-canvas">
        <table className="w-full">
          <thead>
            <tr className="border-b border-divider bg-parchment/50">
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider">Nome</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider">E-mail</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider">Função</th>
              <th className="text-right px-6 py-3.5 text-[11px] font-semibold text-ink-tertiary uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-brand-700" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-[14px] text-ink-tertiary">Nenhum usuário encontrado</td></tr>
            ) : (
              users.map((user, i) => (
                <tr key={user.id} className={cn("transition-colors hover:bg-parchment", i < users.length - 1 && "border-b border-divider")}>
                  <td className="px-6 py-4"><span className="text-[14px] font-medium text-ink">{user.name}</span></td>
                  <td className="px-6 py-4"><span className="text-[14px] text-ink-secondary">{user.email}</span></td>
                  <td className="px-6 py-4">
                    <span className={cn("inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold", ROLE_COLORS[user.role] || "bg-parchment text-ink-secondary")}>{ROLE_LABELS[user.role] || user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== "owner" && (
                      <button onClick={() => handleRemove(user.id)} className="p-2 rounded-full text-ink-tertiary hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-canvas rounded-[22px] border border-divider shadow-xl w-full max-w-md mx-4 p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[17px] font-semibold text-ink tracking-tight">Convidar Usuário</h3>
              <button onClick={() => setShowInvite(false)} className="rounded-full p-1.5 hover:bg-parchment text-ink-tertiary"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-ink mb-1.5">Nome</label>
                <input type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Nome do usuário" className="w-full px-4 py-2.5 rounded-[12px] bg-canvas border border-hairline text-[14px] text-ink placeholder:text-ink-tertiary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-ink mb-1.5">E-mail</label>
                <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@exemplo.com" className="w-full px-4 py-2.5 rounded-[12px] bg-canvas border border-hairline text-[14px] text-ink placeholder:text-ink-tertiary outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-ink mb-1.5">Função</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full px-4 py-2.5 rounded-[12px] bg-canvas border border-hairline text-[14px] text-ink outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all">
                  <option value="admin">Administrador</option>
                  <option value="profissional">Profissional</option>
                  <option value="recepcionista">Recepcionista</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowInvite(false)} className="flex-1 rounded-full border border-divider bg-canvas px-4 py-2.5 text-[14px] font-medium text-ink hover:bg-parchment active:scale-[0.97] transition-all">Cancelar</button>
                <button type="submit" disabled={inviting} className="flex-1 rounded-full brand-gradient px-4 py-2.5 text-[14px] font-medium text-white hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50">
                  {inviting ? "Criando..." : "Convidar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
