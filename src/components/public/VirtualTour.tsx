"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Compass,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Info,
  Glasses,
  Smartphone,
  Play,
  Pause,
  X,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { Viewer } from "@photo-sphere-viewer/core";
import type { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import type { VirtualTourPlugin } from "@photo-sphere-viewer/virtual-tour-plugin";
import type { GyroscopePlugin } from "@photo-sphere-viewer/gyroscope-plugin";
import type { StereoPlugin } from "@photo-sphere-viewer/stereo-plugin";
import type { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";

// Types
export interface VirtualTourHotspot {
  id: string;
  yaw: number;
  pitch: number;
  category: string;
  title: string;
  description: string;
  spec?: string;
  iconType?: "kitchen" | "heating" | "security" | "fireplace" | "sound" | "light" | "bath" | "wardrobe" | "general" | "sun";
}

export interface VirtualTourRoom {
  id: string;
  name: string;
  caption: string;
  panorama: string;
  thumbnail?: string;
  links: Array<{
    nodeId: string;
    yaw: number;
    pitch: number;
    name?: string;
  }>;
  hotspots?: VirtualTourHotspot[];
}

export interface VirtualTourProps {
  propertyTitle?: string;
  media?: Array<{
    id: string;
    url: string;
    type: string;
    roomLabel?: string | null;
    isStaged?: boolean;
  }>;
  initialRoomId?: string;
  customRooms?: VirtualTourRoom[];
  className?: string;
}

export function VirtualTour({
  propertyTitle = "Seçili İlan",
  media = [],
  initialRoomId = "giris",
  customRooms,
  className = "",
}: VirtualTourProps) {
  // If Prisma Media contains PANORAMA_360 items, combine or map them strictly per property
  const mediaRef = useRef(media);
  mediaRef.current = media;
  const customRoomsRef = useRef(customRooms);
  customRoomsRef.current = customRooms;

  const roomsKey = React.useMemo(() => {
    if (customRooms && customRooms.length > 0) {
      return customRooms
        .filter((r) => Boolean(r.panorama))
        .map(
          (r) =>
            `${r.id}:${r.name}:${typeof r.panorama === "string" ? r.panorama : "cube"}:${(r.links || []).length}:${(r.hotspots || []).length}`
        )
        .join("|");
    }
    return media
      .filter((m) => m.type === "PANORAMA_360" && Boolean(m.url))
      .map((m) => `${m.id}:${m.url}:${m.roomLabel || ""}`)
      .join("|");
  }, [media, customRooms]);

  // Build room list strictly from customRooms prop or Prisma PANORAMA_360 media (no mock fallback)
  const rooms = React.useMemo(() => {
    if (!roomsKey) return [];

    const latestCustomRooms = customRoomsRef.current;
    if (latestCustomRooms && latestCustomRooms.length > 0) {
      return latestCustomRooms.filter((r) => Boolean(r.panorama));
    }

    const panoramaMedia = mediaRef.current.filter(
      (m) => m.type === "PANORAMA_360" && Boolean(m.url)
    );
    if (panoramaMedia.length > 0) {
      return panoramaMedia.map((m, index) => {
        const nextMedia = panoramaMedia[(index + 1) % panoramaMedia.length];
        const prevMedia =
          panoramaMedia[(index - 1 + panoramaMedia.length) % panoramaMedia.length];

        return {
          id: m.id,
          name: m.roomLabel || `Mekân ${index + 1}`,
          caption: `${propertyTitle} - ${m.roomLabel || "360° Panoramik Görünüm"}`,
          panorama: m.url,
          thumbnail: m.url,
          links: [
            ...(panoramaMedia.length > 1
              ? [
                  {
                    nodeId: nextMedia.id,
                    yaw: 0.5,
                    pitch: -0.15,
                    name: `${nextMedia.roomLabel || "Sonraki Mekân"} Yönü`,
                  },
                  {
                    nodeId: prevMedia.id,
                    yaw: -2.6,
                    pitch: -0.15,
                    name: `${prevMedia.roomLabel || "Önceki Mekân"} Yönü`,
                  },
                ]
              : []),
          ],
          hotspots: [],
        };
      });
    }

    return [];
  }, [roomsKey, propertyTitle]);

  const [currentRoomId, setCurrentRoomId] = useState<string>(
    rooms.some((r) => r.id === initialRoomId) ? initialRoomId : rooms[0]?.id || ""
  );

  // Sync currentRoomId if the resolved room list changes
  useEffect(() => {
    if (rooms.length === 0) {
      if (currentRoomId !== "") setCurrentRoomId("");
      return;
    }
    if (!rooms.some((r) => r.id === currentRoomId)) {
      setCurrentRoomId(
        rooms.some((r) => r.id === initialRoomId) ? initialRoomId : rooms[0].id
      );
    }
  }, [rooms, currentRoomId, initialRoomId]);
  const [selectedHotspot, setSelectedHotspot] = useState<VirtualTourHotspot | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isGyroscopeActive, setIsGyroscopeActive] = useState(false);
  const [isStereoActive, setIsStereoActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [areHotspotsVisible, setAreHotspotsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const virtualTourRef = useRef<VirtualTourPlugin | null>(null);
  const markersRef = useRef<MarkersPlugin | null>(null);
  const gyroRef = useRef<GyroscopePlugin | null>(null);
  const stereoRef = useRef<StereoPlugin | null>(null);
  const autorotateRef = useRef<AutorotatePlugin | null>(null);

  // Active room data
  const currentRoom = rooms.find((r) => r.id === currentRoomId) || rooms[0];
  const currentRoomIndex = rooms.findIndex((r) => r.id === currentRoomId);

  // Build Photo Sphere Viewer Nodes
  const buildNodes = useCallback(() => {
    return rooms.map((room) => ({
      id: room.id,
      panorama: room.panorama,
      name: room.name,
      caption: room.caption,
      thumbnail: room.thumbnail,
      links: (room.links || []).map((link) => ({
        nodeId: link.nodeId,
        position: { yaw: link.yaw, pitch: link.pitch },
        name: link.name || "Sonraki Odaya Geçiş",
      })),
      markers: (room.hotspots || []).map((h) => ({
        id: h.id,
        position: { yaw: h.yaw, pitch: h.pitch },
        html: `
          <div class="psv-luxury-hotspot" data-hotspot-id="${h.id}">
            <div class="psv-luxury-hotspot-pulse"></div>
            <div class="psv-luxury-hotspot-inner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
          </div>
        `,
        size: { width: 38, height: 38 },
        anchor: "center center",
        tooltip: {
          content: `${h.title} (Detaylar için dokunun)`,
          position: "top center",
          className: "psv-luxury-tooltip",
        },
        data: h,
      })),
    }));
  }, [rooms]);

  // Initialize Photo Sphere Viewer
  useEffect(() => {
    if (!containerRef.current || rooms.length === 0) return;

    let viewer: Viewer | null = null;
    let isSubscribed = true;

    async function initViewer() {
      try {
        const { Viewer: PSVViewer } = await import("@photo-sphere-viewer/core");
        const { MarkersPlugin: PSVMarkers } = await import("@photo-sphere-viewer/markers-plugin");
        const { VirtualTourPlugin: PSVVirtualTour } = await import("@photo-sphere-viewer/virtual-tour-plugin");
        const { GyroscopePlugin: PSVGyro } = await import("@photo-sphere-viewer/gyroscope-plugin");
        const { StereoPlugin: PSVStereo } = await import("@photo-sphere-viewer/stereo-plugin");
        const { AutorotatePlugin: PSVAutorotate } = await import("@photo-sphere-viewer/autorotate-plugin");

        if (!isSubscribed || !containerRef.current) return;

        // Clean container in case of rerender
        containerRef.current.innerHTML = "";

        const nodes = buildNodes();

        viewer = new PSVViewer({
          container: containerRef.current,
          loadingTxt: "Lüks Mekân Verileri Yükleniyor...",
          defaultZoomLvl: 50,
          minFov: 30,
          maxFov: 90,
          moveSpeed: 1.1,
          zoomSpeed: 1.2,
          navbar: false, // We use our luxury bespoke UI controls
          plugins: [
            [PSVMarkers, {}],
            [
              PSVVirtualTour,
              {
                positionMode: "manual",
                renderMode: "3d",
                nodes: nodes,
                startNodeId: currentRoomId,
                transitionOptions: {
                  showLoader: true,
                  speed: "25rpm",
                  effect: "fade",
                  rotation: true,
                },
                arrowStyle: {
                  size: { width: 44, height: 44 },
                },
                showLinkTooltip: true,
              },
            ],
            [PSVGyro, {}],
            [PSVStereo, {}],
            [
              PSVAutorotate,
              {
                autostartDelay: null,
                autorotatePitch: 0,
                autorotateSpeed: "1.2rpm",
              },
            ],
          ],
        });

        viewerRef.current = viewer;

        // Cache plugin instances
        const virtualTour = viewer.getPlugin(PSVVirtualTour) as unknown as VirtualTourPlugin;
        const markers = viewer.getPlugin(PSVMarkers) as unknown as MarkersPlugin;
        const gyro = viewer.getPlugin(PSVGyro) as unknown as GyroscopePlugin;
        const stereo = viewer.getPlugin(PSVStereo) as unknown as StereoPlugin;
        const autorotate = viewer.getPlugin(PSVAutorotate) as unknown as AutorotatePlugin;

        virtualTourRef.current = virtualTour;
        markersRef.current = markers;
        gyroRef.current = gyro;
        stereoRef.current = stereo;
        autorotateRef.current = autorotate;

        // Node navigation change listener
        virtualTour.addEventListener("node-changed", (event: unknown) => {
          if (!isSubscribed) return;
          const evt = event as { node?: { id?: string } };
          const nextNodeId = evt?.node?.id;
          if (nextNodeId) {
            setCurrentRoomId((prev) => (prev === nextNodeId ? prev : nextNodeId));
            setSelectedHotspot((prev) => (prev === null ? prev : null));
          }
        });

        // Hotspot selection listener
        markers.addEventListener("select-marker", (event: unknown) => {
          if (!isSubscribed) return;
          const evt = event as { marker?: { data?: VirtualTourHotspot } };
          if (evt?.marker?.data) {
            setSelectedHotspot(evt.marker.data);
          }
        });

        // Click outside marker
        markers.addEventListener("unselect-marker", () => {
          if (!isSubscribed) return;
        });

        viewer.addEventListener("ready", () => {
          if (isSubscribed) {
            setIsLoaded(true);
          }
        });
      } catch (err) {
        console.error("VirtualTour viewer initialization failed:", err);
      }
    }

    initViewer();

    return () => {
      isSubscribed = false;
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch {
          // ignore teardown errors
        }
        viewerRef.current = null;
      }
    };
  }, [buildNodes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Room jump handler
  const handleRoomSelect = (roomId: string) => {
    if (roomId === currentRoomId) return;
    setCurrentRoomId(roomId);
    setSelectedHotspot(null);
    if (virtualTourRef.current) {
      virtualTourRef.current.setCurrentNode(roomId);
    }
  };

  // Auto-rotate toggle
  const toggleAutoRotate = () => {
    if (!autorotateRef.current) return;
    const newState = !isAutoRotating;
    setIsAutoRotating(newState);
    if (newState) {
      autorotateRef.current.start();
    } else {
      autorotateRef.current.stop();
    }
  };

  // Gyroscope toggle (Phone orientation tilt)
  const toggleGyroscope = async () => {
    if (!gyroRef.current) return;
    try {
      if (isGyroscopeActive) {
        gyroRef.current.stop();
        setIsGyroscopeActive(false);
      } else {
        await gyroRef.current.start();
        setIsGyroscopeActive(true);
      }
    } catch (e) {
      console.warn("Jiroskop sensörü bu cihazda aktif edilemedi:", e);
    }
  };

  // VR / Stereo mode toggle
  const toggleStereoVR = () => {
    if (!stereoRef.current) return;
    if (isStereoActive) {
      stereoRef.current.stop();
      setIsStereoActive(false);
    } else {
      stereoRef.current.start();
      setIsStereoActive(true);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!viewerRef.current) return;
    viewerRef.current.toggleFullscreen();
    setIsFullscreen(!isFullscreen);
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (!viewerRef.current) return;
    viewerRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (!viewerRef.current) return;
    viewerRef.current.zoomOut();
  };

  // Reset view to horizon
  const handleResetView = () => {
    if (!viewerRef.current) return;
    viewerRef.current.animate({
      yaw: 0,
      pitch: 0,
      zoom: 50,
      speed: 1000,
    });
  };

  // Toggle hotspots
  const toggleHotspotsVisibility = () => {
    if (!markersRef.current) return;
    markersRef.current.toggleAllMarkers();
    setAreHotspotsVisible(!areHotspotsVisible);
  };

  if (rooms.length === 0 || !currentRoom) {
    return (
      <div
        className={`flex h-[420px] sm:h-[520px] w-full flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-gold-500/25 bg-[#06070a] px-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] ${className}`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-500/30 bg-gold-500/10 text-gold-400">
          <Compass className="h-7 w-7 opacity-80" />
        </div>
        <h4 className="mt-4 font-serif text-lg sm:text-xl font-bold text-white">
          Bu İlan İçin Henüz 360° Sanal Tur Eklenmemiş
        </h4>
        <p className="mt-2 max-w-md text-xs sm:text-sm text-zinc-400 leading-relaxed">
          <strong className="text-gold-300">{propertyTitle}</strong> portföyüne ait 360° panoramik görseller admin panelindeki Tour Builder üzerinden yüklendiğinde burada interaktif olarak görüntülenecektir.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`group relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-gold-500/30 bg-[#06070a] shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-300 ${className}`}
    >
      {/* 360 Viewer Canvas Container */}
      <div
        ref={containerRef}
        className="relative h-[480px] w-full sm:h-[620px] md:h-[680px] cursor-grab active:cursor-grabbing"
      />

      {/* Luxury Loading Spinner Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#06070a]/90 backdrop-blur-md">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-500/20 border-t-gold-500" />
          <p className="mt-4 font-serif text-xs tracking-widest text-gold-400 uppercase">
            360° Mekân Yükleniyor...
          </p>
        </div>
      )}

      {/* Top Header Bar: Property Title & Badges */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6 bg-gradient-to-b from-[#06070a]/90 via-[#06070a]/40 to-transparent">
        <div className="pointer-events-auto flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/40 bg-[#06070a]/80 shadow-[0_0_15px_rgba(212,175,55,0.25)] backdrop-blur-md">
            <Compass className="h-4 w-4 text-gold-400 animate-[spin_20s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-widest text-gold-500 uppercase">
                Mekân {currentRoomIndex + 1} / {rooms.length}
              </span>
              <span className="inline-block h-1 w-1 rounded-full bg-gold-400" />
              <span className="text-[10px] text-zinc-400 hidden sm:inline">
                {propertyTitle}
              </span>
            </div>
            <h4 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide">
              {currentRoom.name}
            </h4>
          </div>
        </div>

        {/* Feature status pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <Badge
            variant="outline"
            className="border-gold-500/30 bg-[#06070a]/70 text-[10px] font-medium text-gold-300 backdrop-blur-md shadow-sm hidden sm:inline-flex"
          >
            <Sparkles className="mr-1 h-3 w-3 text-gold-400" />
            360° HDR Panorama
          </Badge>

          <Badge
            variant="outline"
            className={`border-gold-500/30 text-[10px] font-medium backdrop-blur-md transition-colors ${
              isStereoActive
                ? "bg-gold-500 text-black font-bold"
                : "bg-[#06070a]/70 text-zinc-300"
            }`}
          >
            <Glasses className="mr-1 h-3 w-3" />
            WebXR VR
          </Badge>
        </div>
      </div>

      {/* Floating Right Controls Sidebar (Apple minimalist luxury) */}
      <div className="absolute right-3 sm:right-5 top-20 z-20 flex flex-col gap-2 rounded-2xl border border-gold-500/25 bg-[#06070a]/80 p-1.5 shadow-2xl backdrop-blur-xl">
        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-gold-500/15 hover:text-gold-400 active:scale-95"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>

        {/* Gyroscope (Mobile sensors) */}
        <button
          onClick={toggleGyroscope}
          title="Telefon Hareketi / Jiroskop ile Gez"
          className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-all active:scale-95 ${
            isGyroscopeActive
              ? "bg-gold-500 text-black shadow-md"
              : "text-zinc-300 hover:bg-gold-500/15 hover:text-gold-400"
          }`}
        >
          <Smartphone className="h-4 w-4" />
        </button>

        {/* VR Stereo Mode */}
        <button
          onClick={toggleStereoVR}
          title="VR Gözlük (Stereo) Modu"
          className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-all active:scale-95 ${
            isStereoActive
              ? "bg-gold-500 text-black shadow-md"
              : "text-zinc-300 hover:bg-gold-500/15 hover:text-gold-400"
          }`}
        >
          <Glasses className="h-4 w-4" />
        </button>

        <div className="h-px w-full bg-gold-500/20 my-0.5" />

        {/* Auto Rotate */}
        <button
          onClick={toggleAutoRotate}
          title={isAutoRotating ? "Dönüşü Duraklat" : "Otomatik 360° Turu Başlat"}
          className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-all active:scale-95 ${
            isAutoRotating
              ? "bg-gold-500/20 text-gold-400"
              : "text-zinc-300 hover:bg-gold-500/15 hover:text-gold-400"
          }`}
        >
          {isAutoRotating ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </button>

        {/* Hotspots Toggle */}
        <button
          onClick={toggleHotspotsVisibility}
          title={
            areHotspotsVisible
              ? "Bilgi Noktalarını Gizle"
              : "Bilgi Noktalarını Göster"
          }
          className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-all active:scale-95 ${
            areHotspotsVisible
              ? "text-gold-400 hover:bg-gold-500/15"
              : "text-zinc-500 hover:bg-gold-500/15"
          }`}
        >
          <Info className="h-4 w-4" />
        </button>

        {/* Reset View */}
        <button
          onClick={handleResetView}
          title="Açıyı & Yakınlaştırmayı Sıfırla"
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-gold-500/15 hover:text-gold-400 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          title="Yakınlaştır (+)"
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-gold-500/15 hover:text-gold-400 active:scale-95"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          title="Uzaklaştır (-)"
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-gold-500/15 hover:text-gold-400 active:scale-95"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>

      {/* Interactive Hotspot Feature Card (Framer Motion Modal Sheet) */}
      <AnimatePresence>
        {selectedHotspot && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="absolute bottom-24 left-4 right-4 sm:left-6 sm:right-auto sm:w-[380px] z-30 rounded-2xl border border-gold-500/50 bg-[#06070a]/92 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-gold-500/30 bg-gold-500/10 text-gold-400">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-bold tracking-widest text-gold-400 uppercase">
                  {selectedHotspot.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h5 className="mt-2.5 font-serif text-base sm:text-lg font-bold text-white">
              {selectedHotspot.title}
            </h5>

            <p className="mt-2 text-xs leading-relaxed text-zinc-300">
              {selectedHotspot.description}
            </p>

            {selectedHotspot.spec && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-gold-500/20 bg-gold-500/5 px-3 py-1.5 text-[11px] font-medium text-gold-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-gold-400 shrink-0" />
                <span>{selectedHotspot.spec}</span>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
              <span className="text-[10px] text-zinc-400">
                📍 {currentRoom.name}
              </span>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="text-[11px] font-semibold text-gold-400 hover:text-gold-300 transition-colors"
              >
                Tamamlandı ✓
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Room Switcher Ribbon */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-3 sm:p-5 bg-gradient-to-t from-[#06070a]/95 via-[#06070a]/60 to-transparent">
        <div className="mx-auto flex max-w-full items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {rooms.map((room, idx) => {
            const isActive = room.id === currentRoomId;
            return (
              <button
                key={room.id}
                onClick={() => handleRoomSelect(room.id)}
                className={`group/btn relative flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? "border border-gold-500 bg-gold-500/20 text-gold-300 shadow-[0_0_20px_rgba(212,175,55,0.4)] backdrop-blur-xl scale-105"
                    : "border border-white/10 bg-[#06070a]/75 text-zinc-300 hover:border-gold-500/40 hover:text-white backdrop-blur-md"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-gold-500 text-black shadow-sm"
                      : "bg-white/10 text-zinc-400 group-hover/btn:text-white"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="whitespace-nowrap tracking-wide">{room.name}</span>
                {isActive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Wayfinding Direction Help Pill (Top Right under Header) */}
      <div className="pointer-events-none absolute left-4 bottom-20 z-10 hidden sm:flex items-center gap-2 rounded-full border border-gold-500/20 bg-[#06070a]/80 px-3.5 py-1.5 text-[11px] text-zinc-400 backdrop-blur-md">
        <Layers className="h-3.5 w-3.5 text-gold-400" />
        <span>
          Odalar arası geçiş için zemindeki <strong>Yön Oklarına</strong> tıklayın
        </span>
      </div>
    </div>
  );
}

