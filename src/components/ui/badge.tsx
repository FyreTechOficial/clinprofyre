import React, { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const variantStyles = {
  default: "bg-brand-50 text-brand-700 ring-brand-200/60",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  warning: "bg-amber-50 text-amber-700 ring-amber-200/60",
  danger: "bg-red-50 text-red-700 ring-red-200/60",
  info: "bg-blue-50 text-blue-700 ring-blue-200/60",
  neutral: "bg-parchment text-ink-secondary ring-hairline/60",
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
        "text-[12px] font-medium ring-1 ring-inset",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current opacity-60"
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
export default Badge;
