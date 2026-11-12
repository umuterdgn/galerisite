"use client";

import React, { useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import {
  Search,
  Sparkles,
  Compass,
  Building2,
  ArrowLeft,
  SlidersHorizontal,
} from "lucide-react";
import { Navbar } from "@/components/public/Navbar";
import {
  PropertyCard,
  type PropertyCardItem,
} from "@/components/public/PropertyCard";
import { Button } from "@/components/ui/button";

export interface PropertiesCollectionClientProps {
  initialProperties: PropertyCardItem[];
}

type StatusFilter = "ALL" | "FOR_SALE" | "FOR_RENT" | "OFF_MARKET" | "PANORAMA";
type SortOption = "NEWEST" | "PRICE_DESC" | "PRICE_ASC";

export function PropertiesCollectionClient({
  initialProperties,
}: PropertiesCollectionClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("NEWEST");

  const filteredProperties = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const matched = initialProperties.filter((prop) => {
      if (statusFilter === "PANORAMA" && !prop.hasPanorama360) return false;
      if (
        statusFilter !== "ALL" &&
        statusFilter !== "PANORAMA" &&
        prop.status !== statusFilter
      ) {
        return false;
      }

      if (!normalizedSearch) return true;

      return [prop.title, prop.city, prop.district || ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });

    if (sortBy === "NEWEST") return matched;

    return [...matched].sort((a, b) => {
      const priceA = typeof a.price === "number" ? a.price : 0;
      const priceB = typeof b.price === "number" ? b.price : 0;
      return sortBy === "PRICE_DESC" ? priceB - priceA : priceA - priceB;
    });
  }, [initialProperties, searchTerm, statusFilter, sortBy]);

  const filterOptions: { key: StatusFilter; label: string }[] = [
    { key: "ALL", label: `Tüm Portföy (${initialProperties.length})` },
    { key: "FOR_SALE", label: "Satılık" },
    { key: "FOR_RENT", label: "Kiralık" },
    { key: "OFF_MARKET", label: "Off-Market" },
    { key: "PANORAMA", label: "360° Sanal Tur" },
  ];

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-background dark:bg-[#05060a] text-foreground">
      {/* Subtle luxury background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-40 right-[12%] h-[460px] w-[460px] rounded-full bg-gold-500/15 dark:bg-gold-500/[0.12] blur-[140px]" />
        <div className="absolute top-1/2 -left-32 h-[520px] w-[520px] rounded-full bg-navy-800/20 dark:bg-navy-800/40 blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header & Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border-b border-border pb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-gold-400 transition-colors mb-5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Ana Vitrine Dön</span>
            </Link>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gold-400">
                  <Sparkles className="h-3 w-3" />
                  <span>Seçkin Küresel Koleksiyon</span>
                </div>
                <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                  Portföy Koleksiyonu
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Veritabanında kayıtlı tüm akredite yalılar, penthouse&apos;lar,
                  sahil malikâneleri ve 360° sanal tur destekli portföyü inceleyin.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-2 rounded-xl border border-gold-500/25 bg-card/70 px-3.5 py-2.5 backdrop-blur-md">
                  <Building2 className="h-4 w-4 text-gold-400" />
                  <span className="font-semibold text-foreground">
                    {initialProperties.length} Aktif İlan
                  </span>
                </div>
                <Link href="/features/virtual-tour">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-gold-400" />
                    <span>360° Tur Özelliği</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {filterOptions.map((opt) => {
                  const active = statusFilter === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setStatusFilter(opt.key)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                        active
                          ? "border-gold-500/60 bg-gold-500/15 text-gold-400 shadow-gold-sm"
                          : "border-border bg-card/60 text-muted-foreground hover:border-gold-500/35 hover:text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Başlık, şehir veya semt ara..."
                    className="w-full sm:w-64 rounded-xl border border-border bg-card/70 py-2 pl-9 pr-3 text-xs text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-gold-500/60"
                  />
                </div>

                <div className="relative flex items-center">
                  <SlidersHorizontal className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-gold-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label="Sıralama"
                    className="rounded-xl border border-border bg-card/70 py-2 pl-9 pr-4 text-xs font-medium text-foreground outline-none transition-colors focus:border-gold-500/60"
                  >
                    <option value="NEWEST">En Yeni İlanlar</option>
                    <option value="PRICE_DESC">Fiyat: Yüksekten Düşüğe</option>
                    <option value="PRICE_ASC">Fiyat: Düşükten Yükseğe</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Properties Grid */}
          {filteredProperties.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  priority={index < 3}
                />
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-2xl border border-border bg-card/50 p-12 text-center backdrop-blur-xl">
              <p className="font-serif text-xl font-semibold text-foreground">
                Seçilen filtrelere uygun ilan bulunamadı.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Arama metnini veya kategori filtresini sıfırlayarak tüm koleksiyonu
                görüntüleyebilirsiniz.
              </p>
              <Button
                variant="gold"
                size="sm"
                className="mt-5"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                }}
              >
                Filtreleri Temizle
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

