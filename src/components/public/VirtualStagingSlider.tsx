"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Sparkles,
  SlidersHorizontal,
  Check,
  Maximize2,
  Minimize2,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export interface StagingConceptOption {
  id: string;
  name: string;
  afterImage: string;
  description: string;
  specs: string[];
}

export interface VirtualStagingSliderProps {
  beforeImage?: string;
  afterImage?: string;
  roomName?: string;
  propertyId?: string;
  className?: string;
}

const STAGING_CONCEPTS: StagingConceptOption[] = [
  {
    id: "modern-minimalist",
    name: "Modern Minimalist",
    afterImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    description:
      "İtalyan Minotti keten modüler koltuk takımı, yekpare traverten orta sehpa ve gizli tavan LED aydınlatma kanalları.",
    specs: ["Minotti Modüler Koltuk", "Traverten Orta Sehpa", "Flos Gömme LED", "Geniş Açı Günışığı"],
  },
  {
    id: "luxury-classic",
    name: "Lüks Neoklasik",
    afterImage:
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85",
    description:
      "Macar kesim chevron meşe parke, Calacatta mermer şömine çerçevesi, el yapımı pirinç avize ve Fransız duvar çıtaları.",
    specs: ["Macar Kesim Meşe", "Calacatta Şömine", "24K Altın Detaylar", "Kadife Oturma Grubu"],
  },
  {
    id: "scandinavian",
    name: "İskandinav & Meşe",
    afterImage:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
    description:
      "Beyazlatılmış doğal meşe zemin, organik yün dokuma halı, Hans Wegner koltuklar ve ferah pastoral aydınlatma.",
    specs: ["Hans Wegner Koltuk", "Organik Dokuma Yün", "Masif Açık Meşe", "Naturel Ketenler"],
  },
  {
    id: "japandi",
    name: "Japandi (Zen Lüksü)",
    afterImage:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85",
    description:
      "Koyu ceviz ahşap bölücü çıtalar, alçak platform oturma ünitesi, el yapımı seramikler ve Wabi-Sabi dinginliği.",
    specs: ["Ceviz Bölücü Çıtalar", "Alçak Platform Sedir", "Washi Kağıt Lambader", "Bonsai Heykeli"],
  },
];

