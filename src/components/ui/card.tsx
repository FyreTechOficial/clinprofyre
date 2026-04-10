import React, { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-white shadow-sm shadow-gray-200/60",
        "border border-gray-100",
        "transition-shadow duration-200 hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  CardHeader                                                         */
/* ------------------------------------------------------------------ */

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-1.5 px-6 pt-6", className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  CardTitle                                                          */
/* ------------------------------------------------------------------ */

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-tight text-gray-900",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  CardContent                                                        */
/* ------------------------------------------------------------------ */

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("px-6 py-4", className)} {...props} />;
}

/* ------------------------------------------------------------------ */
/*  CardFooter                                                         */
/* ------------------------------------------------------------------ */

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center px-6 pb-6 pt-0",
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardContentProps,
  CardFooterProps,
};
