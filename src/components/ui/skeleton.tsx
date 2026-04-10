import React, { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Render a circle (for avatar placeholders) */
  circle?: boolean;
}

function Skeleton({ className, circle = false, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse bg-gray-200/70 rounded-xl",
        circle && "rounded-full",
        className,
      )}
      {...props}
    />
  );
}

/* Convenience presets */

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3.5", i === lines - 1 ? "w-3/5" : "w-full")}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 bg-white p-6 space-y-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton circle className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCard, type SkeletonProps };
export default Skeleton;
