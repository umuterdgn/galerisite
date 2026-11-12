"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Globe,
  Bot,
  CheckCircle2,
  Copy,
  Check,
  Save,
  Search,
  SlidersHorizontal,
  Star,
  Building,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface SeoPropertyOption {
  id: string;
  title: string;
  city: string;
  district: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  amenities: string[];
}

const PRESET_PROPERTIES: SeoPropertyOption[] = [
  {
    id: "prop-1",
    title: "The Bosphorus Waterfront Palace",
    city: "İstanbul",
    district: "Yeniköy / Sarıyer",
    price: 42500000,
    currency: "EUR",
    bedrooms: 8,
    bathrooms: 9,
    squareMeters: 1450,
    amenities: [
      "Özel Yat İskelesi (Deep-water Dock)",
      "Helikopter Pisti",
      "Sonsuzluk Boğaz Havuzu",
      "Klimatize Şarap Mahzeni",
      "Özel Türk Hamamı & Spa",
    ],
  },
  {
    id: "prop-2",
    title: "Villa Belle Époque",
    city: "Antibes",
    district: "Cap d'Antibes",
    price: 38000000,
    currency: "EUR",
    bedrooms: 7,
    bathrooms: 8,
    squareMeters: 980,
    amenities: [
      "Özel Deniz Koyu & Güverte",
      "Isıtmalı Sonsuzluk Havuzu",
      "Panoramik Akdeniz Terası",
      "Gaggenau Şef Mutfağı",
    ],
  },
  {
    id: "prop-4",
    title: "Yalıkavak Cliffside Private Estate",
    city: "Muğla",
    district: "Bodrum / Yalıkavak",
    price: 18500000,
    currency: "EUR",
    bedrooms: 6,
    bathrooms: 7,
    squareMeters: 860,
    amenities: [
      "Ege Denizi Gün Batımı Manzarası",
      "Doğal Taş Mimari",
      "Açık Sonsuzluk Havuzu",
      "Yalıkavak Marina Manzarası",
    ],
  },
];

