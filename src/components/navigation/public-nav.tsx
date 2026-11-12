"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Gem, Menu, X, ArrowUpRight, Compass, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";

export function PublicNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-50 border-b border-gold-500/15 bg-background/80 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/40 bg-gradient-to-br from-gold-500/20 via-navy-900 to-obsidian-950 shadow-gold-sm transition-transform duration-300 group-hover:scale-105">
            <Gem className="h-5 w-5 text-gold-400" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-widest text-foreground sm:text-xl">
              {t("brand")}
            </span>
            <span className="ml-1.5 text-[9px] font-bold tracking-widest text-gold-500 uppercase">
              {t("brandSubtitle")}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/#portfoy"
            className="text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:text-gold-400"
          >
            {t("portfolio")}
          </Link>
          <Link
            href="/#off-market"
            className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:text-gold-400"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-gold-500" />
            <span>{t("offMarket")}</span>
          </Link>
          <Link
            href="/#geo-kesif"
            className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:text-gold-400"
          >
            <Compass className="h-3.5 w-3.5 text-gold-500" />
            <span>{t("geo")}</span>
          </Link>
          <Link
            href="/#b2b-ortaklik"
            className="text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:text-gold-400"
          >
            {t("integration")}
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />

          <Link href="/admin" className="hidden sm:inline-flex">
            <Button variant="gold" size="sm">
              <span>{t("b2bPortal")}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground md:hidden"
            aria-label="Menü"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background/95 px-6 py-4 backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/#portfoy"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-sm font-medium text-foreground hover:text-gold-400"
            >
              {t("portfolio")}
            </Link>
            <Link
              href="/#off-market"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-sm font-medium text-foreground hover:text-gold-400"
            >
              {t("offMarket")}
            </Link>
            <Link
              href="/#geo-kesif"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-sm font-medium text-foreground hover:text-gold-400"
            >
              {t("geo")}
            </Link>
            <Link
              href="/#b2b-ortaklik"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 text-sm font-medium text-foreground hover:text-gold-400"
            >
              {t("integration")}
            </Link>
            <div className="pt-2">
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="gold" size="sm" className="w-full">
                  {t("b2bPortal")}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
