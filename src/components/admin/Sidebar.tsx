"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Gem,
  LayoutDashboard,
  TrendingUp,
  Building2,
  CalendarCheck,
  Sparkles,
  Compass,
  Globe,
  Users,
  Settings,
  ArrowLeft,
  Shield,
  Crown,
  LogOut,
  X,
} from "lucide-react";
import { Role } from "@prisma/client";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  accentColor?: string;
}

export const ADMIN_NAV_ITEMS: SidebarNavItem[] = [
  {
    label: "Genel Bakış (Konsol)",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Trafik & Pazarlama Kokpiti",
    href: "/admin/dashboard/analytics",
    icon: TrendingUp,
    accentColor: "text-gold-400",
  },
  {
    label: "Portföy Yönetimi",
    href: "/admin/dashboard/portfolio",
    icon: Building2,
  },
  {
    label: "VIP Randevu Takvimi",
    href: "/admin/dashboard/appointments",
    icon: CalendarCheck,
    accentColor: "text-emerald-400",
  },
  {
    label: "AI Virtual Staging Studio",
    href: "/admin/dashboard/ai-staging",
    icon: Sparkles,
    accentColor: "text-purple-400",
  },
  {
    label: "360° Tour Builder",
    href: "/admin/dashboard/tour-builder",
    icon: Compass,
    accentColor: "text-gold-400",
  },
  {
    label: "AI SEO & GEO Optimizer",
    href: "/admin/dashboard/seo-optimizer",
    icon: Globe,
    accentColor: "text-emerald-400",
  },
  {
    label: "Ekip & Broker Yönetimi",
    href: "/admin/dashboard/team",
    icon: Users,
    accentColor: "text-gold-400",
  },
];

const SETTINGS_NAV_ITEM: SidebarNavItem = {
  label: "Ajans Ayarları & Tema",
  href: "/admin/dashboard/settings",
  icon: Settings,
};

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname() || "";
  const { data: session } = useSession();

  // Strip /tr or /en locale prefix for uniform active route matching
  const normalizedPath = pathname.replace(/^\/(tr|en)(?=\/|$)/, "") || "/";

  const agencyName = session?.user?.agencyName || "Lumière Prime Estates";
  const agencyId = session?.user?.agencyId || "prime-01";
  const isSuperAdmin = session?.user?.role === Role.SUPERADMIN;

  const isItemActive = (item: SidebarNavItem) => {
    if (item.exact) {
      return (
        normalizedPath === item.href ||
        normalizedPath === `${item.href}/` ||
        normalizedPath === "/admin" ||
        normalizedPath === "/dashboard"
      );
    }
    const adminPrefixed = item.href.startsWith("/super-admin")
      ? `/admin${item.href}`
      : item.href;
    const subSegment = item.href.replace("/admin/dashboard", "/dashboard");
    return (
      normalizedPath === item.href ||
      normalizedPath.startsWith(`${item.href}/`) ||
      normalizedPath === adminPrefixed ||
      normalizedPath.startsWith(`${adminPrefixed}/`) ||
      normalizedPath === subSegment ||
      normalizedPath.startsWith(`${subSegment}/`)
    );
  };

  const navContent = (
    <div className="flex h-full min-h-0 flex-col">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/40 bg-gold-gradient shadow-gold-sm">
            <Gem className="h-4 w-4 text-obsidian-950" />
          </div>
          <div>
            <span className="font-serif text-base font-bold tracking-wider text-foreground">
              LUMIÈRE
            </span>
            <span className="ml-1 text-[9px] font-bold tracking-widest text-gold-500 uppercase">
              B2B SAAS
            </span>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
            aria-label="Menüyü Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tenant Indicator */}
      <div className="mx-4 my-4 shrink-0 rounded-xl border border-gold-500/20 bg-gold-500/5 p-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-gold-500 shrink-0" />
          <div className="truncate">
            <p className="text-xs font-semibold text-foreground truncate">
              {agencyName}
            </p>
            <p className="text-[10px] text-gold-400/80 uppercase tracking-wider truncate">
              Tenant ID: #{agencyId}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {isSuperAdmin && (
          <div className="mb-3 border-b border-border/70 pb-3">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-gold-500">
              Super Admin Master
            </p>
            <Link
              href="/super-admin/agencies"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs transition-all duration-200 ${
                normalizedPath.startsWith("/super-admin") ||
                normalizedPath.startsWith("/admin/super-admin")
                  ? "bg-gold-500/15 font-semibold text-gold-400 border border-gold-500/30 shadow-gold-sm"
                  : "font-medium text-muted-foreground border border-transparent hover:bg-card hover:text-foreground hover:border-border/60"
              }`}
            >
              <Crown className="h-4 w-4 shrink-0 text-gold-400" />
              <span className="truncate">Ajans &amp; Tenant Yönetimi</span>
            </Link>
          </div>
        )}

        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs transition-all duration-200 ${
                active
                  ? "bg-gold-500/15 font-semibold text-gold-400 border border-gold-500/30 shadow-gold-sm"
                  : "font-medium text-muted-foreground border border-transparent hover:bg-card hover:text-foreground hover:border-border/60"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  active ? "text-gold-400" : item.accentColor || ""
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Unconditional Fixed Bottom Settings, Exit & Sign Out */}
      <div className="mt-auto shrink-0 border-t border-border bg-card/80 p-3 space-y-1.5">
        <Link
          href={SETTINGS_NAV_ITEM.href}
          onClick={onCloseMobile}
          className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs transition-all duration-200 ${
            isItemActive(SETTINGS_NAV_ITEM)
              ? "bg-gold-500/15 font-semibold text-gold-400 border border-gold-500/30 shadow-gold-sm"
              : "font-medium text-muted-foreground border border-transparent hover:bg-card hover:text-foreground hover:border-border/60"
          }`}
        >
          <Settings
            className={`h-4 w-4 shrink-0 ${
              isItemActive(SETTINGS_NAV_ITEM) ? "text-gold-400" : ""
            }`}
          />
          <span className="truncate">{SETTINGS_NAV_ITEM.label}</span>
        </Link>

        <div className="border-t border-border/60 pt-2 px-2 space-y-2">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-gold-400"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            <span>Vitrini Görüntüle</span>
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span>Güvenli Çıkış Yap</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/60 backdrop-blur-xl md:sticky md:top-0 md:flex md:h-screen">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r border-gold-500/30 bg-[#06070a]/95 backdrop-blur-2xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}

