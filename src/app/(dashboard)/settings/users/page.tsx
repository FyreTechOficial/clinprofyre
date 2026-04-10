"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Users, UserPlus, Trash2, AlertCircle, X } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "admin" | "profissional" | "recepcionista";
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  profissional: "Profissional",
  recepcionista: "Recepcionista",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  profissional: "bg-blue-100 text-blue-700",
  recepcionista: "bg-amber-100 text-amber-700",
};

const SAMPLE_USERS: UserItem[] = [
  {
    id: "1",
    name: "Dr. Maria Silva",
    email: "maria@clinica.com",
    role: "admin",
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao@clinica.com",
    role: "profissional",
  },
  {
    id: "3",
    name: "Ana Costa",
    email: "ana@clinica.com",
    role: "recepcionista",
  },
];

export default function UsersSettingsPage() {
  const [users, setUsers] = useState<UserItem[]>(SAMPLE_USERS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("profissional");

  function handleRemove(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    console.log("Invite:", { email: inviteEmail, role: inviteRole });
    setShowInvite(false);
    setInviteEmail("");
  }

  const isAtLimit = users.length >= 3;

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Gerenciar Usuários
            </h2>
            <p className="text-sm text-gray-500">
              Gerencie quem tem acesso à sua clínica
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          disabled={isAtLimit}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium text-white text-sm",
            "bg-purple-600 hover:bg-purple-500",
            "shadow-md shadow-purple-200",
            "transition-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "active:scale-[0.98]",
            "flex items-center gap-2"
          )}
        >
          <UserPlus className="w-4 h-4" />
          Convidar Usuário
        </button>
      </div>

      {/* Limit notice */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 mb-6">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <p className="text-sm text-amber-700">
          Máximo <strong>3 usuários</strong> por clínica.{" "}
          {isAtLimit
            ? "Limite atingido."
            : `${3 - users.length} vaga(s) disponível(is).`}
        </p>
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                E-mail
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Função
              </th>
              <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr
                key={user.id}
                className={cn(
                  "transition-colors hover:bg-gray-50",
                  i < users.length - 1 && "border-b border-gray-100"
                )}
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">
                    {user.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{user.email}</span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex px-2.5 py-1 rounded-lg text-xs font-medium",
                      ROLE_COLORS[user.role]
                    )}
                  >
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => handleRemove(user.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Convidar Usuário
              </h3>
              <button
                onClick={() => setShowInvite(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl",
                    "bg-white border border-gray-200",
                    "text-gray-800 placeholder-gray-400 text-sm",
                    "outline-none transition-all duration-200",
                    "focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Função
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl",
                    "bg-white border border-gray-200",
                    "text-gray-800 text-sm",
                    "outline-none transition-all duration-200",
                    "focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                  )}
                >
                  <option value="profissional">Profissional</option>
                  <option value="recepcionista">Recepcionista</option>
                </select>
              </div>
              <button
                type="submit"
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-white text-sm",
                  "bg-purple-600 hover:bg-purple-500",
                  "shadow-md shadow-purple-200",
                  "transition-all duration-200",
                  "active:scale-[0.98]"
                )}
              >
                Enviar Convite
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
