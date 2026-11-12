"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "./card";

export interface StatCardProps {
  label: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  trend?: string;
}

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
}: StatCardProps) {
  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="font-serif text-3xl font-extrabold text-foreground">
          {value}
        </div>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {trend && (
              <span className="font-semibold text-emerald-400">{trend}</span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}
