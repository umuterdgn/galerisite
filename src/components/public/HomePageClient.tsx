"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, type Variants } from "framer-motion";
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
import { Navbar } from "@/components/public/Navbar";
import { Button } from "@/components/ui/button";
import { MapExplore, type MapPropertyItem } from "@/components/public/MapExplore";
import { PropertyInquiryForm } from "@/components/property-inquiry-form";
import { SemanticSearch } from "@/components/public/SemanticSearch";
import { type PropertyCardItem } from "@/components/public/PropertyCard";

export interface HomePageClientProps {
  initialProperties: PropertyCardItem[];
  mapProperties?: MapPropertyItem[];
}

interface AmbientOrbSpec {
  id: string;
  className: string;
  animateX: number[];
  animateY: number[];
  animateScale: number[];
  duration: number;
  delay?: number;
}

const LUXURY_EASE = [0.21, 0.47, 0.32, 0.98] as const;

const SECTION_VIEWPORT = {
  once: true,
  amount: 0.08,
} as const;

const sectionFadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: LUXURY_EASE,
    },
  },
};

const cardStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
};

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: LUXURY_EASE,
    },
  },
};

const AMBIENT_ORBS: AmbientOrbSpec[] = [
  {
    id: "orb-gold-top-right",
    className:
      "-top-36 right-[10%] h-[540px] w-[540px] bg-gold-500/20 dark:bg-gold-500/[0.17] blur-[140px]",
    animateX: [0, 48, -32, 0],
    animateY: [0, -34, 24, 0],
    animateScale: [1, 1.12, 0.95, 1],
    duration: 22,
  },
  {
    id: "orb-navy-mid-left",
    className:
      "top-[22%] -left-32 h-[620px] w-[620px] bg-navy-700/20 dark:bg-navy-800/45 blur-[155px]",
    animateX: [0, 46, -24, 0],
    animateY: [0, 38, -28, 0],
    animateScale: [1, 1.09, 0.94, 1],
    duration: 26,
    delay: 1.5,
  },
  {
    id: "orb-gold-horizon",
    className:
      "top-[52%] left-[38%] h-[420px] w-[420px] bg-gold-400/15 dark:bg-gold-400/[0.11] blur-[130px]",
    animateX: [0, -40, 32, 0],
    animateY: [0, -28, 30, 0],
    animateScale: [0.95, 1.14, 1, 0.95],
    duration: 19,
    delay: 0.8,
  },
  {
    id: "orb-navy-bottom-right",
    className:
      "-bottom-40 -right-24 h-[580px] w-[580px] bg-navy-900/20 dark:bg-navy-900/60 blur-[150px]",
    animateX: [0, -36, 26, 0],
    animateY: [0, -38, 18, 0],
    animateScale: [1, 1.1, 0.96, 1],
    duration: 24,
    delay: 2,
  },
];

