"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Settings,
  Palette,
  Globe,
  Gem,
  Save,
  CheckCircle2,
  ShieldCheck,
  Database,
  Sparkles,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAgencySettings,
  updateAgencySettings,
} from "@/lib/actions/agency";

const LUXURY_COLOR_SWATCHES = [
  { name: "Imperial Gold", hex: "#D4AF37" },
  { name: "Champagne Rose", hex: "#E0BFB8" },
  { name: "Emerald Velvet", hex: "#10B981" },
  { name: "Riviera Azure", hex: "#38BDF8" },
  { name: "Royal Amethyst", hex: "#A855F7" },
];

export default function AgencySettingsPage() {
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState("Lumière Prime Estates");
  const [slug, setSlug] = useState("lumiere-prime");
  const [logoUrl, setLogoUrl] = useState("");
  const [themeColor, setThemeColor] = useState("#D4AF37");
  const [defaultLocale, setDefaultLocale] = useState<"tr" | "en">("tr");
  const [defaultTheme, setDefaultTheme] = useState<"dark" | "light">("dark");
  const [storageMode, setStorageMode] = useState<"prisma" | "memory">("memory");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const data = await getAgencySettings();
        setName(data.name);
        setSlug(data.slug);
        setLogoUrl(data.logoUrl);
        setThemeColor(data.themeColor);
        setDefaultLocale(data.defaultLocale);
        setDefaultTheme(data.defaultTheme);
        setStorageMode(data.storage);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await updateAgencySettings({
        name,
        slug,
        logoUrl,
        themeColor,
        defaultLocale,
        defaultTheme,
      });

      setTheme(defaultTheme);
      setStorageMode(res.storage);

      setSaveMessage(
        `✓ Ajans marka ve tema ayarları kaydedildi (${
          res.storage === "prisma" ? "Prisma PostgreSQL" : "Lokal Senkronize Mod"
        }).`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
              Multi-Tenant White-Label SaaS
            </span>
            <Badge variant="outline" className="text-[10px] border-gold-500/30 text-gold-400">
              <Database className="mr-1 h-3 w-3" />
              {storageMode === "prisma" ? "PostgreSQL Bağlı" : "Senkronize Mod"}
            </Badge>
          </div>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>Ajans Ayarları &amp; Tema</span>
            <Settings className="h-6 w-6 text-gold-400" />
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Ajansınızın kurumsal kimliğini, alt alan adını (subdomain), marka vurgu rengini ve arayüz temasını özelleştirin.
          </p>
        </div>
      </div>

      {saveMessage && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{saveMessage}</span>
          </span>
          <button onClick={() => setSaveMessage(null)} className="hover:underline">
            Kapat
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-gold-400" />
          <span>Ajans ayarları yükleniyor...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-7 space-y-6 rounded-2xl border border-border bg-card/60 p-6 sm:p-8 backdrop-blur-2xl text-xs"
          >
            <div className="flex items-center gap-2 border-b border-border/70 pb-4">
              <Palette className="h-4 w-4 text-gold-400" />
              <h2 className="font-serif text-lg font-bold text-foreground">
                Kurumsal Kimlik &amp; Marka Yapılandırması
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Ajans Ticari Adı
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-medium text-foreground focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Özel Alt Alan Adı (Subdomain Slug)
                </label>
                <div className="flex items-center rounded-xl border border-border bg-background overflow-hidden focus-within:border-gold-500">
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) =>
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                    }
                    className="flex-1 bg-transparent px-3.5 py-2.5 text-sm font-mono text-gold-400 outline-none"
                  />
                  <span className="px-3.5 py-2.5 bg-card/80 border-l border-border text-muted-foreground font-mono">
                    .emlaksaas.com
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Ajans Logo URL (Cloudinary / SVG)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-foreground focus:border-gold-500 focus:outline-none"
                />
              </div>

              {/* Brand Accent Color Picker */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Marka Vurgu Rengi (Theme Accent)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {LUXURY_COLOR_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => setThemeColor(swatch.hex)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                        themeColor.toUpperCase() === swatch.hex.toUpperCase()
                          ? "border-gold-500 bg-gold-500/10 text-foreground font-bold"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-white/20"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <span>{swatch.name}</span>
                    </button>
                  ))}

                  <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 cursor-pointer">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="h-5 w-6 cursor-pointer bg-transparent border-0 p-0"
                    />
                    <span className="font-mono text-foreground">{themeColor}</span>
                  </label>
                </div>
              </div>

              {/* Theme & Language Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Varsayılan Arayüz Teması
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDefaultTheme("dark");
                        setTheme("dark");
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 font-semibold transition-all ${
                        (theme || defaultTheme) === "dark"
                          ? "border-gold-500 bg-gold-500/15 text-gold-400"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                      <span>Obsidian Dark</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDefaultTheme("light");
                        setTheme("light");
                      }}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 font-semibold transition-all ${
                        theme === "light"
                          ? "border-gold-500 bg-gold-500/15 text-gold-400"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                      <span>Ivory Light</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Varsayılan Vitrin Dili
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
                    <Globe className="h-4 w-4 text-gold-400 shrink-0" />
                    <select
                      value={defaultLocale}
                      onChange={(e) =>
                        setDefaultLocale(e.target.value as "tr" | "en")
                      }
                      className="w-full bg-transparent text-xs font-semibold text-foreground outline-none"
                    >
                      <option value="tr">Türkçe (TR - Accept-Language)</option>
                      <option value="en">English (EN - International)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Button type="submit" variant="gold" disabled={isSaving} className="gap-2">
                <Save className="h-4 w-4" />
                <span>
                  {isSaving ? "Kaydediliyor..." : "Ayarları & Temayı Kaydet"}
                </span>
              </Button>
            </div>
          </form>

          {/* Right: Live White-Label Preview & Service Integrations */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live White-Label Card Preview */}
            <div className="rounded-2xl border border-gold-500/30 bg-card/70 p-6 backdrop-blur-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Canlı White-Label Portal Önizlemesi</span>
                </span>
                <Badge variant="gold" className="text-[10px]">
                  Live
                </Badge>
              </div>

              <div
                className="rounded-2xl border p-5 bg-[#06070a] space-y-4 transition-all"
                style={{ borderColor: `${themeColor}55` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-black font-bold shadow-lg"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Gem className="h-5 w-5" />
                  </div>
                  <div className="truncate">
                    <p className="font-serif text-base font-bold text-white truncate">
                      {name || "Lumière Prime Estates"}
                    </p>
                    <p
                      className="text-[11px] font-mono truncate"
                      style={{ color: themeColor }}
                    >
                      https://{slug || "lumiere-prime"}.emlaksaas.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-neutral-400">
                  <span>Özel Vitrin &amp; VR Tur</span>
                  <span
                    className="rounded-full px-2.5 py-0.5 font-semibold text-black"
                    style={{ backgroundColor: themeColor }}
                  >
                    Aktif Tenant
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Integration Health Status */}
            <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-border/70 pb-3">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h3 className="font-serif text-base font-bold text-foreground">
                  SaaS Altyapı &amp; Entegrasyon Durumu
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { label: "NextAuth JWT & RBAC Koruması", status: "Aktif" },
                  { label: "Prisma PostgreSQL + pgvector (1536d)", status: "Hazır" },
                  { label: "Cloudinary Medya & 360° CDN", status: "Bağlı" },
                  { label: "Google Gemini 1.5 Flash SEO / GEO", status: "Aktif" },
                  { label: "Mapbox GL Dark/Light Harita", status: "Hazır" },
                ].map((srv) => (
                  <div
                    key={srv.label}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-3.5 py-2.5"
                  >
                    <span className="font-medium text-foreground">{srv.label}</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {srv.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

