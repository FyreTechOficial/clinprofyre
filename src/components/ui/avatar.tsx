"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";

const sizeStyles = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-[13px]",
  lg: "h-14 w-14 text-[15px]",
} as const;

type AvatarSize = keyof typeof sizeStyles;

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function Avatar({ src, alt, name, size = "md", className }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;
  const initials = name ? getInitials(name) : "?";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full",
        "brand-gradient text-white font-semibold",
        "ring-2 ring-canvas",
        "overflow-hidden",
        sizeStyles[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? name ?? "Avatar"}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-label={name ?? "Avatar"}>{initials}</span>
      )}
    </span>
  );
}

export { Avatar, type AvatarProps, type AvatarSize };
export default Avatar;