export function VirtualStagingSlider({
  beforeImage = "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85",
  afterImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
  roomName = "Ana Salon & Şömine Hattı",
  propertyId,
  className = "",
}: VirtualStagingSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [activeConceptId, setActiveConceptId] = useState("modern-minimalist");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customStagedImage, setCustomStagedImage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const currentConcept =
    STAGING_CONCEPTS.find((c) => c.id === activeConceptId) || STAGING_CONCEPTS[0];

  const currentAfterImage = customStagedImage || currentConcept.afterImage || afterImage;

  // Slider move calculations
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Trigger live AI generation via API
  const handleGenerateLiveStaging = async (conceptId: string) => {
    setActiveConceptId(conceptId);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/staging", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emptyImageUrl: beforeImage,
          concept: conceptId,
          roomLabel: roomName,
          propertyId: propertyId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.stagedImageUrl) {
          setCustomStagedImage(data.stagedImageUrl);
        }
      }
    } catch (err) {
      console.warn("Live staging API error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Concept Selector Pills Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-border bg-card/60 p-1.5 backdrop-blur-xl no-scrollbar">
          <span className="text-[10px] font-bold text-gold-500 uppercase px-2 hidden sm:inline">
            Stil Seçimi:
          </span>
          {STAGING_CONCEPTS.map((c) => {
            const isActive = c.id === activeConceptId;
            return (
              <button
                key={c.id}
                onClick={() => handleGenerateLiveStaging(c.id)}
                className={`relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gold-gradient text-black shadow-md font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                <span>{c.name}</span>
                {isActive && <Check className="h-3 w-3 stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {/* Quick View Controls: 100% Empty / 50% Split / 100% Staged */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 p-1 text-[11px] font-medium text-muted-foreground">
          <button
            onClick={() => setSliderPosition(100)}
            className={`rounded-lg px-2.5 py-1 transition-colors ${
              sliderPosition >= 99 ? "bg-card text-foreground font-semibold" : "hover:text-foreground"
            }`}
          >
            Boş Hali
          </button>
          <button
            onClick={() => setSliderPosition(50)}
            className={`rounded-lg px-2.5 py-1 transition-colors ${
              sliderPosition > 1 && sliderPosition < 99
                ? "bg-gold-500/20 text-gold-400 font-semibold"
                : "hover:text-foreground"
            }`}
          >
            Yarı Yarıya (50/50)
          </button>
          <button
            onClick={() => setSliderPosition(0)}
            className={`rounded-lg px-2.5 py-1 transition-colors ${
              sliderPosition <= 1 ? "bg-card text-foreground font-semibold" : "hover:text-foreground"
            }`}
          >
            Eşyalı Hali
          </button>
        </div>
      </div>

      {/* Main Before / After Comparison Slider Container */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="group relative aspect-[16/9] w-full select-none overflow-hidden rounded-2xl sm:rounded-3xl border border-gold-500/30 bg-[#06070a] shadow-[0_20px_50px_rgba(0,0,0,0.9)] cursor-ew-resize"
      >
        {/* Background Layer: AFTER (AI Virtual Staged) */}
        <div className="absolute inset-0">
          <Image
            src={currentAfterImage}
            alt={`${roomName} - AI Staged`}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />

          {/* Top Right Staged Badge */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <Badge
              variant="staged"
              className="shadow-xl backdrop-blur-xl border border-purple-500/30 bg-purple-950/80 text-purple-200"
            >
              <Sparkles className="h-3 w-3 text-purple-300" />
              <span>AI Eşyalı: {currentConcept.name}</span>
            </Badge>
          </div>
        </div>

        {/* Foreground Clipped Layer: BEFORE (Raw / Unfurnished) */}
        <div
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
          className="absolute inset-0 z-20"
        >
          <Image
            src={beforeImage}
            alt={`${roomName} - Boş Hali`}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />

          {/* Top Left Raw Badge */}
          <div className="absolute top-4 left-4 z-10">
            <Badge
              variant="outline"
              className="border-white/20 bg-[#06070a]/80 text-zinc-300 backdrop-blur-xl shadow-xl"
            >
              <span>Ham / Boş Alan</span>
            </Badge>
          </div>
        </div>

        {/* Vertical Gold Divider Slider Line */}
        <div
          style={{ left: `${sliderPosition}%` }}
          className="absolute top-0 bottom-0 z-30 w-1 -translate-x-1/2 bg-gradient-to-b from-gold-300 via-gold-500 to-gold-400 shadow-[0_0_20px_rgba(212,175,55,0.85)]"
        >
          {/* Center Drag Handle Badge */}
          <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gold-400 bg-[#06070a]/90 text-gold-400 shadow-[0_0_25px_rgba(212,175,55,0.6)] backdrop-blur-md group-hover:scale-110 transition-transform">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
        </div>

        {/* Bottom Floating Info Pill: Room & Interaction Hint */}
        <div className="absolute bottom-4 left-4 z-30 flex items-center gap-3 rounded-2xl border border-gold-500/25 bg-[#06070a]/85 px-4 py-2 backdrop-blur-xl">
          <div>
            <p className="font-serif text-xs font-bold text-white tracking-wide">
              {roomName}
            </p>
            <p className="text-[10px] text-zinc-400">
              Kıyaslamak için altın çizgiyi sağa / sola sürükleyin
            </p>
          </div>
        </div>

        {/* Top Right Controls: Fullscreen Toggle */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-[#06070a]/80 text-zinc-300 hover:text-white hover:border-gold-500/40 transition-colors backdrop-blur-md"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* AI Generating Loading Overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#06070a]/85 backdrop-blur-md"
            >
              <div className="relative flex items-center justify-center">
                <div className="h-14 w-14 animate-spin rounded-full border-2 border-gold-500/20 border-t-gold-500" />
                <Sparkles className="absolute h-6 w-6 text-gold-400 animate-pulse" />
              </div>
              <p className="mt-4 font-serif text-sm font-bold text-white tracking-wide">
                ControlNet Yapay Zekâsı Odayı Eşyalandırıyor...
              </p>
              <p className="mt-1 text-xs text-gold-300">
                1:1 Mimari Ölçek • {currentConcept.name} Konsepti
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Architecture & Furniture Specifications Ribbon */}
      <div className="rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <h5 className="font-serif text-sm font-bold text-foreground">
                {currentConcept.name} Konsept Özellikleri
              </h5>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentConcept.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentConcept.specs.map((spec, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 rounded-xl border border-gold-500/20 bg-gold-500/5 px-2.5 py-1 text-[11px] font-medium text-gold-400"
              >
                <CheckCircle2 className="h-3 w-3 text-gold-500 shrink-0" />
                <span>{spec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
