"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  Compass,
  Heart,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Bot,
  Zap,
  ShieldCheck,
  Users,
  CheckCircle2,
  Globe,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type MarketingInsight } from "@/app/api/ai/marketing-insights/route";

const SPARKLINE_PROPERTIES = [
  { val: 18 }, { val: 19 }, { val: 20 }, { val: 21 }, { val: 21 }, { val: 23 }, { val: 24 },
];
const SPARKLINE_APPOINTMENTS = [
  { val: 6 }, { val: 9 }, { val: 7 }, { val: 12 }, { val: 14 }, { val: 16 }, { val: 18 },
];
const SPARKLINE_TOURS = [
  { val: 2100 }, { val: 2450 }, { val: 2890 }, { val: 3200 }, { val: 3750 }, { val: 4200 }, { val: 4850 },
];
const SPARKLINE_FAVORITES = [
  { val: 9.2 }, { val: 10.4 }, { val: 11.1 }, { val: 12.0 }, { val: 12.8 }, { val: 13.5 }, { val: 14.2 },
];

const TRAFFIC_DENSITY_7D = [
  { day: "Pzt", bosphorus: 380, antibes: 290, dubai: 410, yalikavak: 180, total: 1260 },
  { day: "Sal", bosphorus: 420, antibes: 310, dubai: 460, yalikavak: 210, total: 1400 },
  { day: "Çar", bosphorus: 510, antibes: 390, dubai: 490, yalikavak: 260, total: 1650 },
  { day: "Per", bosphorus: 490, antibes: 430, dubai: 530, yalikavak: 290, total: 1740 },
  { day: "Cum", bosphorus: 680, antibes: 560, dubai: 620, yalikavak: 380, total: 2240 },
  { day: "Cmt", bosphorus: 840, antibes: 690, dubai: 780, yalikavak: 490, total: 2800 },
  { day: "Paz", bosphorus: 790, antibes: 640, dubai: 710, yalikavak: 430, total: 2570 },
];

