"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Building2,
  CalendarCheck,
  TrendingUp,
  Sparkles,
  Plus,
  Eye,
  MapPin,
  Compass,
  Globe,
  Users,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdminProperties, type AdminPropertyItem } from "@/lib/actions/property";
import { getAllAppointments, type AppointmentRecord } from "@/lib/actions/appointment";

export default function AdminDashboardOverviewPage() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<AdminPropertyItem[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [propRes, appRes] = await Promise.all([
          getAdminProperties(),
          getAllAppointments(),
        ]);
        setProperties(propRes.properties);
        setAppointments(appRes);
      } catch (err) {
        console.warn("Overview load fallback:", err);
      }
    })();
  }, []);

  const totalPortfolioEur = properties.reduce((sum, p) => {
    const rate = p.currency === "USD" ? 0.92 : p.currency === "TRY" ? 0.027 : 1;
    return sum + p.price * rate;
  }, 0);

  const formattedTotalValue =
    totalPortfolioEur > 0
      ? `€ ${(totalPortfolioEur / 1_000_000).toFixed(1)}M`
      : "€ 126.9M";

  const pendingAppointmentsCount = appointments.filter(
    (a) => a.status === "PENDING"
  ).length;

  const stats = [
    {
      label: "Toplam Portföy Değeri",
      value: formattedTotalValue,
      trend: "+14.2%",
      description: "Son çeyreğe göre",
      icon: TrendingUp,
    },
    {
      label: "Aktif Lüks İlanlar",
      value: String(properties.length || 4),
      trend: "Yayında",
      description: `${
        properties.filter((p) => p.status === "OFF_MARKET").length
      } off-market portföy`,
      icon: Building2,
    },
    {
      label: "Bekleyen VIP Randevular",
      value: String(pendingAppointmentsCount || 2),
      trend: `${appointments.length} toplam`,
      description: "Onay bekleyen gösterimler",
      icon: CalendarCheck,
    },
    {
      label: "AI Staging & 360° VR",
      value: `${properties.filter((p) => p.hasPanorama360 || p.isStaged).length} Mülk`,
      trend: "Aktif",
      description: "Sanal tur & sahneleme hazır",
      icon: Sparkles,
    },
  ];

  const quickModules = [
    {
      title: "Trafik & Pazarlama Kokpiti",
      desc: "Recharts grafikleri ve Gemini büyüme önerileri",
      href: "/admin/dashboard/analytics",
      icon: TrendingUp,
      color: "text-gold-400",
    },
    {
      title: "Portföy Yönetimi (CRUD)",
      desc: "Prisma ile ilan ekle, düzenle, yayınla veya sil",
      href: "/admin/dashboard/portfolio",
      icon: Building2,
      color: "text-gold-400",
    },
    {
      title: "VIP Randevu Takvimi",
      desc: "Gelen rezervasyonları onayla ve SMS/E-posta gönder",
      href: "/admin/dashboard/appointments",
      icon: CalendarCheck,
      color: "text-emerald-400",
    },
    {
      title: "AI Virtual Staging Studio",
      desc: "Boş odaları yapay zekâ ile lüks mobilyalandır",
      href: "/admin/dashboard/ai-staging",
      icon: Sparkles,
      color: "text-purple-400",
    },
    {
      title: "360° Tour Builder",
      desc: "Panorama & Cubemap yükle, hotspot ve kapı okları ekle",
      href: "/admin/dashboard/tour-builder",
      icon: Compass,
      color: "text-gold-400",
    },
    {
      title: "AI SEO & GEO Optimizer",
      desc: "Google Rich Snippet & Gemini meta açıklamaları üret",
      href: "/admin/dashboard/seo-optimizer",
      icon: Globe,
      color: "text-emerald-400",
    },
    {
      title: "Ekip & Broker Yönetimi",
      desc: "Ajans danışmanlarını ve RBAC yetkilerini yönet",
      href: "/admin/dashboard/team",
      icon: Users,
      color: "text-gold-400",
    },
    {
      title: "Ajans Ayarları & Tema",
      desc: "White-label logo, marka rengi ve SaaS alan adı",
      href: "/admin/dashboard/settings",
      icon: Settings,
      color: "text-sky-400",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
              Ajans Yönetim Konsolu
            </span>
            <Badge variant="gold" className="text-[10px]">
              {session?.user?.role || "AGENCY_OWNER"}
            </Badge>
          </div>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Hoş Geldiniz, {session?.user?.name || "Derin Soydan"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {session?.user?.agencyName || "Lumière Prime Estates"} B2B portföy dağıtımı, müşteri talepleri ve yapay zekâ modüllerine tek merkezden erişin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard/analytics">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-gold-400" />
              <span>Trafik Analitiği</span>
            </Button>
          </Link>
          <Link href="/admin/dashboard/portfolio">
            <Button variant="gold" size="sm" className="gap-1.5 text-xs">
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

      {/* Quick Access All Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-foreground">
            Platform Modülleri &amp; Hızlı Erişim
          </h2>
          <span className="text-xs text-muted-foreground">8 Aktif SaaS Modülü</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="group rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-xl transition-all hover:border-gold-500/50 hover:bg-card/90 hover:shadow-gold-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/80">
                    <Icon className={`h-4 w-4 ${mod.color}`} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold-400" />
                </div>
                <h3 className="mt-3 font-serif text-sm font-bold text-foreground group-hover:text-gold-400 transition-colors">
                  {mod.title}
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {mod.desc}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Active Portfolio & Recent VIP Appointments */}
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
              <Button variant="ghost" size="sm" className="text-xs text-gold-400">
                Portföyü Yönet →
              </Button>
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Mülk &amp; Konum</th>
                  <th className="pb-3 font-semibold">Fiyat</th>
                  <th className="pb-3 font-semibold">Durum</th>
                  <th className="pb-3 font-semibold">AI &amp; 360°</th>
                  <th className="pb-3 text-right font-semibold">Detay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {properties.slice(0, 5).map((listing) => (
                  <tr
                    key={listing.id}
                    className="group hover:bg-gold-500/5 transition-colors"
                  >
                    <td className="py-3.5 pr-3">
                      <p className="font-semibold text-foreground group-hover:text-gold-400 transition-colors">
                        {listing.title}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                        <MapPin className="h-3 w-3 text-gold-500" />
                        <span>
                          {listing.district ? `${listing.district}, ` : ""}
                          {listing.city}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 font-serif font-bold text-gold-500 whitespace-nowrap">
                      {listing.currency === "USD" ? "$" : listing.currency === "TRY" ? "₺" : "€"}{" "}
                      {listing.price.toLocaleString("tr-TR")}
                    </td>
                    <td className="py-3.5">
                      {listing.status === "OFF_MARKET" ? (
                        <Badge variant="navy" className="text-[10px]">
                          Off-Market
                        </Badge>
                      ) : (
                        <Badge variant="gold" className="text-[10px]">
                          {listing.status}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5">
                      {listing.isStaged || listing.hasPanorama360 ? (
                        <Badge variant="staged" className="text-[10px]">
                          {listing.hasPanorama360 ? "360° VR" : "AI Staged"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/properties/${listing.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-gold-400 hover:border-gold-500/40 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Link>
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
                Son gelen gösterim talepleri
              </p>
            </div>
            <Link href="/admin/dashboard/appointments">
              <Badge variant="gold" className="text-[10px] cursor-pointer">
                Takvimi Aç
              </Badge>
            </Link>
          </div>

          <div className="mt-4 space-y-3.5">
            {appointments.slice(0, 3).map((app) => (
              <Link
                key={app.id}
                href="/admin/dashboard/appointments"
                className="block rounded-xl border border-border bg-card/80 p-3.5 hover:border-gold-500/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-foreground truncate">
                    {app.guestName}
                  </span>
                  <span className="text-[10px] text-gold-400 font-mono shrink-0">
                    {app.date} · {app.timeSlot}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground truncate">
                  {app.propertyTitle}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span
                    className={`font-semibold ${
                      app.status === "CONFIRMED"
                        ? "text-emerald-400"
                        : app.status === "PENDING"
                        ? "text-amber-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {app.status}
                  </span>
                  <span className="text-muted-foreground">
                    {app.tourType === "ONLINE_VIDEO"
                      ? "Online Video Tur"
                      : app.vipTransfer || "VIP Gösterim"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
