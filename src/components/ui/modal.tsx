"use client";

import React, { useEffect, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
} as const;

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className,
  size = "md",
}: ModalProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, handleEsc]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-desc" : undefined}
        className={cn(
          "relative z-10 w-full rounded-2xl bg-white shadow-xl",
          "animate-slide-up",
          "border border-gray-100",
          sizeStyles[size],
          className,
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="px-6 pt-6 pb-2">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-desc" className="mt-1 text-sm text-gray-500">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute right-4 top-4 rounded-lg p-1.5",
            "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          )}
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Body */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export { Modal, type ModalProps };
export default Modal;
