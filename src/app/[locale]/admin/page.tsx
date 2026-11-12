"use client";

import React from "react";
import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  TrendingUp,
  Sparkles,
  Plus,
  Eye,
  MapPin,
  Globe,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MediaUploader } from "@/components/ui/MediaUploader";
import { savePropertyMedia } from "@/lib/actions/media";
import { SeoGeoGeneratorForm } from "@/components/admin/SeoGeoGeneratorForm";

export default function AdminDashboardPage() {
  const stats = [
    {
      label: "Toplam Portföy Değeri",
      value: "€ 126.9M",
      trend: "+14.2%",
      description: "Son çeyreğe göre",
      icon: TrendingUp,
    },
    {
      label: "Aktif Lüks İlanlar",
      value: "18",
      trend: "+3 yeni",
      description: "6 off-market",
      icon: Building2,
    },
    {
      label: "Bekleyen VIP Randevular",
      value: "9",
      trend: "4 onaylandı",
      description: "Önümüzdeki 7 gün",
      icon: CalendarCheck,
    },
    {
      label: "AI Virtual Staging",
      value: "34 Oda",
      trend: "Aktif",
      description: "12 sanal tur hazır",
      icon: Sparkles,
    },
  ];

  const recentListings = [
    {
      id: "1",
      title: "The Bosphorus Waterfront Palace",
      location: "Yeniköy, Istanbul",
      price: "€ 42.500.000",
      status: "FOR_SALE",
      isExclusive: true,
      staged: true,
    },
    {
      id: "2",
      title: "Villa Belle Époque",
      location: "Cap d'Antibes, Fransa",
      price: "€ 38.000.000",
      status: "FOR_SALE",
      isExclusive: true,
      staged: true,
    },
    {
      id: "3",
      title: "Sky Penthouse Palm Jumeirah",
      location: "Palm Jumeirah, Dubai",
      price: "$ 27.900.000",
      status: "FOR_SALE",
      isExclusive: true,
      staged: false,
    },
    {
      id: "4",
      title: "Yalıkavak Cliffside Private Estate",
      location: "Bodrum, Türkiye",
      price: "€ 18.500.000",
      status: "OFF_MARKET",
      isExclusive: true,
      staged: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Ajans Yönetim Konsolu
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Lumière Prime Estates B2B portföy dağıtımı, müşteri talepleri ve yapay zeka analizleri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard/analytics">
            <Button variant="outline" size="sm">
              <span>Rapor &amp; Analitik</span>
            </Button>
          </Link>
          <Link href="/admin/dashboard/portfolio">
            <Button variant="gold" size="sm">
              <Plus className="h-4 w-4" />
              <span>Yeni Portföy Ekle</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Table: Recent Properties */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">
                Aktif İlan Portföyü
              </h2>
              <p className="text-xs text-muted-foreground">
                Son güncellenen ve yayında olan mülkler
              </p>
            </div>
            <Link href="/admin/dashboard/portfolio">
              <Button variant="ghost" size="sm" className="text-xs">
                Tümünü Gör
              </Button>
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Mülk & Konum</th>
                  <th className="pb-3 font-semibold">Fiyat</th>
                  <th className="pb-3 font-semibold">Durum</th>
                  <th className="pb-3 font-semibold">AI Staging</th>
                  <th className="pb-3 text-right font-semibold">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {recentListings.map((listing) => (
                  <tr key={listing.id} className="group hover:bg-gold-500/5 transition-colors">
                    <td className="py-3.5 pr-3">
                      <p className="font-semibold text-foreground group-hover:text-gold-400 transition-colors">
                        {listing.title}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3 text-gold-500" />
                        <span>{listing.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 font-serif font-bold text-gold-500">
                      {listing.price}
                    </td>
                    <td className="py-3.5">
                      {listing.status === "OFF_MARKET" ? (
                        <Badge variant="navy" className="text-[10px]">
                          Off-Market
                        </Badge>
                      ) : (
                        <Badge variant="gold" className="text-[10px]">
                          Yayında
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5">
                      {listing.staged ? (
                        <Badge variant="staged" className="text-[10px]">
                          Aktif
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href="#seo-geo"
                          title="AI SEO / GEO Optimizasyonu"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gold-500/30 bg-gold-500/10 text-gold-400 hover:text-white hover:border-gold-500 hover:bg-gold-500/30 transition-colors"
                        >
                          <Globe className="h-3.5 w-3.5" />
                        </a>
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-gold-500/40 transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* VIP Appointments Preview */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">
                VIP Randevular
              </h2>
              <p className="text-xs text-muted-foreground">
                Gelecek mülk gösterimleri
              </p>
            </div>
            <Badge variant="gold" className="text-[10px]">
              Canlı
            </Badge>
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-gold-500/20 bg-gold-500/5 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">
                  Lord Julian Sterling
                </span>
                <span className="text-[10px] text-gold-400 font-medium">
                  Yarın 14:00
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                The Bosphorus Waterfront Palace
              </p>
              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-medium">Onaylandı</span>
                <span className="text-muted-foreground">Özel Helikopter Transferi</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card/80 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">
                  Marc & Sophie Dupont
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  12 Kasım 11:30
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground truncate">
                Villa Belle Époque - Cap d&apos;Antibes
              </p>
              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <span className="text-gold-400 font-medium">İncelemede</span>
                <span className="text-muted-foreground">Aile Ofisi Temsilcisi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI SEO & Generative Engine Optimization (GEO) Module */}
      <div id="seo-geo" className="pt-4">
        <SeoGeoGeneratorForm />
      </div>

      {/* Cloudinary Media & Virtual Staging Uploader Section */}
      <div id="virtual-staging" className="pt-4">
        <MediaUploader
          propertyId="prop-bosphorus-palace"
          onUploadComplete={async (items) => {
            console.log("Cloudinary Upload Completed:", items);
            // Prisma'ya kaydetme aksiyonu
            await savePropertyMedia(
              "prop-bosphorus-palace",
              items.map((it) => ({
                url: it.url,
                type: it.type,
                roomLabel: it.roomLabel,
                isStaged: it.isStaged,
                sortOrder: it.sortOrder,
              }))
            );
          }}
        />
      </div>
    </div>
  );
}