export default function AdminAnalyticsPage() {
  const [trafficTimeframe, setTrafficTimeframe] = useState<"7d" | "30d" | "90d">("7d");
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>("all");
  const [insights, setInsights] = useState<MarketingInsight[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [aiEngine, setAiEngine] = useState<string>("Google Gemini 1.5 Flash");
  const [appliedInsightIds, setAppliedInsightIds] = useState<string[]>([]);

  const fetchInsights = async (propId = "") => {
    setIsLoadingInsights(true);
    try {
      const url = propId
        ? `/api/ai/marketing-insights?propertyId=${propId}`
        : "/api/ai/marketing-insights";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.insights) {
          setInsights(data.insights);
          if (data.engine) setAiEngine(data.engine);
        }
      }
    } catch (err) {
      console.warn("Marketing insights fetch error:", err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleApplyInsight = (id: string) => {
    setAppliedInsightIds((prev) => [...prev, id]);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
              Performans Analitiği &amp; Büyüme
            </span>
            <span className="inline-block h-1 w-1 rounded-full bg-gold-400" />
            <Badge variant="gold" className="text-[10px]">
              Recharts &amp; Gemini AI
            </Badge>
          </div>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Trafik &amp; Pazarlama Kokpiti</span>
            <Sparkles className="h-6 w-6 text-gold-400" />
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            İlanlarınızın gerçek zamanlı izlenme trendleri, 360° sanal tur etkileşimleri ve Gemini destekli pazarlama optimizasyonları.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/dashboard/team">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5 text-gold-400" />
              <span>Broker Kadrosu</span>
            </Button>
          </Link>

          <Link href="/admin/dashboard/tour-builder">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Compass className="h-3.5 w-3.5 text-gold-400" />
              <span>360° Tour Builder</span>
            </Button>
          </Link>

          <Link href="/admin/dashboard/seo-optimizer">
            <Button variant="gold" size="sm" className="gap-1.5 text-xs">
              <Globe className="h-3.5 w-3.5" />
              <span>AI SEO / GEO</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl transition-all hover:border-gold-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Toplam İlan Portföyü
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold-500/30 bg-gold-500/10 text-gold-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-extrabold text-foreground">24</span>
            <span className="text-xs font-semibold text-emerald-400">+3 yeni ilan</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Son çeyreğe göre %14 büyüme</p>
          <div className="mt-3 h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SPARKLINE_PROPERTIES}>
                <defs>
                  <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="#D4AF37" strokeWidth={2} fill="url(#goldArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Haftalık VIP Randevular
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <CalendarCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-extrabold text-foreground">18</span>
            <span className="text-xs font-semibold text-emerald-400">+28.4%</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">8 Helikopter, 4 Yat transferli</p>
          <div className="mt-3 h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SPARKLINE_APPOINTMENTS}>
                <Bar dataKey="val" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl transition-all hover:border-sky-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              360° VR Sanal Tur Gezintisi
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-extrabold text-foreground">4,850</span>
            <span className="text-xs font-semibold text-sky-400">+42% VR</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Ortalama 4 dk 12 sn gezinti</p>
          <div className="mt-3 h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SPARKLINE_TOURS}>
                <defs>
                  <linearGradient id="skyArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="#38BDF8" strokeWidth={2} fill="url(#skyArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl transition-all hover:border-purple-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              İlan Favorileme Oranı
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-extrabold text-foreground">%14.2</span>
            <span className="text-xs font-semibold text-purple-400">+3.4 puan</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Sektör lüks ortalaması %8.1</p>
          <div className="mt-3 h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SPARKLINE_FAVORITES}>
                <Line type="monotone" dataKey="val" stroke="#A855F7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. Traffic Chart & 3. Gemini AI Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6 rounded-2xl border border-border bg-card/60 p-6 sm:p-8 backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gold-400" />
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  İlan Trafik Yoğunluğu
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hangi ilanın hangi gün daha çok incelendiğini ve ziyaret edildiğini takip edin.
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-border bg-background/80 p-1">
              {(["7d", "30d", "90d"] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setTrafficTimeframe(tf)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    trafficTimeframe === tf
                      ? "bg-gold-500 text-black shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tf === "7d" ? "Son 7 Gün" : tf === "30d" ? "Son 30 Gün" : "Bu Çeyrek"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#D4AF37]" />
              <span className="text-foreground">The Bosphorus Waterfront Palace</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#10B981]" />
              <span className="text-foreground">Villa Belle Époque</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#38BDF8]" />
              <span className="text-foreground">Sky Penthouse Palm Jumeirah</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#A855F7]" />
              <span className="text-foreground">Yalıkavak Cliffside Estate</span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="h-72 sm:h-80 w-full min-w-[480px] sm:min-w-0 pt-2">
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={TRAFFIC_DENSITY_7D}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradBosphorus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradAntibes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradDubai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradYalikavak" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.6} />
                <XAxis dataKey="day" stroke="#737373" tick={{ fill: "#a3a3a3", fontSize: 11 }} />
                <YAxis stroke="#737373" tick={{ fill: "#a3a3a3", fontSize: 11 }} />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-gold-500/30 bg-[#0c0d12]/95 p-3.5 shadow-2xl backdrop-blur-2xl text-xs space-y-1.5 min-w-[200px]">
                          <p className="font-serif font-bold text-gold-400 border-b border-border/60 pb-1">
                            {label} Günü Trafik Detayı
                          </p>
                          {payload.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="truncate max-w-[140px]">
                                  {item.name === "bosphorus"
                                    ? "The Bosphorus Palace"
                                    : item.name === "antibes"
                                    ? "Villa Belle Époque"
                                    : item.name === "dubai"
                                    ? "Sky Penthouse"
                                    : "Yalıkavak Estate"}
                                </span>
                              </span>
                              <span className="font-mono font-bold text-foreground">
                                {item.value} hit
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Area type="monotone" dataKey="bosphorus" name="bosphorus" stroke="#D4AF37" strokeWidth={2.5} fill="url(#gradBosphorus)" />
                <Area type="monotone" dataKey="antibes" name="antibes" stroke="#10B981" strokeWidth={2} fill="url(#gradAntibes)" />
                <Area type="monotone" dataKey="dubai" name="dubai" stroke="#38BDF8" strokeWidth={2} fill="url(#gradDubai)" />
                <Area type="monotone" dataKey="yalikavak" name="yalikavak" stroke="#A855F7" strokeWidth={2} fill="url(#gradYalikavak)" />
              </AreaChart>
            </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/70 text-xs">
            <div className="rounded-xl border border-border/80 bg-background/50 p-3">
              <span className="text-muted-foreground block text-[11px]">Haftalık Toplam İzlenme</span>
              <span className="font-serif text-lg font-bold text-foreground mt-0.5 block">
                13,660 Ziyaret
              </span>
            </div>
            <div className="rounded-xl border border-border/80 bg-background/50 p-3">
              <span className="text-muted-foreground block text-[11px]">En Yoğun Gün</span>
              <span className="font-serif text-lg font-bold text-gold-400 mt-0.5 block">
                Cumartesi (2,800 Hit)
              </span>
            </div>
            <div className="rounded-xl border border-border/80 bg-background/50 p-3">
              <span className="text-muted-foreground block text-[11px]">Trafik Lideri</span>
              <span className="font-serif text-lg font-bold text-foreground mt-0.5 block truncate">
                The Bosphorus Palace
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-5 rounded-2xl border border-gold-500/30 bg-card/60 p-6 sm:p-7 backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-border/70 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-purple-400" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
                  Yapay Zekâ SEO &amp; Pazarlama Asistanı
                </h3>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Düşük tıklanan ilanları tespit edip doğrudan aksiyon önerir.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchInsights(selectedPropertyFilter === "all" ? "" : selectedPropertyFilter)}
              disabled={isLoadingInsights}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-gold-400 hover:border-gold-500/40 transition-colors"
              title="Yenile & Gemini ile Analiz Et"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingInsights ? "animate-spin text-gold-400" : ""}`} />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/30">
              <Sparkles className="mr-1 h-3 w-3 text-purple-400" />
              <span>{aiEngine}</span>
            </Badge>

            <select
              value={selectedPropertyFilter}
              onChange={(e) => {
                setSelectedPropertyFilter(e.target.value);
                fetchInsights(e.target.value === "all" ? "" : e.target.value);
              }}
              className="rounded-lg border border-border bg-background/80 px-2.5 py-1 text-[11px] text-foreground font-medium outline-none focus:border-gold-500"
            >
              <option value="all">Tüm İlanları Tara</option>
              <option value="prop-4">Yalıkavak Cliffside (Az Tıklanan)</option>
              <option value="prop-2">Villa Belle Époque (360 Eksik)</option>
              <option value="prop-3">Sky Penthouse (AI Staging)</option>
              <option value="prop-1">The Bosphorus Palace</option>
            </select>
          </div>

          <div className="space-y-3.5">
            {insights.map((item) => {
              const isApplied = appliedInsightIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 transition-all duration-300 backdrop-blur-md ${
                    isApplied
                      ? "border-emerald-500/30 bg-emerald-500/5 opacity-80"
                      : item.impact === "CRITICAL"
                      ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70"
                      : "border-border bg-background/50 hover:border-gold-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                      {item.propertyTitle}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 text-[10px] font-bold text-gold-400">
                      <Zap className="h-2.5 w-2.5" />
                      <span>{item.potentialGain}</span>
                    </span>
                  </div>

                  <h4 className="mt-1.5 font-serif text-sm font-bold text-foreground">
                    {item.title}
                  </h4>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.recommendation}
                  </p>

                  <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-gold-400" />
                      <span>{item.badge}</span>
                    </span>

                    {isApplied ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Uygulandı</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApplyInsight(item.id)}
                          className="text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Tamamlandı Say
                        </button>
                        <Link href={item.actionUrl}>
                          <Button variant="gold" size="sm" className="h-7 text-[11px] px-2.5 gap-1">
                            <span>{item.actionLabel}</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