export function HomePageClient({
  initialProperties,
  mapProperties,
}: HomePageClientProps) {
  const [activeQuery, setActiveQuery] = useState("");
  const prefersReducedMotion = useReducedMotion();
  const tHero = useTranslations("Hero");
  const tProp = useTranslations("Property");
  const tCap = useTranslations("Capabilities");
  const tFooter = useTranslations("Footer");

  const heroSuggestions = [
    "Hastaneye yakın, büyük balkonlu ve deniz manzaralı 3+1 evler",
    "Boğaz kıyısında özel yat iskelesi ve helikopter pistli yalı",
    "Bodrum'da gün batımı manzaralı ve sonsuzluk havuzlu taş villa",
  ];

  const capabilityCards = [
    {
      id: "staging",
      icon: Sparkles,
      title: tCap("stagingTitle"),
      description: tCap("stagingDesc"),
      href: "/features/ai-staging",
    },
    {
      id: "offMarket",
      icon: ShieldCheck,
      title: tCap("offMarketTitle"),
      description: tCap("offMarketDesc"),
      href: "/features/off-market",
    },
    {
      id: "multiTenant",
      icon: SlidersHorizontal,
      title: tCap("multiTenantTitle"),
      description: tCap("multiTenantDesc"),
      href: "/features/multi-tenant",
    },
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
        ease: LUXURY_EASE,
      },
    },
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-background dark:bg-[#05060a] text-foreground transition-colors duration-500">
      {/* Global Outermost Animated Gold & Deep Navy Spotlights + Contrast Vignette */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-luxury-mesh opacity-70 dark:opacity-90" />

        {AMBIENT_ORBS.map((orb) => (
          <motion.div
            key={orb.id}
            className={`absolute rounded-full will-change-transform ${orb.className}`}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    x: orb.animateX,
                    y: orb.animateY,
                    scale: orb.animateScale,
                  }
            }
            transition={{
              duration: orb.duration,
              delay: orb.delay ?? 0,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Semi-transparent Vignette & Atmospheric Scrim to preserve text contrast */}
        <div className="absolute inset-0 bg-background/30 dark:bg-[#05060a]/45" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 65% at 50% 28%, transparent 0%, hsl(var(--background) / 0.52) 68%, hsl(var(--background) / 0.92) 100%)",
          }}
        />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex flex-col justify-center pt-16 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
          {/* Hero Layered Depth: Moving Spotlights + Subtle Architectural Grid + Readability Vignette */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(197, 155, 39, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(197, 155, 39, 0.4) 1px, transparent 1px)",
                backgroundSize: "72px 72px",
              }}
            />

            <motion.div
              className="absolute -top-28 left-1/2 h-[460px] w-[720px] -translate-x-1/2 rounded-full bg-gold-500/15 dark:bg-gold-500/[0.14] blur-[140px] will-change-transform"
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      scale: [1, 1.09, 0.97, 1],
                      opacity: [0.65, 0.95, 0.72, 0.65],
                    }
              }
              transition={{
                duration: 14,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />

            <div className="animate-pulse absolute top-1/3 -left-24 h-80 w-80 rounded-full bg-navy-800/30 dark:bg-navy-700/40 blur-[120px] [animation-duration:7s]" />
            <div className="animate-pulse absolute bottom-10 -right-16 h-72 w-72 rounded-full bg-gold-400/15 dark:bg-gold-500/[0.12] blur-[120px] [animation-duration:9s]" />

            {/* Hero Semi-Transparent Vignette Mask */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-transparent to-background/85 dark:from-[#05060a]/55 dark:via-[#05060a]/20 dark:to-[#05060a]/90" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

                <Link href="/admin/login">
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
        <motion.section
          id="vitrin"
          variants={sectionFadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={SECTION_VIEWPORT}
          className="border-t border-border bg-card/30 backdrop-blur-[2px] py-20 lg:py-28"
        >
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

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/properties">
                <Button variant="gold" size="lg" className="gap-2">
                  <span>Portföy Koleksiyonunun Tamamını Gör</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features/virtual-tour">
                <Button variant="outline" size="lg" className="gap-2">
                  <span>Detaylı İncele (360° Sanal Tur)</span>
                  <ArrowUpRight className="h-4 w-4 text-gold-400" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* GEO & Mapbox Interactive Discovery Section */}
        <motion.section
          id="geo-kesif"
          variants={sectionFadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={SECTION_VIEWPORT}
          className="border-t border-border bg-card/15 backdrop-blur-[2px] py-20 lg:py-24"
        >
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

            <MapExplore properties={mapProperties} />

            <div className="mt-8 flex justify-center">
              <Link href="/features/geo-explore">
                <Button variant="outline" size="lg" className="gap-2">
                  <span>Detaylı İncele</span>
                  <ArrowUpRight className="h-4 w-4 text-gold-400" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Unique Capabilities Section */}
        <motion.section
          id="off-market"
          variants={sectionFadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={SECTION_VIEWPORT}
          className="border-t border-border py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
                {tCap("sectionBadge")}
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {tCap("sectionTitle")}
              </h2>
            </div>

            <motion.div
              variants={cardStaggerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={SECTION_VIEWPORT}
              className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
            >
              {capabilityCards.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.id}
                    variants={cardItemVariants}
                    className="flex flex-col rounded-2xl border border-border bg-card/65 p-8 backdrop-blur-xl transition-all hover:border-gold-500/50 hover:shadow-gold-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-6 font-serif text-xl font-bold text-foreground">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                    <div className="mt-auto pt-6">
                      <Link
                        href={card.href}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-400 transition-colors hover:text-gold-300"
                      >
                        <span>Detaylı İncele</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="mt-10 flex justify-center">
              <Link href="/features/multi-tenant">
                <Button variant="outline" size="lg" className="gap-2">
                  <span>Detaylı İncele</span>
                  <ArrowUpRight className="h-4 w-4 text-gold-400" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Inquiry Section */}
        <motion.section
          id="b2b-ortaklik"
          variants={sectionFadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={SECTION_VIEWPORT}
          className="border-t border-border bg-card/20 backdrop-blur-[2px] py-24"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <PropertyInquiryForm />
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        variants={sectionFadeUpVariants}
        initial="hidden"
        whileInView="visible"
        viewport={SECTION_VIEWPORT}
        className="relative z-10 border-t border-border bg-card/45 py-12 backdrop-blur-md"
      >
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
            <Link href="/admin/login" className="hover:text-gold-400 transition-colors">
              {tHero("ctaSecondary")}
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2026 LUMIÈRE Technologies. {tFooter("rights")}
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

