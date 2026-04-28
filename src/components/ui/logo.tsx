import { cn } from "@/lib/utils/cn";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  className?: string;
}

const sizes = {
  sm: { img: "h-6", text: "text-[18px]" },
  md: { img: "h-8", text: "text-[24px]" },
  lg: { img: "h-12", text: "text-[40px]" },
};

export function Logo({ size = "md", variant = "dark", className }: LogoProps) {
  const s = sizes[size];

  if (variant === "light") {
    return (
      <div className={cn("leading-none", className)}>
        <img
          src="/logo-clinpro-white.png"
          alt="clinpro"
          className={cn(s.img, "w-auto")}
        />
      </div>
    );
  }

  return (
    <div className={cn("font-[var(--font-montserrat)] leading-none", className)}>
      <span className={cn(s.text, "font-extrabold tracking-[-0.03em]")}>
        <span className="text-ink">clin</span>
        <span className="text-brand-600">pro</span>
      </span>
    </div>
  );
}
