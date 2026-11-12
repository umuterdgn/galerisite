import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "gold" | "navy" | "outline" | "success" | "staged";
}

export function Badge({
  className,
  variant = "gold",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    gold: "border-gold-500/30 bg-gold-500/10 text-gold-400 shadow-gold-sm",
    navy: "border-navy-500/40 bg-navy-900/60 text-navy-200",
    outline: "border-border bg-card/60 text-foreground",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    staged: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

