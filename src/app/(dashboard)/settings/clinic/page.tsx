"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { Building2, Upload, Loader2, ImageIcon } from "lucide-react";

export default function ClinicSettingsPage() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    workingHours: "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    console.log("Saving clinic settings:", form);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
  }

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dados da Clínica</h2>
          <p className="text-sm text-gray-500">
            Configure as informações gerais da sua clínica
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {/* Logo upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo da Clínica
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8",
              "flex flex-col items-center justify-center gap-3",
              "transition-all duration-200 cursor-pointer",
              isDragging
                ? "border-purple-400 bg-purple-50"
                : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
            )}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="w-24 h-24 object-contain rounded-lg"
              />
            ) : (
              <>
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-7 h-7 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    <span className="text-purple-600 font-medium">
                      Clique para enviar
                    </span>{" "}
                    ou arraste e solte
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG ou SVG (máx. 2MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Clinic name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nome da Clínica
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Ex: Clínica Beleza & Saúde"
            className={cn(
              "w-full px-4 py-3 rounded-xl",
              "bg-white border border-gray-200",
              "text-gray-800 placeholder-gray-400 text-sm",
              "outline-none transition-all duration-200",
              "focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            )}
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Endereço
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Rua, número, bairro, cidade - UF"
            className={cn(
              "w-full px-4 py-3 rounded-xl",
              "bg-white border border-gray-200",
              "text-gray-800 placeholder-gray-400 text-sm",
              "outline-none transition-all duration-200",
              "focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            )}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Telefone / WhatsApp
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="(11) 99999-9999"
            className={cn(
              "w-full px-4 py-3 rounded-xl",
              "bg-white border border-gray-200",
              "text-gray-800 placeholder-gray-400 text-sm",
              "outline-none transition-all duration-200",
              "focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            )}
          />
        </div>

        {/* Working hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Horário de Funcionamento
          </label>
          <input
            type="text"
            value={form.workingHours}
            onChange={(e) => updateField("workingHours", e.target.value)}
            placeholder="Ex: Seg-Sex 08:00-18:00, Sáb 08:00-12:00"
            className={cn(
              "w-full px-4 py-3 rounded-xl",
              "bg-white border border-gray-200",
              "text-gray-800 placeholder-gray-400 text-sm",
              "outline-none transition-all duration-200",
              "focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            )}
          />
        </div>

        {/* Save */}
        <button
          type="submit"
          disabled={isSaving}
          className={cn(
            "px-8 py-3 rounded-xl font-semibold text-white text-sm",
            "bg-purple-600 hover:bg-purple-500",
            "shadow-md shadow-purple-200",
            "transition-all duration-200",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            "active:scale-[0.98]",
            "flex items-center gap-2"
          )}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Salvar Alterações
            </>
          )}
        </button>
      </form>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
