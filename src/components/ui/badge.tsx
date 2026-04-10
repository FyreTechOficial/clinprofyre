import React, { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const variantStyles = {
  default: "bg-brand-100 text-brand-700 ring-brand-200",
  success: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-100 text-amber-700 ring-amber-200",
  danger: "bg-red-100 text-red-700 ring-red-200",
  info: "bg-blue-100 text-blue-700 ring-blue-200",
  neutral: "bg-gray-100 text-gray-700 ring-gray-200",
} as const;

type BadgeVariant = keyof typeof variantStyles;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

function Badge({
  className,
  variant = "default",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5",
        "text-xs font-medium ring-1 ring-inset",
        "transition-colors duration-200",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
export default Badge;
