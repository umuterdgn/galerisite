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
    <header className="sticky top-0 z-50 border-b border-gold-500/15 bg-background/80 backdrop-blur-xl transition-colors duration-300">
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

          <Link href="/admin" className="hidden sm:inline-flex">
            <Button variant="gold" size="sm">
              <span>{t("b2bPortal")}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
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
        <div className="border-b border-border bg-background/95 px-5 py-4 backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col space-y-2.5">
            <Link
              href="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                isCollectionActive
                  ? "bg-gold-500/15 text-gold-400 border border-gold-500/30"
                  : "text-foreground hover:bg-card hover:text-gold-400"
              }`}
            >
              <LayoutGrid className="h-4 w-4 text-gold-500" />
              <span>{t("collection")}</span>
            </Link>

            {/* Mobile Accordion for Platform Özellikleri */}
            <div className="rounded-xl border border-border/70 bg-card/40">
              <button
                type="button"
                onClick={() => setMobileFeaturesOpen((prev) => !prev)}
                className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-foreground"
              >
                <span>{t("features")}</span>
                <ChevronDown
                  className={`h-4 w-4 text-gold-400 transition-transform ${
                    mobileFeaturesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileFeaturesOpen && (
                <div className="border-t border-border/60 px-2 py-2 space-y-1">
                  {PLATFORM_FEATURES.map((feature) => (
                    <Link
                      key={feature.slug}
                      href={feature.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                        pathname === feature.href
                          ? "bg-gold-500/15 text-gold-400"
                          : "text-muted-foreground hover:bg-card hover:text-gold-400"
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
              href="/#b2b-ortaklik"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-card hover:text-gold-400"
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