export function SeoGeoGeneratorForm() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("prop-4");

  // Form Field States
  const [title, setTitle] = useState("Yalıkavak Cliffside Private Estate");
  const [city, setCity] = useState("Muğla");
  const [district, setDistrict] = useState("Bodrum / Yalıkavak");
  const [price, setPrice] = useState(18500000);
  const [currency, setCurrency] = useState("EUR");
  const [bedrooms, setBedrooms] = useState(6);
  const [bathrooms, setBathrooms] = useState(7);
  const [squareMeters, setSquareMeters] = useState(860);
  const [amenitiesInput, setAmenitiesInput] = useState(
    "Ege Denizi Gün Batımı Manzarası, Doğal Taş Mimari, Açık Sonsuzluk Havuzu, Yalıkavak Marina Manzarası, Helikopter Pisti"
  );

  // Generated SEO & GEO States
  const [seoTitle, setSeoTitle] = useState(
    "Bodrum Yalıkavak'ta Kapanmaz Deniz Manzaralı, Ultra Lüks 6+1 Villa"
  );
  const [seoDesc, setSeoDesc] = useState(
    "Bodrum Yalıkavak'ta 860 m² alanda 6+1 ultra lüks taş villa. Kesintisiz Ege gün batımı ve marina manzarası, €18.500.000. VIP sunum için hemen randevu alın."
  );
  const [schemaJsonText, setSchemaJsonText] = useState(
    JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: "Bodrum Yalıkavak'ta Kapanmaz Deniz Manzaralı, Ultra Lüks 6+1 Villa",
        description:
          "Bodrum Yalıkavak'ta 860 m² alanda 6+1 ultra lüks taş villa. Kesintisiz Ege gün batımı ve marina manzarası, €18.500.000. VIP sunum için hemen randevu alın.",
        category: "Luxury Residential Real Estate",
        offers: {
          "@type": "Offer",
          price: "18500000",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "RealEstateAgent",
            name: "Lumière Prime Estates",
            telephone: "+90 (212) 800 40 50",
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.96",
              reviewCount: "54",
            },
          },
        },
        about: {
          "@type": "SingleFamilyResidence",
          numberOfRooms: 7,
          numberOfBedrooms: 6,
          numberOfBathroomsTotal: 7,
          floorSize: { "@type": "QuantitativeValue", value: 860, unitCode: "MTK" },
          address: {
            "@type": "PostalAddress",
            addressLocality: "Muğla",
            addressRegion: "Bodrum / Yalıkavak",
            addressCountry: "TR",
          },
        },
      },
      null,
      2
    )
  );
  const [geoSummary, setGeoSummary] = useState(
    "Bodrum Yalıkavak bölgesinde yer alan mülk, 860 m² kapalı alanı, 6+1 planı ve €18.500.000 liste fiyatıyla Ege kıyılarında en yüksek yatırım getirisi ve prestije sahip özel malikaneler arasında yer alır."
  );
  const [engineUsed, setEngineUsed] = useState<string>("Google Gemini 1.5 Flash / GEO");

  // UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [previewTab, setPreviewTab] = useState<"serp" | "geo">("serp");

  // Handle Preset Selection
  const handleSelectPreset = (propId: string) => {
    setSelectedPropertyId(propId);
    const found = PRESET_PROPERTIES.find((p) => p.id === propId);
    if (found) {
      setTitle(found.title);
      setCity(found.city);
      setDistrict(found.district);
      setPrice(found.price);
      setCurrency(found.currency);
      setBedrooms(found.bedrooms);
      setBathrooms(found.bathrooms);
      setSquareMeters(found.squareMeters);
      setAmenitiesInput(found.amenities.join(", "));
    }
  };

  // Generate SEO & GEO via API
  const handleGenerateSeo = async () => {
    setIsGenerating(true);
    setStatusMessage(null);

    const amenitiesArray = amenitiesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/ai/seo-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedPropertyId || undefined,
          title,
          city,
          district,
          price,
          currency,
          bedrooms,
          bathrooms,
          squareMeters,
          amenities: amenitiesArray,
          saveToDb: false, // Emlakçı kontrol ettikten sonra manuel kaydeder
        }),
      });

      if (!res.ok) {
        throw new Error(`API hatası: ${res.status}`);
      }

      const data = await res.json();

      if (data.seoTitle) setSeoTitle(data.seoTitle);
      if (data.seoDesc) setSeoDesc(data.seoDesc);
      if (data.schemaJson) {
        setSchemaJsonText(JSON.stringify(data.schemaJson, null, 2));
      }
      if (data.geoSummary) setGeoSummary(data.geoSummary);
      if (data.engine) setEngineUsed(data.engine);

      setStatusMessage({
        type: "success",
        text: `✨ Yapay zeka ile SEO & GEO verileri başarıyla üretildi! Metinleri inceleyip dilediğiniz gibi düzenleyebilirsiniz.`,
      });
    } catch (err) {
      console.error("SEO generate error:", err);
      setStatusMessage({
        type: "error",
        text: "SEO verileri üretilirken bir hata oluştu. Lütfen girdileri kontrol edin.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save / Update to Prisma Database
  const handleSaveToPrisma = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      let parsedSchema: Record<string, unknown> = {};
      try {
        parsedSchema = JSON.parse(schemaJsonText);
      } catch {
        throw new Error("Schema JSON formatı geçerli değil. Lütfen sözdizimini kontrol edin.");
      }

      const res = await fetch("/api/ai/seo-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedPropertyId,
          title,
          city,
          district,
          price,
          currency,
          saveToDb: true,
          seoTitle,
          seoDesc,
          schemaJson: parsedSchema,
        }),
      });

      const data = await res.json();
      if (res.ok && data.savedToDb) {
        setStatusMessage({
          type: "success",
          text: `✅ SEO Başlığı, 150-160k Meta Açıklaması ve Schema.org JSON-LD veritabanına başarıyla kaydedildi!`,
        });
      } else {
        setStatusMessage({
          type: "info",
          text: `ℹ️ SEO verileri hazırlandı ve senkronize edildi (${data.saveError || "Lokal Mod"}).`,
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: (err as Error).message || "Kaydetme başarısız oldu.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Copy Schema.org JSON-LD to Clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(schemaJsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const descLength = seoDesc.length;
  const isDescPerfectLength = descLength >= 145 && descLength <= 165;

  return (
    <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-2xl p-6 sm:p-8 shadow-xl space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
              Yapay Zekâ SEO / GEO Otomasyonu
            </span>
            <span className="inline-block h-1 w-1 rounded-full bg-gold-400" />
            <Badge variant="gold" className="text-[10px]">
              Google Gemini & Schema.org
            </Badge>
          </div>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Arama Motoru & Generative AI Optimizasyonu</span>
            <Sparkles className="h-6 w-6 text-gold-400" />
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
            İlan verilerini saniyeler içinde Google SERP ve Yapay Zekâ sohbet botları (Perplexity, ChatGPT, Gemini Search) için Rich Snippet uyumlu JSON-LD ve tıklama mıknatısı başlıklara dönüştürün.
          </p>
        </div>

        {/* Selected Preset Property Selector */}
        <div className="flex items-center gap-2 bg-background/80 border border-border rounded-xl p-1.5 self-start sm:self-auto">
          <Building className="h-4 w-4 text-gold-400 ml-2 shrink-0" />
          <select
            value={selectedPropertyId}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-transparent text-xs text-foreground font-medium outline-none pr-3 py-1 cursor-pointer"
          >
            <option value="new">+ Yeni İlan Girişi</option>
            {PRESET_PROPERTIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Inputs (Left) and AI SEO Output / Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* =========================================================================
            LEFT COLUMN: Property Raw Inputs (Temel Veriler)
            ========================================================================= */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-gold-400" />
              <span>İlanın Temel Parametreleri</span>
            </h3>
            <span className="text-[11px] text-muted-foreground">Adım 1</span>
          </div>

          <div className="space-y-4 rounded-xl border border-border/80 bg-background/50 p-4 sm:p-5">
            {/* Title */}
            <div>
              <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                İlan Adı / Mülk Başlığı
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-gold-500 focus:outline-none"
              />
            </div>

            {/* City & District */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                  Şehir (İl)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                  İlçe / Bölge
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-gold-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Price & Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                  Fiyat
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                  Birim
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-2 py-2 text-xs font-medium text-foreground focus:border-gold-500 focus:outline-none"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="TRY">TRY (₺)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            {/* Bedrooms, Bathrooms, M2 */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                  Yatak Odası
                </label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                  Banyo
                </label>
                <input
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                  Net m²
                </label>
                <input
                  type="number"
                  value={squareMeters}
                  onChange={(e) => setSquareMeters(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-gold-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-[11px] font-semibold text-foreground uppercase tracking-wider mb-1">
                Öne Çıkan Lüks Donatılar (Virgülle ayırın)
              </label>
              <textarea
                rows={2}
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-gold-500 focus:outline-none resize-none"
              />
            </div>

            {/* AI Generator Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateSeo}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-gold-500 bg-gold-gradient py-3 text-xs sm:text-sm font-bold text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:brightness-110 active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-black" />
                    <span>Gemini ile SEO & GEO Üretiliyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-black animate-pulse" />
                    <span>Yapay Zekâ ile SEO & GEO Üret</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Editable Output & Live SERP / GEO Previews
            ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-gold-400" />
              <span>Üretilen SEO/GEO Verileri & Canlı Düzenleme</span>
            </h3>
            <Badge variant="outline" className="text-[10px] text-gold-400 border-gold-500/30">
              {engineUsed}
            </Badge>
          </div>

          {/* Status Message Alert */}
          {statusMessage && (
            <div
              className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
                statusMessage.type === "success"
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : statusMessage.type === "error"
                  ? "border border-red-500/30 bg-red-500/10 text-red-400"
                  : "border border-gold-500/30 bg-gold-500/10 text-gold-400"
              }`}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Editable Field 1: SEO Title */}
          <div className="space-y-1.5 rounded-xl border border-border bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span>1. SEO Başlığı (Title)</span>
                <span className="text-[10px] text-gold-400 font-normal">
                  (Google SERP Tıklama Mıknatısı)
                </span>
              </label>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {seoTitle.length} / 65 karakter
              </span>
            </div>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-foreground focus:border-gold-500 focus:outline-none"
            />
          </div>

          {/* Editable Field 2: Meta Description with 150-160 char indicator */}
          <div className="space-y-1.5 rounded-xl border border-border bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span>2. Meta Açıklama (Description)</span>
                <span className="text-[10px] text-gold-400 font-normal">
                  (Hedef: 150 - 160 Karakter)
                </span>
              </label>
              <span
                className={`text-[11px] font-bold ${
                  isDescPerfectLength ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {descLength} karakter {isDescPerfectLength ? "✓ Mükemmel" : "⚠ Hedef 150-160"}
              </span>
            </div>
            <textarea
              rows={3}
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3.5 py-2 text-xs sm:text-sm font-normal text-foreground focus:border-gold-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Editable Field 3: Schema.org RealEstateListing JSON-LD */}
          <div className="space-y-1.5 rounded-xl border border-border bg-background/50 p-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <span>3. Schema.org &quot;RealEstateListing&quot; JSON-LD</span>
                <span className="text-[10px] text-gold-400 font-normal">
                  (Google Rich Snippets)
                </span>
              </label>
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Kodu Kopyala</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={6}
              value={schemaJsonText}
              onChange={(e) => setSchemaJsonText(e.target.value)}
              className="w-full font-mono text-[11px] rounded-lg border border-border bg-card/90 px-3 py-2 text-gold-300 focus:border-gold-500 focus:outline-none leading-normal"
            />
          </div>

          {/* =========================================================================
              LIVE PREVIEWS: Google SERP vs AI GEO Preview
              ========================================================================= */}
          <div className="rounded-xl border border-gold-500/30 bg-card/60 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border/70 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewTab("serp")}
                  className={`flex items-center gap-1.5 text-xs font-bold pb-1 transition-all ${
                    previewTab === "serp"
                      ? "text-gold-400 border-b-2 border-gold-500"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Google Arama Sonucu Önizlemesi (SERP)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("geo")}
                  className={`flex items-center gap-1.5 text-xs font-bold pb-1 transition-all ${
                    previewTab === "geo"
                      ? "text-gold-400 border-b-2 border-gold-500"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Bot className="h-3.5 w-3.5 text-purple-400" />
                  <span>Yapay Zekâ Motoru (GEO / Perplexity) Önizlemesi</span>
                </button>
              </div>
            </div>

            {previewTab === "serp" ? (
              /* Google SERP Preview Card */
              <div className="space-y-1.5 p-3 rounded-lg bg-[#202124] text-left border border-white/10 font-sans">
                <div className="flex items-center gap-2 text-[11px] text-[#bdc1c6]">
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gold-500/20 text-[9px] text-gold-400 font-bold">
                    L
                  </div>
                  <span className="truncate">lumiere.luxury &gt; properties &gt; {selectedPropertyId}</span>
                </div>
                <h4 className="text-sm sm:text-base font-medium text-[#8ab4f8] hover:underline cursor-pointer line-clamp-1">
                  {seoTitle}
                </h4>
                {/* Rich Snippet Details */}
                <div className="flex items-center gap-2 text-xs text-[#bdc1c6] pt-0.5">
                  <div className="flex items-center text-amber-400">
                    <Star className="h-3 w-3 fill-amber-400" />
                    <Star className="h-3 w-3 fill-amber-400" />
                    <Star className="h-3 w-3 fill-amber-400" />
                    <Star className="h-3 w-3 fill-amber-400" />
                    <Star className="h-3 w-3 fill-amber-400" />
                  </div>
                  <span className="font-semibold text-white">4.96 (54)</span>
                  <span>·</span>
                  <span className="font-semibold text-emerald-400">
                    €{Number(price).toLocaleString("tr-TR")}
                  </span>
                  <span>·</span>
                  <span className="text-xs text-[#9aa0a6]">Stokta / Satılık</span>
                </div>
                <p className="text-xs text-[#bdc1c6] line-clamp-2 leading-relaxed pt-1">
                  {seoDesc}
                </p>
              </div>
            ) : (
              /* GEO (Generative Engine Optimization) Preview */
              <div className="space-y-2 p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 text-left">
                <div className="flex items-center justify-between text-xs text-purple-300">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-purple-400" />
                    <span>Perplexity &amp; ChatGPT Search Sentez Yanıtı</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">Kaynak: Schema.org Listing</span>
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed italic">
                  &quot;{geoSummary}&quot;
                </p>
                <div className="flex items-center gap-2 pt-1 border-t border-purple-500/20 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-purple-400">Doğrulanmış Kaynak:</span>
                  <span className="truncate">Lumière Prime Estates B2B Platform (Schema InStock)</span>
                </div>
              </div>
            )}
          </div>

          {/* Action: Save To Database (Prisma) */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              İlan ID: <code className="text-gold-400">{selectedPropertyId}</code>
            </span>

            <Button
              type="button"
              variant="gold"
              onClick={handleSaveToPrisma}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  <span>Veritabanına Kaydediliyor...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 text-black" />
                  <span>SEO Verilerini Prisma&apos;ya Kaydet</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
