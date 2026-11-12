"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gem,
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
  Compass,
  MapPin,
  Sparkles,
  ShieldCheck,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import {
  PLATFORM_FEATURES,
  type PlatformFeatureSpec,
} from "@/lib/features-catalog";

function renderFeatureIcon(iconName: PlatformFeatureSpec["iconName"]) {
  switch (iconName) {
    case "compass":
      return <Compass className="h-4 w-4 text-gold-400" />;
    case "map":
      return <MapPin className="h-4 w-4 text-gold-400" />;
    case "sparkles":
      return <Sparkles className="h-4 w-4 text-gold-400" />;
    case "shield":
      return <ShieldCheck className="h-4 w-4 text-gold-400" />;
    case "layers":
      return <Layers className="h-4 w-4 text-gold-400" />;
  }
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname() || "/";
  const t = useTranslations("Nav");

  // Close dropdown and mobile drawer when navigating to another route
  useEffect(() => {
    setFeaturesDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close dropdown on outside pointer click or Escape key
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setFeaturesDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFeaturesDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Lock body scroll when full-screen mobile overlay is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  const openDropdown = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setFeaturesDropdownOpen(true);
  };

  const scheduleCloseDropdown = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setFeaturesDropdownOpen(false);
    }, 140);
  };

  const isCollectionActive =
    pathname === "/properties" || pathname.startsWith("/properties/");
  const isFeatureActive = pathname.startsWith("/features/");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gold-500/15 bg-background/80 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-gold-500/40 bg-gradient-to-br from-gold-500/20 via-navy-900 to-obsidian-950 shadow-gold-sm transition-transform duration-300 group-hover:scale-105">
            <Gem className="h-4 w-4 sm:h-5 sm:w-5 text-gold-400" />
          </div>
          <div>
            <span className="font-serif text-base sm:text-xl font-bold tracking-widest text-foreground">
              {t("brand")}
            </span>
            <span className="ml-1.5 hidden sm:inline text-[9px] font-bold tracking-widest text-gold-500 uppercase">
              {t("brandSubtitle")}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 md:flex">
          {/* Always-visible Portföy Koleksiyonu link */}
          <Link
            href="/properties"
            className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide transition-colors ${
              isCollectionActive
                ? "text-gold-400"
                : "text-foreground/90 hover:text-gold-400"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5 text-gold-500" />
            <span>{t("collection")}</span>
          </Link>

          {/* Platform Özellikleri Dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={openDropdown}
            onMouseLeave={scheduleCloseDropdown}
          >
            <button
              type="button"
              onClick={() => setFeaturesDropdownOpen((prev) => !prev)}
              aria-expanded={featuresDropdownOpen}
              aria-haspopup="menu"
              className={`inline-flex items-center gap-1.5 py-1 text-xs font-medium tracking-wide transition-colors ${
                featuresDropdownOpen || isFeatureActive
                  ? "text-gold-400"
                  : "text-muted-foreground hover:text-gold-400"
              }`}
            >
              <span>{t("features")}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  featuresDropdownOpen ? "rotate-180 text-gold-400" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {featuresDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  role="menu"
                  className="absolute left-1/2 top-full mt-3 w-[380px] -translate-x-1/2 rounded-2xl border border-gold-500/25 bg-background/95 dark:bg-[#090c14]/95 p-2.5 backdrop-blur-2xl shadow-luxury-glass"
                >
                  <div className="px-3 py-1.5 mb-1 border-b border-border/70 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500">
                      Bağımsız Modül Sayfaları
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {PLATFORM_FEATURES.length} Modül
                    </span>
                  </div>

                  <div className="space-y-1">
                    {PLATFORM_FEATURES.map((feature) => {
                      const active = pathname === feature.href;
                      return (
                        <Link
                          key={feature.slug}
                          href={feature.href}
                          onClick={() => setFeaturesDropdownOpen(false)}
                          role="menuitem"
                          className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all ${
                            active
                              ? "border border-gold-500/30 bg-gold-500/10"
                              : "border border-transparent hover:border-gold-500/20 hover:bg-card/80"
                          }`}
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gold-500/30 bg-gold-500/10 group-hover:bg-gold-500/20 transition-colors">
                            {renderFeatureIcon(feature.iconName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-xs font-semibold truncate ${
                                  active
                                    ? "text-gold-400"
                                    : "text-foreground group-hover:text-gold-400"
                                }`}
                              >
                                {feature.title}
                              </span>
                              <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-gold-400" />
                            </div>
                            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground line-clamp-1">
                              {feature.shortDesc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/#b2b-ortaklik"
            className="text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:text-gold-400"
          >
            {t("integration")}
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Always visible quick Collection link on mobile viewports too */}
          <Link
            href="/properties"
            className={`md:hidden inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
              isCollectionActive
                ? "border-gold-500/50 bg-gold-500/15 text-gold-400"
                : "border-gold-500/25 bg-card/60 text-foreground hover:border-gold-500/45 hover:text-gold-400"
            }`}
          >
            <LayoutGrid className="h-3 w-3 text-gold-400" />
            <span>{t("collectionShort")}</span>
          </Link>

          <LanguageSwitcher />
          <ThemeToggle />

          <Link href="/admin/login" className="hidden sm:inline-flex">
            <Button variant="gold" size="sm">
              <span>{t("b2bPortal")}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/25 bg-card/70 text-foreground hover:border-gold-500/50 hover:text-gold-400 transition-colors md:hidden"
            aria-label={mobileMenuOpen ? "Menüyü Kapat" : "Menüyü Aç"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-gold-400" />
            ) : (
              <Menu className="h-5 w-5 text-gold-400" />
            )}
          </button>
        </div>
      </div>
    </header>

      {/* Luxury Full-Screen Mobile Overlay Menu (Obsidian & Gold) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex flex-col bg-[#05060a]/98 text-white backdrop-blur-2xl md:hidden overflow-y-auto"
          >
            {/* Subtle Gold & Navy Ambient Glow inside Fullscreen Overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none fixed inset-0 overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold-500/15 blur-[110px]" />
              <div className="absolute bottom-0 -left-24 h-72 w-72 rounded-full bg-navy-800/40 blur-[120px]" />
            </div>

            {/* Overlay Top Bar */}
            <div className="relative z-10 flex items-center justify-between border-b border-gold-500/20 px-5 py-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/40 bg-gradient-to-br from-gold-500/25 via-navy-900 to-obsidian-950 shadow-gold-sm">
                  <Gem className="h-4 w-4 text-gold-400" />
                </div>
                <div>
                  <span className="font-serif text-lg font-bold tracking-widest text-white">
                    {t("brand")}
                  </span>
                  <span className="ml-1.5 text-[9px] font-bold tracking-widest text-gold-400 uppercase">
                    {t("brandSubtitle")}
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/35 bg-white/5 text-gold-400 hover:bg-gold-500/15 transition-colors"
                aria-label="Menüyü Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="relative z-10 flex-1 space-y-2.5 px-5 py-6">
              <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-gold-500/80">
                Keşif &amp; Koleksiyon
              </p>

              <Link
                href="/#vitrin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-base font-serif font-semibold text-white hover:border-gold-500/40 hover:text-gold-300 transition-colors"
              >
                <span>{t("portfolio")}</span>
                <ArrowUpRight className="h-4 w-4 text-gold-400" />
              </Link>

              <Link
                href="/properties"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-base font-serif font-semibold transition-colors ${
                  isCollectionActive
                    ? "border-gold-500/50 bg-gold-500/15 text-gold-300 shadow-gold-sm"
                    : "border-white/10 bg-white/[0.03] text-white hover:border-gold-500/40 hover:text-gold-300"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <LayoutGrid className="h-4 w-4 text-gold-400" />
                  <span>{t("collection")}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-gold-400" />
              </Link>

              {/* Platform Özellikleri Accordion */}
              <div className="rounded-2xl border border-gold-500/25 bg-white/[0.03] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileFeaturesOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-base font-serif font-semibold text-white"
                >
                  <span className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-gold-400" />
                    <span>{t("features")}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gold-400 transition-transform duration-200 ${
                      mobileFeaturesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {mobileFeaturesOpen && (
                  <div className="border-t border-gold-500/15 px-3 py-2.5 space-y-1.5">
                    {PLATFORM_FEATURES.map((feature) => (
                      <Link
                        key={feature.slug}
                        href={feature.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          pathname === feature.href
                            ? "border border-gold-500/35 bg-gold-500/15 text-gold-300"
                            : "text-zinc-300 hover:bg-white/5 hover:text-gold-300"
                        }`}
                      >
                        {renderFeatureIcon(feature.iconName)}
                        <span>{feature.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/#off-market"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-base font-serif font-semibold text-white hover:border-gold-500/40 hover:text-gold-300 transition-colors"
              >
                <span>{t("offMarket")}</span>
                <ArrowUpRight className="h-4 w-4 text-gold-400" />
              </Link>

              <Link
                href="/#geo-kesif"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-base font-serif font-semibold text-white hover:border-gold-500/40 hover:text-gold-300 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-gold-400" />
                  <span>{t("geo")}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-gold-400" />
              </Link>

              <Link
                href="/#b2b-ortaklik"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-base font-serif font-semibold text-white hover:border-gold-500/40 hover:text-gold-300 transition-colors"
              >
                <span>{t("integration")}</span>
                <ArrowUpRight className="h-4 w-4 text-gold-400" />
              </Link>
            </nav>

            {/* Bottom Controls & Portal Entry CTA */}
            <div className="relative z-10 mt-auto border-t border-gold-500/20 bg-[#080a10]/95 px-5 py-5 space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
                <span className="text-xs font-medium text-zinc-400">
                  Dil &amp; Tema Tercihi
                </span>
                <div className="flex items-center gap-2.5">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
              </div>

              <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="gold" size="lg" className="w-full justify-center gap-2 text-sm font-bold">
                  <span>{t("b2bPortal")}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

