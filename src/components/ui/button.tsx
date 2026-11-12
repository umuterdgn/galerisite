"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: "gold" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "gold",
      size = "md",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5",
      md: "px-5 py-2.5 text-sm rounded-xl gap-2",
      lg: "px-7 py-3.5 text-base rounded-xl gap-2.5",
    };

    const variantStyles = {
      gold: "bg-gold-gradient text-obsidian-950 font-semibold shadow-gold-sm hover:shadow-gold-md hover:brightness-105 active:scale-[0.98]",
      secondary:
        "bg-navy-900/80 text-foreground border border-navy-700/60 hover:bg-navy-800 backdrop-blur-md active:scale-[0.98]",
      outline:
        "border border-gold-500/30 text-foreground hover:bg-gold-500/10 hover:border-gold-500/50 backdrop-blur-sm active:scale-[0.98]",
      ghost:
        "text-muted-foreground hover:text-foreground hover:bg-gold-500/10 active:scale-[0.98]",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-500/40 disabled:opacity-50 disabled:pointer-events-none",
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

