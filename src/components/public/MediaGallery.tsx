"use client";

import React, { useState } from "react";
import {
  Compass,
  Film,
  Box,
  Plane,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { VirtualTour, type VirtualTourRoom } from "@/components/public/VirtualTour";
import { BimViewer3D } from "@/components/public/BimViewer3D";
import { LuxuryVideoPlayer } from "@/components/public/LuxuryVideoPlayer";

export type MediaGalleryTab = "virtual-tour" | "drone" | "video" | "bim-3d";

export interface MediaGalleryProps {
  propertyTitle?: string;
  media?: Array<{
    id: string;
    url: string;
    type: string;
    roomLabel?: string | null;
    isStaged?: boolean;
  }>;
  virtualTourRooms?: VirtualTourRoom[];
  droneVideoUrl?: string;
  promoVideoUrl?: string;
  bimModelUrl?: string;
  initialTab?: MediaGalleryTab;
  className?: string;
}

// Default luxury video assets
const DEFAULT_DRONE_VIDEO =
  "https://res.cloudinary.com/demo/video/upload/wave.mp4";
const DEFAULT_PROMO_VIDEO =
  "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4";

export function MediaGallery({
  propertyTitle = "The Bosphorus Waterfront Palace",
  media = [],
  virtualTourRooms,
  droneVideoUrl,
  promoVideoUrl,
  bimModelUrl,
  initialTab = "virtual-tour",
  className = "",
}: MediaGalleryProps) {
  const [activeTab, setActiveTab] = useState<MediaGalleryTab>(initialTab);

  // Extract from media if available
  const droneMedia = media.find((m) => m.type === "DRONE")?.url || droneVideoUrl || DEFAULT_DRONE_VIDEO;
  const promoMedia = media.find((m) => m.type === "VIDEO")?.url || promoVideoUrl || DEFAULT_PROMO_VIDEO;
  const bimMedia = media.find((m) => m.type === "BIM_3D")?.url || bimModelUrl;

  const tabsConfig = [
    {
      id: "virtual-tour" as MediaGalleryTab,
      label: "360° Sanal Tur",
      icon: Compass,
      badge: "Canlı VR",
      desc: "İç mekân keşfi, interaktif hotspotlar ve odalar arası 3D geçiş",
    },
    {
      id: "drone" as MediaGalleryTab,
      label: "Drone Uçuşu",
      icon: Plane,
      badge: "4K UHD Hava",
      desc: "Kuşbakışı sahil şeridi, özel iskele ve parsel sınırları analizi",
    },
    {
      id: "video" as MediaGalleryTab,
      label: "Tanıtım Videosu",
      icon: Film,
      badge: "Sinematik",
      desc: "Mimari detaylar ve yaşam alanlarının özel kurgulu tanıtımı",
    },
    {
      id: "bim-3d" as MediaGalleryTab,
      label: "3D Proje (BIM)",
      icon: Box,
      badge: "Dijital İkiz",
      desc: "WebGL tabanlı döndürülebilir dış cephe, kat planı ve kesit modeli",
    },
  ];

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Top Header & Tab Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
              Çoklu Medya & Görselleştirme
            </span>
            <span className="inline-block h-1 w-1 rounded-full bg-gold-400" />
            <Badge variant="gold" className="text-[10px]">
              Multi-Format
            </Badge>
          </div>
          <h3 className="font-serif text-2xl font-bold text-foreground mt-0.5">
            İnteraktif Medya & Keşif Galerisi
          </h3>
        </div>

        {/* Modern Luxury Tabs Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-border bg-card/80 p-1.5 backdrop-blur-xl shadow-lg no-scrollbar">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? "text-black shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                }`}
              >
                {/* Active Gold Background Pill Animation */}
                {isActive && (
                  <motion.div
                    layoutId="activeMediaGalleryTab"
                    className="absolute inset-0 rounded-xl bg-gold-gradient shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Description Ribbon */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <p className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-gold-400 shrink-0" />
          <span>{tabsConfig.find((t) => t.id === activeTab)?.desc}</span>
        </p>

        <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
          {propertyTitle}
        </span>
      </div>

      {/* Main Content Viewport Switcher */}
      <div className="relative w-full">
        <AnimatePresence mode="wait">
          {/* TAB 1: 360° Sanal Tur */}
          {activeTab === "virtual-tour" && (
            <motion.div
              key="virtual-tour"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <VirtualTour
                propertyTitle={propertyTitle}
                media={media}
                customRooms={virtualTourRooms}
              />
            </motion.div>
          )}

          {/* TAB 2: Drone Uçuşu */}
          {activeTab === "drone" && (
            <motion.div
              key="drone"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <LuxuryVideoPlayer
                src={droneMedia}
                title="4K Sinematik Drone Uçuşu & Parsel Keşfi"
                subtitle="Sahil Hattı, Boğaz Cephesi ve Özel İskele"
                badgeText="4K UHD Drone"
              />
            </motion.div>
          )}

          {/* TAB 3: Tanıtım Videosu */}
          {activeTab === "video" && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <LuxuryVideoPlayer
                src={promoMedia}
                title="Resmi Tanıtım Filmi & İç Mekân Tasarımı"
                subtitle="Mimari Detaylar, Sanat Koleksiyonu & Yaşam Alanı"
                badgeText="Sinematik Tanıtım"
              />
            </motion.div>
          )}

          {/* TAB 4: 3D Proje (BIM) */}
          {activeTab === "bim-3d" && (
            <motion.div
              key="bim-3d"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <BimViewer3D
                modelUrl={bimMedia}
                propertyTitle={propertyTitle}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

