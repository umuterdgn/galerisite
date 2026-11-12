"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion, type Variants } from "framer-motion";
import {
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Search,
  KeyRound,
  SlidersHorizontal,
  Gem,
  Bot,
} from "lucide-react";
import { PublicNav } from "@/components/navigation/public-nav";
import { Button } from "@/components/ui/button";
import { MapExplore, type MapPropertyItem } from "@/components/public/MapExplore";
import { PropertyInquiryForm } from "@/components/property-inquiry-form";
import { SemanticSearch } from "@/components/public/SemanticSearch";
import { type PropertyCardItem } from "@/components/public/PropertyCard";

export interface HomePageClientProps {
  initialProperties: PropertyCardItem[];
  mapProperties?: MapPropertyItem[];
}

export function HomePageClient({
  initialProperties,
  mapProperties,
}: HomePageClientProps) {
  const [activeQuery, setActiveQuery] = useState("");
  const tHero = useTranslations("Hero");
  const tProp = useTranslations("Property");
  const tCap = useTranslations("Capabilities");
  const tFooter = useTranslations("Footer");

  const heroSuggestions = [
    "Hastaneye yakın, büyük balkonlu ve deniz manzaralı 3+1 evler",
    "Boğaz kıyısında özel yat iskelesi ve helikopter pistli yalı",
    "Bodrum'da gün batımı manzaralı ve sonsuzluk havuzlu taş villa",
  ];

  const handleHeroSearch = (queryText: string) => {
    setActiveQuery(queryText);
    const vitrinEl = document.getElementById("vitrin");
    if (vitrinEl) {
      vitrinEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.21, 0.47, 0.32, 0.98] as const,
      },
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-500">
      <PublicNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex flex-col justify-center pt-16 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-luxury-mesh opacity-60" />
          <div className="pointer-events-none absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-gold-500/10 blur-[130px]" />
          <div className="pointer-events-none absolute top-1/2 -left-20 h-96 w-96 rounded-full bg-navy-600/15 blur-[130px]" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mx-auto max-w-4xl text-center"
            >
              <motion.div variants={itemVariants} className="inline-block">
                <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-400 backdrop-blur-md shadow-gold-sm">
                  <Sparkles className="h-3.5 w-3.5 text-gold-400 animate-pulse" />
                  <span className="tracking-wide">{tHero("badge")}</span>
                </div>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="mt-8 font-serif text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.12]"
              >
                {tHero("title")}{" "}
                <span className="bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 bg-clip-text text-transparent">
                  {tHero("titleHighlight")}
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground"
              >
                {tHero("subtitle")}
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-10 flex flex-wrap items-center justify-center gap-4"
              >
                <a href="#vitrin">
                  <Button variant="gold" size="lg">
                    <span>{tHero("ctaPrimary")}</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </a>

                <Link href="/admin">
                  <Button variant="outline" size="lg">
                    <KeyRound className="h-4 w-4 text-gold-400" />
                    <span>{tHero("ctaSecondary")}</span>
                  </Button>
                </Link>
              </motion.div>

              {/* Luxury Natural Language Search Bar (Hero Trigger) */}
              <motion.div variants={itemVariants} className="mt-12 mx-auto max-w-3xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (activeQuery.trim()) {
                      handleHeroSearch(activeQuery);
                    }
                  }}
                  className="rounded-2xl border border-gold-500/30 bg-card/75 p-2 sm:p-2.5 backdrop-blur-2xl shadow-luxury-glass flex items-center gap-2 group transition-all hover:border-gold-500/60"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-400">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </div>
                  <input
                    type="text"
                    value={activeQuery}
                    onChange={(e) => setActiveQuery(e.target.value)}
                    placeholder="Örn: Hastaneye yakın, büyük balkonlu ve deniz manzaralı 3+1 evler..."
                    className="flex-1 bg-transparent px-3 text-xs sm:text-sm font-medium text-foreground placeholder-muted-foreground outline-none"
                  />
                  <Button variant="gold" size="md" type="submit" className="shrink-0 gap-1.5">
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Semantik Keşfet</span>
                  </Button>
                </form>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Bot className="h-3 w-3 text-gold-400" />
                    <span>Örnek Doğal Sorgular:</span>
                  </span>
                  {heroSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleHeroSearch(suggestion)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-card/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-all hover:border-gold-500/40 hover:text-foreground hover:bg-card/90"
                    >
                      <Sparkles className="h-2 w-2 text-gold-500/70" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 6. VITRIN KATALOGU: Gerçek Prisma Verisi + Semantik AI Arama Vitrini */}
        <section id="vitrin" className="border-t border-border bg-card/25 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end mb-12">
              <div>
                <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
                  {tProp("sectionBadge")}
                </span>
                <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {tProp("sectionTitle")}
                </h2>
              </div>
              <p className="max-w-md text-xs text-muted-foreground">
                {tProp("sectionDesc")}
              </p>
            </div>

            <SemanticSearch
              initialQuery={activeQuery}
              initialProperties={initialProperties}
              key={`${activeQuery}-${initialProperties.map((p) => p.id).join(",")}`}
            />
          </div>
        </section>

        {/* GEO & Mapbox Interactive Discovery Section */}
        <section id="geo-kesif" className="border-t border-border bg-card/10 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end mb-8">
              <div>
                <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
                  İnteraktif Lokasyon Analizi
                </span>
                <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Harita Üzerinden GEO Keşif
                </h2>
              </div>
              <p className="max-w-md text-xs text-muted-foreground">
                Boğaz hattından Akdeniz ve Dubai sahillerine kadar tüm portföyü, marina ve VIP ulaşım bağlantılarıyla birlikte keşfedin.
              </p>
            </div>

            <MapExplore
              properties={
                mapProperties && mapProperties.length > 0 ? mapProperties : undefined
              }
            />
          </div>
        </section>

        {/* Unique Capabilities Section */}
        <section id="off-market" className="border-t border-border py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
                {tCap("sectionBadge")}
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {tCap("sectionTitle")}
              </h2>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-xl transition-all hover:border-gold-500/50 hover:shadow-gold-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-serif text-xl font-bold text-foreground">
                  {tCap("stagingTitle")}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {tCap("stagingDesc")}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-xl transition-all hover:border-gold-500/50 hover:shadow-gold-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-serif text-xl font-bold text-foreground">
                  {tCap("offMarketTitle")}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {tCap("offMarketDesc")}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-xl transition-all hover:border-gold-500/50 hover:shadow-gold-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-400">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-serif text-xl font-bold text-foreground">
                  {tCap("multiTenantTitle")}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {tCap("multiTenantDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Inquiry Section */}
        <section id="b2b-ortaklik" className="border-t border-border bg-card/20 py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <PropertyInquiryForm />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 py-12 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold-500/30 bg-gold-500/10">
              <Gem className="h-4 w-4 text-gold-400" />
            </div>
            <div>
              <span className="font-serif text-sm font-bold tracking-wider text-foreground">
                LUMIÈRE LUXURY REAL ESTATE
              </span>
              <p className="text-[10px] text-muted-foreground">
                {tFooter("tagline")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <a href="#vitrin" className="hover:text-gold-400 transition-colors">
              Portföy
            </a>
            <a href="#off-market" className="hover:text-gold-400 transition-colors">
              Off-Market
            </a>
            <Link href="/admin" className="hover:text-gold-400 transition-colors">
              B2B Ajans Portalı
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2026 LUMIÈRE Technologies. {tFooter("rights")}
          </p>
        </div>
      </footer>
    </div>
  );
}

