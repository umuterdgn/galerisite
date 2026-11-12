import React from "react";
import { Link } from "@/i18n/routing";
import {
  ArrowLeft,
  ArrowUpRight,
  Compass,
  MapPin,
  Sparkles,
  ShieldCheck,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/public/Navbar";
import { Button } from "@/components/ui/button";
import {
  PLATFORM_FEATURES,
  type PlatformFeatureSpec,
} from "@/lib/features-catalog";

function FeatureIcon({
  iconName,
}: {
  iconName: PlatformFeatureSpec["iconName"];
}) {
  switch (iconName) {
    case "compass":
      return <Compass className="h-6 w-6 text-gold-400" />;
    case "map":
      return <MapPin className="h-6 w-6 text-gold-400" />;
    case "sparkles":
      return <Sparkles className="h-6 w-6 text-gold-400" />;
    case "shield":
      return <ShieldCheck className="h-6 w-6 text-gold-400" />;
    case "layers":
      return <Layers className="h-6 w-6 text-gold-400" />;
  }
}

export interface FeatureDetailViewProps {
  feature: PlatformFeatureSpec;
  previewTitle?: string;
  previewDescription?: string;
  children?: React.ReactNode;
}

export function FeatureDetailView({
  feature,
  previewTitle,
  previewDescription,
  children,
}: FeatureDetailViewProps) {
  const relatedFeatures = PLATFORM_FEATURES.filter(
    (item) => item.slug !== feature.slug
  );

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-background dark:bg-[#05060a] text-foreground">
      {/* Luxury ambient spotlights */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-36 right-[15%] h-[500px] w-[500px] rounded-full bg-gold-500/15 dark:bg-gold-500/[0.14] blur-[140px]" />
        <div className="absolute top-[35%] -left-24 h-[520px] w-[520px] rounded-full bg-navy-800/20 dark:bg-navy-800/45 blur-[150px]" />
        <div className="absolute inset-0 bg-background/30 dark:bg-[#05060a]/40" />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-gold-400 transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Ana Sayfaya Dön</span>
          </Link>

          {/* Hero Summary Card */}
          <section className="rounded-3xl border border-gold-500/25 bg-card/70 p-7 sm:p-10 lg:p-12 backdrop-blur-2xl shadow-luxury-glass">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-1.5 text-xs font-semibold text-gold-400">
                  <FeatureIcon iconName={feature.iconName} />
                  <span className="tracking-wide">{feature.badge}</span>
                </div>

                <h1 className="mt-5 font-serif text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  {feature.heroTitle}
                </h1>

                <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  {feature.heroDescription}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3.5">
                  <Link href="/properties">
                    <Button variant="gold" size="lg" className="gap-2">
                      <span>Portföy Koleksiyonunu Keşfet</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={feature.adminHref}>
                    <Button variant="outline" size="lg" className="gap-2">
                      <span>{feature.adminCtaLabel}</span>
                      <ArrowUpRight className="h-4 w-4 text-gold-400" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Feature Key Metrics */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:w-72 shrink-0">
                {feature.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-border bg-background/60 p-4 backdrop-blur-md"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-1 font-serif text-lg font-bold text-gold-400">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Optional Interactive Live Module Preview */}
          {children && (
            <section className="mt-12">
              {(previewTitle || previewDescription) && (
                <div className="mb-5">
                  {previewTitle && (
                    <h2 className="font-serif text-2xl font-bold text-foreground">
                      {previewTitle}
                    </h2>
                  )}
                  {previewDescription && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {previewDescription}
                    </p>
                  )}
                </div>
              )}
              {children}
            </section>
          )}

          {/* Core Architectural Highlights */}
          <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {feature.highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card/65 p-6 backdrop-blur-xl transition-colors hover:border-gold-500/40"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            ))}
          </section>

          {/* Other Platform Modules Cross-Navigation */}
          <section className="mt-16 border-t border-border pt-10">
            <h2 className="font-serif text-xl font-bold text-foreground">
              Diğer Platform Özellikleri
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedFeatures.map((other) => (
                <Link
                  key={other.slug}
                  href={other.href}
                  className="group rounded-2xl border border-border bg-card/55 p-4 backdrop-blur-md transition-all hover:border-gold-500/45 hover:bg-card/85"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground group-hover:text-gold-400">
                      {other.title}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-gold-400" />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground line-clamp-2">
                    {other.shortDesc}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

