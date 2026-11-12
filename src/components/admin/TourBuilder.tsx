"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Compass,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  ArrowRight,
  Layers,
  Eye,
  CheckCircle2,
  X,
  Building2,
  Tag,
  Wand2,
  MousePointerClick,
  Navigation,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { Viewer } from "@photo-sphere-viewer/core";
import type { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import type { VirtualTourPlugin } from "@photo-sphere-viewer/virtual-tour-plugin";
import {
  convertCubemapToEquirectangular,
  CubemapFaces,
} from "@/lib/cubemap-to-equirectangular";

// Standard Room Labels requested by User
export const STANDARD_ROOM_LABELS = [
  "Giriş",
  "Koridor",
  "Mutfak",
  "Salon",
  "Oda 1",
  "Oda 2",
  "Banyo",
  "Teras",
  "Balkon",
  "Bahçe",
  "Depo",
  "Ebeveyn Süiti",
  "Çalışma Odası",
  "Özel Alan",
] as const;

export type StandardRoomLabel = (typeof STANDARD_ROOM_LABELS)[number];

export interface TourHotspot {
  id: string;
  yaw: number;
  pitch: number;
  category: string;
  title: string;
  description: string;
  spec?: string;
}

export interface TourNavigationLink {
  id: string;
  targetRoomId: string;
  yaw: number;
  pitch: number;
  label: string;
}

export interface TourRoom {
  id: string;
  roomLabel: StandardRoomLabel | string;
  customTitle: string;
  panoramaUrl: string;
  thumbnailUrl?: string;
  sortOrder: number;
  hotspots: TourHotspot[];
  links: TourNavigationLink[];
}

// Preset Luxury Properties for Portfolio Selection
const PORTFOLIO_PROPERTIES = [
  { id: "prop-1", title: "The Bosphorus Waterfront Palace", location: "Yeniköy, Sarıyer / Istanbul" },
  { id: "prop-2", title: "Villa Belle Époque", location: "Cap d'Antibes, French Riviera" },
  { id: "prop-3", title: "The Sky Penthouse @ Sapphire", location: "Levent, Beşiktaş / Istanbul" },
  { id: "prop-4", title: "Palazzo di Mare", location: "Porto Cervo, Sardinya / İtalya" },
];

// High-Res Architectural Equirectangular Presets
const PRESET_PANORAMAS = [
  {
    name: "Giriş & Galeri Holü",
    url: "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-1.jpg",
    thumb: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80",
    label: "Giriş",
  },
  {
    name: "Koridor & Sanat Hattı",
    url: "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-2.jpg",
    thumb: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=300&q=80",
    label: "Koridor",
  },
  {
    name: "Gourmet Şef Mutfağı",
    url: "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-3.jpg",
    thumb: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=300&q=80",
    label: "Mutfak",
  },
  {
    name: "Ana Salon & Boğaz Cephesi",
    url: "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-4.jpg",
    thumb: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=300&q=80",
    label: "Salon",
  },
  {
    name: "1. Kat Master Süit",
    url: "https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg",
    thumb: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=300&q=80",
    label: "Ebeveyn Süiti",
  },
];

// Sample Cubemap Faces for 1-Click Testing
const SAMPLE_CUBEMAP_FACES: CubemapFaces = {
  front: "https://photo-sphere-viewer-data.netlify.app/assets/cubemap/px.jpg",
  right: "https://photo-sphere-viewer-data.netlify.app/assets/cubemap/nx.jpg",
  top: "https://photo-sphere-viewer-data.netlify.app/assets/cubemap/py.jpg",
  bottom: "https://photo-sphere-viewer-data.netlify.app/assets/cubemap/ny.jpg",
  back: "https://photo-sphere-viewer-data.netlify.app/assets/cubemap/pz.jpg",
  left: "https://photo-sphere-viewer-data.netlify.app/assets/cubemap/nz.jpg",
};

// Initial Default Rooms for immediate editing
const INITIAL_ROOMS: TourRoom[] = [
  {
    id: "room-giris",
    roomLabel: "Giriş",
    customTitle: "Giriş & Galeri Holü",
    panoramaUrl: PRESET_PANORAMAS[0].url,
    thumbnailUrl: PRESET_PANORAMAS[0].thumb,
    sortOrder: 1,
    hotspots: [
      {
        id: "hs-1",
        yaw: -1.3,
        pitch: 0.05,
        category: "GÜVENLİK & ERİŞİM",
        title: "Biyometrik Akıllı Giriş Kapısı",
        description: "Apple HomeKey ve parmak izi okuyuculu motorize çelik zırhlı kapı sistemi.",
        spec: "Knox Güvenlik / 14 Kilit Noktası",
      },
      {
        id: "hs-2",
        yaw: 1.45,
        pitch: -0.12,
        category: "ÖZEL MOBİLYA",
        title: "İtalyan Meşe Gizli Vestiyer",
        description: "Gizli LED aydınlatmalı, havalandırma kanallı özel tasarım meşe vestiyer dolapları.",
        spec: "Fırçalanmış Masif Meşe",
      },
    ],
    links: [
      {
        id: "link-1",
        targetRoomId: "room-koridor",
        yaw: 0.1,
        pitch: -0.15,
        label: "Koridor & Sanat Galerisine Geçiş →",
      },
    ],
  },
  {
    id: "room-koridor",
    roomLabel: "Koridor",
    customTitle: "Koridor & Sanat Galerisi",
    panoramaUrl: PRESET_PANORAMAS[1].url,
    thumbnailUrl: PRESET_PANORAMAS[1].thumb,
    sortOrder: 2,
    hotspots: [
      {
        id: "hs-3",
        yaw: 0.0,
        pitch: -0.58,
        category: "PREMIUM İKLİMLENDİRME",
        title: "Yerden Isıtma Sistemi (Rehau)",
        description: "Bağımsız programlanabilir dijital termostatlar ve oksijen bariyerli tesisat.",
        spec: "A+++ Enerji / KNX",
      },
    ],
    links: [
      {
        id: "link-2",
        targetRoomId: "room-giris",
        yaw: 3.14,
        pitch: -0.15,
        label: "Giriş Holüne Dönüş →",
      },
      {
        id: "link-3",
        targetRoomId: "room-mutfak",
        yaw: -0.85,
        pitch: -0.15,
        label: "Gourmet Şef Mutfağına Geçiş →",
      },
      {
        id: "link-4",
        targetRoomId: "room-salon",
        yaw: 0.75,
        pitch: -0.15,
        label: "Ana Salona Geçiş →",
      },
    ],
  },
  {
    id: "room-mutfak",
    roomLabel: "Mutfak",
    customTitle: "Gourmet Şef Mutfağı",
    panoramaUrl: PRESET_PANORAMAS[2].url,
    thumbnailUrl: PRESET_PANORAMAS[2].thumb,
    sortOrder: 3,
    hotspots: [
      {
        id: "hs-4",
        yaw: 0.42,
        pitch: -0.08,
        category: "ANKASTRE & CİHAZ",
        title: "Siemens StudioLine Ankastre Set",
        description: "FullTouch TFT ekran, yapay zekâ kameralı fırın ve indüksiyonlu ocak.",
        spec: "Siemens Black Steel",
      },
      {
        id: "hs-5",
        yaw: -0.45,
        pitch: -0.32,
        category: "DOĞAL TAŞ & MERMER",
        title: "Calacatta Gold Yekpare Ada",
        description: "İtalya Carrara ocağı yekpare 3.4 metre bookmatch mermer blok.",
        spec: "Carrara Marble",
      },
    ],
    links: [
      {
        id: "link-5",
        targetRoomId: "room-koridor",
        yaw: 2.2,
        pitch: -0.15,
        label: "Koridor Hattına Dönüş →",
      },
    ],
  },
  {
    id: "room-salon",
    roomLabel: "Salon",
    customTitle: "Ana Salon & Boğaz Cephesi",
    panoramaUrl: PRESET_PANORAMAS[3].url,
    thumbnailUrl: PRESET_PANORAMAS[3].thumb,
    sortOrder: 4,
    hotspots: [
      {
        id: "hs-6",
        yaw: 0.12,
        pitch: -0.22,
        category: "MİMARİ DETAY",
        title: "Planika Akıllı Bioetanol Şömine",
        description: "Uzaktan kumandalı, otomatik dolumlu, bacasız gerçek alevli şömine.",
        spec: "BEV Alev Teknolojisi",
      },
    ],
    links: [
      {
        id: "link-6",
        targetRoomId: "room-koridor",
        yaw: -2.8,
        pitch: -0.15,
        label: "Koridor & Girişe Dönüş →",
      },
    ],
  },
];

type EditorMode = "explore" | "add-hotspot" | "add-link" | "preview";

export function TourBuilder() {
  const [selectedPropertyId, setSelectedPropertyId] = useState(PORTFOLIO_PROPERTIES[0].id);
  const [rooms, setRooms] = useState<TourRoom[]>(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>(INITIAL_ROOMS[0].id);
  const [editorMode, setEditorMode] = useState<EditorMode>("explore");

  // Click Coordinates for adding markers
  const [lastClickedCoords, setLastClickedCoords] = useState<{ yaw: number; pitch: number } | null>(null);

  // Modals
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isUploadPanoramaModalOpen, setIsUploadPanoramaModalOpen] = useState(false);
  const [isAddHotspotModalOpen, setIsAddHotspotModalOpen] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);

  // New Hotspot Form State
  const [hotspotCategory, setHotspotCategory] = useState("ANKASTRE & CİHAZ");
  const [hotspotTitle, setHotspotTitle] = useState("");
  const [hotspotDesc, setHotspotDesc] = useState("");
  const [hotspotSpec, setHotspotSpec] = useState("");

  // New Navigation Link Form State
  const [linkTargetRoomId, setLinkTargetRoomId] = useState<string>("");
  const [linkLabel, setLinkLabel] = useState("");

  // New Room Form State
  const [newRoomLabel, setNewRoomLabel] = useState<StandardRoomLabel>("Salon");
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const [newRoomPanorama, setNewRoomPanorama] = useState(PRESET_PANORAMAS[3].url);

  // Cubemap Converter State
  const [cubemapTab, setCubemapTab] = useState<"direct" | "cubemap" | "presets">("direct");
  const [cubemapFaces, setCubemapFaces] = useState<CubemapFaces>({
    front: "",
    back: "",
    left: "",
    right: "",
    top: "",
    bottom: "",
  });
  const [isConvertingCubemap, setIsConvertingCubemap] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // PSV Refs
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const virtualTourRef = useRef<VirtualTourPlugin | null>(null);
  const markersRef = useRef<MarkersPlugin | null>(null);

  // Current active room object
  const currentRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Convert Cubemap Action
  const handleConvertCubemap = async () => {
    // Validate that all 6 faces are present
    const keys: (keyof CubemapFaces)[] = ["front", "back", "left", "right", "top", "bottom"];
    const missing = keys.filter((k) => !cubemapFaces[k]);
    if (missing.length > 0) {
      alert(`Lütfen eksik kalan küp yüzlerini yükleyin: ${missing.join(", ")}`);
      return;
    }

    try {
      setIsConvertingCubemap(true);
      setConvertProgress(10);

      const equirectangularDataUrl = await convertCubemapToEquirectangular(cubemapFaces, {
        width: 2048,
        height: 1024,
        onProgress: (p) => setConvertProgress(p),
      });

      // Update active room's panorama with the newly generated equirectangular 360
      setRooms((prev) =>
        prev.map((r) =>
          r.id === activeRoomId
            ? { ...r, panoramaUrl: equirectangularDataUrl, thumbnailUrl: equirectangularDataUrl }
            : r
        )
      );

      setIsConvertingCubemap(false);
      setIsUploadPanoramaModalOpen(false);
      showToast("✨ 6 Cubemap karesi başarıyla 360° Equirectangular panoramaya dönüştürüldü!");
    } catch (err) {
      setIsConvertingCubemap(false);
      console.error("Cubemap dönüştürme hatası:", err);
      alert("Cubemap dönüştürülürken bir hata oluştu. Lütfen görselleri kontrol edin.");
    }
  };

  // 1-Click Load Sample Cubemap for Testing
  const handleLoadSampleCubemap = () => {
    setCubemapFaces(SAMPLE_CUBEMAP_FACES);
    showToast("Örnek 6'lı Cubemap görselleri yüklendi. Şimdi 'Dönüştür' butonuna basın!");
  };

  // Build Photo Sphere Viewer Nodes
  const buildNodes = useCallback(() => {
    return rooms.map((room) => ({
      id: room.id,
      panorama: room.panoramaUrl,
      name: `${room.roomLabel} • ${room.customTitle}`,
      caption: room.customTitle,
      links: room.links.map((link) => ({
        nodeId: link.targetRoomId,
        position: { yaw: link.yaw, pitch: link.pitch },
        name: link.label || "Hedef Odaya Geçiş",
      })),
      markers: room.hotspots.map((h) => ({
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
          content: `${h.title} (${h.category})`,
          position: "top center",
          className: "psv-luxury-tooltip",
        },
        data: h,
      })),
    }));
  }, [rooms]);

  // Initialize Photo Sphere Viewer in the Editor Canvas
  useEffect(() => {
    if (!viewerContainerRef.current) return;

    let viewer: Viewer | null = null;
    let isSubscribed = true;

    async function initEditorViewer() {
      try {
        const { Viewer: PSVViewer } = await import("@photo-sphere-viewer/core");
        const { MarkersPlugin: PSVMarkers } = await import("@photo-sphere-viewer/markers-plugin");
        const { VirtualTourPlugin: PSVVirtualTour } = await import("@photo-sphere-viewer/virtual-tour-plugin");

        if (!isSubscribed || !viewerContainerRef.current) return;

        viewerContainerRef.current.innerHTML = "";

        const nodes = buildNodes();

        viewer = new PSVViewer({
          container: viewerContainerRef.current,
          loadingTxt: "Editör Sahnesi Hazırlanıyor...",
          defaultZoomLvl: 50,
          navbar: false,
          plugins: [
            [PSVMarkers, {}],
            [
              PSVVirtualTour,
              {
                positionMode: "manual",
                renderMode: "3d",
                nodes: nodes,
                startNodeId: activeRoomId,
                arrowStyle: {
                  size: { width: 44, height: 44 },
                },
                showLinkTooltip: true,
              },
            ],
          ],
        });

        viewerRef.current = viewer;

        const virtualTour = viewer.getPlugin(PSVVirtualTour) as unknown as VirtualTourPlugin;
        const markers = viewer.getPlugin(PSVMarkers) as unknown as MarkersPlugin;

        virtualTourRef.current = virtualTour;
        markersRef.current = markers;

        // Click on 360 sphere -> captures yaw & pitch for hotspot/arrow
        viewer.addEventListener("click", (event: unknown) => {
          if (!isSubscribed) return;
          const e = event as { data?: { yaw?: number; pitch?: number } };
          if (e && e.data && typeof e.data.yaw === "number" && typeof e.data.pitch === "number") {
            const coords = {
              yaw: parseFloat(e.data.yaw.toFixed(3)),
              pitch: parseFloat(e.data.pitch.toFixed(3)),
            };
            setLastClickedCoords(coords);

            // If we are in "add-hotspot" mode, open hotspot creation dialog
            if (editorMode === "add-hotspot") {
              setIsAddHotspotModalOpen(true);
            }
            // If we are in "add-link" mode, open link creation dialog
            else if (editorMode === "add-link") {
              setIsAddLinkModalOpen(true);
            }
          }
        });

        // Listen for room changes
        virtualTour.addEventListener("node-changed", (event: unknown) => {
          if (!isSubscribed) return;
          const e = event as { node?: { id?: string } };
          const nextRoomId = e?.node?.id;
          if (nextRoomId) {
            setActiveRoomId((prev) => (prev === nextRoomId ? prev : nextRoomId));
          }
        });
      } catch (err) {
        console.error("Editor viewer initialization failed:", err);
      }
    }

    initEditorViewer();

    return () => {
      isSubscribed = false;
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch {
          // ignore teardown
        }
        viewerRef.current = null;
      }
    };
  }, [buildNodes, editorMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Switch Active Room
  const handleSelectRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    if (virtualTourRef.current) {
      virtualTourRef.current.setCurrentNode(roomId);
    }
  };

  // Focus Camera onto a Specific Hotspot
  const handleFocusCoords = (yaw: number, pitch: number) => {
    if (!viewerRef.current) return;
    viewerRef.current.animate({
      yaw,
      pitch,
      zoom: 60,
      speed: 1200,
    });
  };

  // Add New Room to Tour
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `room-${Date.now()}`;
    const newRoom: TourRoom = {
      id: newId,
      roomLabel: newRoomLabel,
      customTitle: newRoomTitle.trim() || `${newRoomLabel} Alanı`,
      panoramaUrl: newRoomPanorama,
      thumbnailUrl: newRoomPanorama,
      sortOrder: rooms.length + 1,
      hotspots: [],
      links: [],
    };

    setRooms((prev) => [...prev, newRoom]);
    setActiveRoomId(newId);
    setIsAddRoomModalOpen(false);
    setNewRoomTitle("");
    showToast(`✅ "${newRoom.customTitle}" mekânı başarıyla eklendi!`);
  };

  // Delete Room
  const handleDeleteRoom = (roomId: string) => {
    if (rooms.length <= 1) {
      alert("Turda en az bir oda bulunmalıdır.");
      return;
    }
    if (confirm("Bu odayı ve içindeki tüm hotspot/okları silmek istediğinize emin misiniz?")) {
      const remaining = rooms.filter((r) => r.id !== roomId);
      setRooms(remaining);
      setActiveRoomId(remaining[0].id);
      showToast("Oda turdan kaldırıldı.");
    }
  };

  // Save Hotspot Action
  const handleSaveHotspot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastClickedCoords) return;
    if (!hotspotTitle.trim()) {
      alert("Lütfen hotspot başlığı girin.");
      return;
    }

    const newHotspot: TourHotspot = {
      id: `hs-${Date.now()}`,
      yaw: lastClickedCoords.yaw,
      pitch: lastClickedCoords.pitch,
      category: hotspotCategory,
      title: hotspotTitle.trim(),
      description: hotspotDesc.trim(),
      spec: hotspotSpec.trim(),
    };

    setRooms((prev) =>
      prev.map((r) =>
        r.id === activeRoomId ? { ...r, hotspots: [...r.hotspots, newHotspot] } : r
      )
    );

    setIsAddHotspotModalOpen(false);
    setHotspotTitle("");
    setHotspotDesc("");
    setHotspotSpec("");
    setEditorMode("explore");
    showToast(`📍 Hotspot "${newHotspot.title}" koordinatlarına yerleştirildi!`);
  };

  // Delete Hotspot
  const handleDeleteHotspot = (hotspotId: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === activeRoomId
          ? { ...r, hotspots: r.hotspots.filter((h) => h.id !== hotspotId) }
          : r
      )
    );
    showToast("Hotspot silindi.");
  };

  // Save Navigation Link Action
  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastClickedCoords) return;
    if (!linkTargetRoomId) {
      alert("Lütfen bağlanılacak hedef odayı seçin.");
      return;
    }

    const targetRoom = rooms.find((r) => r.id === linkTargetRoomId);
    const newLink: TourNavigationLink = {
      id: `link-${Date.now()}`,
      targetRoomId: linkTargetRoomId,
      yaw: lastClickedCoords.yaw,
      pitch: lastClickedCoords.pitch,
      label: linkLabel.trim() || `${targetRoom?.roomLabel || "Odaya"} Geçiş →`,
    };

    setRooms((prev) =>
      prev.map((r) =>
        r.id === activeRoomId ? { ...r, links: [...r.links, newLink] } : r
      )
    );

    setIsAddLinkModalOpen(false);
    setLinkLabel("");
    setLinkTargetRoomId("");
    setEditorMode("explore");
    showToast(`🧭 "${newLink.label}" navigasyon oku kapı hizasına eklendi!`);
  };

  // Delete Navigation Link
  const handleDeleteLink = (linkId: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === activeRoomId
          ? { ...r, links: r.links.filter((l) => l.id !== linkId) }
          : r
      )
    );
    showToast("Navigasyon oku silindi.");
  };

  // Save Virtual Tour to Database Action
  const handleSaveTourToPortfolio = () => {
    const selectedProp = PORTFOLIO_PROPERTIES.find((p) => p.id === selectedPropertyId);
    // Serialize tour data
    const payload = {
      propertyId: selectedPropertyId,
      rooms: rooms,
      updatedAt: new Date().toISOString(),
    };
    console.log("Saving Tour Data to DB:", payload);
    showToast(`💾 "${selectedProp?.title}" için 360° sanal tur veritabanına kaydedildi!`);
  };

  // Export JSON file
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rooms, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `virtual-tour-${selectedPropertyId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Tur JSON dosyası indirildi.");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#06070a] text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border border-gold-500/50 bg-[#0c1019]/95 px-5 py-3 shadow-[0_10px_40px_rgba(212,175,55,0.3)] backdrop-blur-xl text-sm font-medium text-gold-300"
          >
            <CheckCircle2 className="h-5 w-5 text-gold-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & Property Selector */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gold-500/20 bg-[#0c1019]/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/40 bg-gold-500/10 text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-white tracking-wide">
                360° Sanal Tur Stüdyosu
              </span>
              <Badge variant="gold" className="text-[10px]">
                Admin Builder
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">
              Cubemap dönüşümü, oda etiketleme ve etkileşimli hotspot yerleşimi
            </p>
          </div>
        </div>

        {/* Property Selector & Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-gold-500/30 bg-[#06070a] px-3 py-1.5 text-xs text-zinc-300">
            <Building2 className="h-4 w-4 text-gold-400" />
            <span className="text-zinc-400">İlan:</span>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="bg-transparent font-medium text-white outline-none cursor-pointer"
            >
              {PORTFOLIO_PROPERTIES.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0c1019] text-white">
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Export JSON */}
          <button
            onClick={handleExportJson}
            title="Turu JSON formatında dışa aktar"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#06070a] px-3 py-2 text-xs font-medium text-zinc-300 hover:border-gold-500/40 hover:text-white transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          {/* Save to Portfolio Button */}
          <button
            onClick={handleSaveTourToPortfolio}
            className="flex items-center gap-2 rounded-xl border border-gold-500 bg-gold-gradient px-4 py-2 text-xs font-bold text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 active:scale-95 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Turu Portföye Kaydet</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body: Sidebar + 360 Canvas + Marker Inspector */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Room Management & Cubemap Upload */}
        <aside className="w-full lg:w-80 shrink-0 border-r border-gold-500/20 bg-[#090c14] p-4 flex flex-col gap-4 overflow-y-auto max-h-[40vh] lg:max-h-[calc(100vh-73px)]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-gold-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Tur Odaları ({rooms.length})
              </span>
            </div>
            <button
              onClick={() => setIsAddRoomModalOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-gold-500/40 bg-gold-500/10 px-2.5 py-1 text-xs font-semibold text-gold-300 hover:bg-gold-500/20 transition-all"
            >
              <Plus className="h-3 w-3" />
              <span>Yeni Oda</span>
            </button>
          </div>

          {/* Room Cards List */}
          <div className="flex flex-col gap-2">
            {rooms.map((room, idx) => {
              const isActive = room.id === activeRoomId;
              return (
                <div
                  key={room.id}
                  onClick={() => handleSelectRoom(room.id)}
                  className={`group relative flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer ${
                    isActive
                      ? "border-gold-500 bg-gold-500/15 shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                      : "border-white/10 bg-[#0c1019]/70 hover:border-gold-500/30 hover:bg-[#0c1019]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isActive ? "bg-gold-500 text-black" : "bg-white/10 text-zinc-400"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white tracking-wide">
                          {room.customTitle}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-gold-500/30 bg-[#06070a] text-[9px] text-gold-400 px-1.5 py-0"
                        >
                          {room.roomLabel}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-400 mt-1">
                        <span>📍 {room.hotspots.length} Hotspot</span>
                        <span>🧭 {room.links.length} Yön Oku</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRoom(room.id);
                    }}
                    title="Odayı Sil"
                    className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-500/20 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Active Room Panorama Media Box */}
          <div className="mt-auto rounded-2xl border border-gold-500/20 bg-[#0c1019] p-3.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Aktif Panorama Medyası
            </span>
            <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentRoom.panoramaUrl}
                alt={currentRoom.customTitle}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-semibold text-white truncate">
                  {currentRoom.customTitle}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsUploadPanoramaModalOpen(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gold-500/40 bg-gold-500/10 py-2 text-xs font-semibold text-gold-300 hover:bg-gold-500/20 transition-all"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Görsel Yükle / Cubemap Dönüştür</span>
            </button>
          </div>
        </aside>

        {/* Center: Visual 360 Editor Canvas */}
        <main className="relative flex-1 flex flex-col bg-black overflow-hidden min-h-[500px]">
          {/* Top Interactive Mode Ribbon */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
            {/* Mode Buttons */}
            <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-gold-500/30 bg-[#06070a]/90 p-1.5 shadow-2xl backdrop-blur-xl">
              {/* Explore Mode */}
              <button
                onClick={() => setEditorMode("explore")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  editorMode === "explore"
                    ? "bg-gold-500 text-black shadow-md font-bold"
                    : "text-zinc-300 hover:bg-white/10"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Keşif & Gezinme</span>
              </button>

              {/* Add Hotspot Mode */}
              <button
                onClick={() => setEditorMode("add-hotspot")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  editorMode === "add-hotspot"
                    ? "bg-gold-500 text-black shadow-md font-bold animate-pulse"
                    : "text-gold-400 hover:bg-gold-500/15"
                }`}
              >
                <MousePointerClick className="h-3.5 w-3.5" />
                <span>+ Hotspot Ekle</span>
              </button>

              {/* Add Wayfinding Link Mode */}
              <button
                onClick={() => setEditorMode("add-link")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  editorMode === "add-link"
                    ? "bg-gold-500 text-black shadow-md font-bold animate-pulse"
                    : "text-blue-400 hover:bg-blue-500/15"
                }`}
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>+ Yön Oku Ekle</span>
              </button>
            </div>

            {/* Instruction Badge */}
            <div className="pointer-events-auto rounded-full border border-gold-500/30 bg-[#06070a]/80 px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md shadow-lg hidden sm:flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-gold-400 animate-ping" />
              <span>
                {editorMode === "add-hotspot" && "Oda içinde bilgi kartı eklemek istediğiniz noktaya tıklayın"}
                {editorMode === "add-link" && "Kapı veya koridor hizasında zemine tıklayarak yön oku bağlayın"}
                {editorMode === "explore" && "Farenizi sürükleyerek 360° açıyı inceleyin"}
              </span>
            </div>
          </div>

          {/* 360 PSV Canvas Element */}
          <div
            ref={viewerContainerRef}
            className={`w-full h-full flex-1 min-h-[500px] ${
              editorMode === "add-hotspot"
                ? "cursor-crosshair"
                : editorMode === "add-link"
                ? "cursor-cell"
                : "cursor-grab active:cursor-grabbing"
            }`}
          />

          {/* Bottom Coordinates Bar */}
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 rounded-full border border-white/10 bg-[#06070a]/85 px-4 py-1.5 text-xs font-mono text-zinc-400 backdrop-blur-md">
            <span>Aktif Mekân: <strong className="text-white">{currentRoom.customTitle}</strong></span>
            {lastClickedCoords && (
              <>
                <span className="text-zinc-600">•</span>
                <span>Son Tıklanan: <strong className="text-gold-400">yaw={lastClickedCoords.yaw}, pitch={lastClickedCoords.pitch}</strong></span>
              </>
            )}
          </div>
        </main>

        {/* Right Side: Marker & Wayfinding Link Inspector */}
        <aside className="w-full lg:w-84 shrink-0 border-l border-gold-500/20 bg-[#090c14] p-4 flex flex-col gap-5 overflow-y-auto max-h-[40vh] lg:max-h-[calc(100vh-73px)]">
          {/* Section: Hotspots List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gold-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Bilgi Kartları ({currentRoom.hotspots.length})
                </span>
              </div>
              <Badge variant="outline" className="border-gold-500/30 text-[10px] text-gold-300">
                Hotspots
              </Badge>
            </div>

            {currentRoom.hotspots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-zinc-500">
                Bu odada henüz hotspot yok. Yukarıdaki <strong>&quot;+ Hotspot Ekle&quot;</strong> butonuna tıklayıp odada bir nesne seçin.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {currentRoom.hotspots.map((h) => (
                  <div
                    key={h.id}
                    className="group rounded-xl border border-white/10 bg-[#0c1019] p-3 text-xs hover:border-gold-500/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-gold-400 uppercase tracking-wider">
                          {h.category}
                        </span>
                        <h6 className="font-semibold text-white mt-0.5">{h.title}</h6>
                        <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                          {h.description}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteHotspot(h.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all"
                        title="Hotspot'u Sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-zinc-500">
                      <span>yaw: {h.yaw} | pitch: {h.pitch}</span>
                      <button
                        onClick={() => handleFocusCoords(h.yaw, h.pitch)}
                        className="text-gold-400 hover:text-gold-300 font-medium transition-colors"
                      >
                        👁️ Oraya Bak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Navigation Links List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Oda Geçiş Okları ({currentRoom.links.length})
                </span>
              </div>
              <Badge variant="outline" className="border-blue-500/30 text-[10px] text-blue-300">
                Wayfinding
              </Badge>
            </div>

            {currentRoom.links.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-zinc-500">
                Bu odadan diğer odalara açılan kapı oku yok. <strong>&quot;+ Yön Oku Ekle&quot;</strong> ile kapı eşiğine tıklayın.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {currentRoom.links.map((link) => {
                  const target = rooms.find((r) => r.id === link.targetRoomId);
                  return (
                    <div
                      key={link.id}
                      className="group rounded-xl border border-blue-500/20 bg-[#0c1019] p-3 text-xs hover:border-blue-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                          <div>
                            <span className="font-semibold text-white">{link.label}</span>
                            <p className="text-[10px] text-zinc-400">
                              Hedef: <strong className="text-blue-300">{target?.customTitle || link.targetRoomId}</strong>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all"
                          title="Navigasyon Okunu Sil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-zinc-500">
                        <span>yaw: {link.yaw} | pitch: {link.pitch}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleFocusCoords(link.yaw, link.pitch)}
                            className="text-zinc-400 hover:text-white transition-colors"
                          >
                            👁️ Hizala
                          </button>
                          <button
                            onClick={() => handleSelectRoom(link.targetRoomId)}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                          >
                            🚪 Odaya Git
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* =========================================================================
         MODAL 1: Create New Hotspot Dialog
         ========================================================================= */}
      <AnimatePresence>
        {isAddHotspotModalOpen && lastClickedCoords && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-gold-500/40 bg-[#0c1019] p-6 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/15 text-gold-400">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-serif text-base font-bold text-white">Yeni Hotspot Ekle</h5>
                    <span className="text-[10px] text-zinc-400">
                      Konum: yaw={lastClickedCoords.yaw}, pitch={lastClickedCoords.pitch}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddHotspotModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveHotspot} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Donanım / Mimari Kategori
                  </label>
                  <select
                    value={hotspotCategory}
                    onChange={(e) => setHotspotCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#06070a] px-3.5 py-2 text-xs text-white outline-none focus:border-gold-500"
                  >
                    <option value="ANKASTRE & CİHAZ">ANKASTRE & CİHAZ (Siemens, Gaggenau vb.)</option>
                    <option value="PREMIUM İKLİMLENDİRME">PREMIUM İKLİMLENDİRME (Yerden Isıtma, VRF)</option>
                    <option value="DOĞAL TAŞ & MERMER">DOĞAL TAŞ & MERMER (Carrara, Calacatta)</option>
                    <option value="MİMARİ DETAY">MİMARİ DETAY (Şömine, Yüksek Tavan, Galeri)</option>
                    <option value="AKUSTİK & SES SİSTEMİ">AKUSTİK & SES (Bang & Olufsen, Gömme)</option>
                    <option value="GÜVENLİK & ERİŞİM">GÜVENLİK (Biyometrik Kapı, Kamera)</option>
                    <option value="ÖZEL MOBİLYA">ÖZEL MOBİLYA (Giyinme Odası, Masif Ahşap)</option>
                    <option value="GENEL BİLGİ">GENEL BİLGİ NOTU</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Siemens StudioLine Ankastre Set"
                    value={hotspotTitle}
                    onChange={(e) => setHotspotTitle(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#06070a] px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Detaylı Açıklama
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Örn: Home Connect akıllı fırın, vakum çekmecesi ve indüksiyonlu ocak sistemi."
                    value={hotspotDesc}
                    onChange={(e) => setHotspotDesc(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#06070a] px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-gold-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Teknik Özellik / Rozet (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: A+++ Enerji / KNX Entegrasyon"
                    value={hotspotSpec}
                    onChange={(e) => setHotspotSpec(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#06070a] px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-gold-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddHotspotModalOpen(false)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl border border-gold-500 bg-gold-gradient px-4 py-2 text-xs font-bold text-black shadow-md hover:brightness-110"
                  >
                    Hotspot&apos;u Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
         MODAL 2: Create Navigation Link (Doorway Arrow) Dialog
         ========================================================================= */}
      <AnimatePresence>
        {isAddLinkModalOpen && lastClickedCoords && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-blue-500/40 bg-[#0c1019] p-6 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                    <Navigation className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-serif text-base font-bold text-white">
                      Oda Geçiş Oku (Wayfinding)
                    </h5>
                    <span className="text-[10px] text-zinc-400">
                      Kapı Konumu: yaw={lastClickedCoords.yaw}, pitch={lastClickedCoords.pitch}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddLinkModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLink} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Bağlanılacak Hedef Oda *
                  </label>
                  <select
                    required
                    value={linkTargetRoomId}
                    onChange={(e) => setLinkTargetRoomId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#06070a] px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="">Hedef Oda Seçin...</option>
                    {rooms
                      .filter((r) => r.id !== activeRoomId)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.customTitle} ({r.roomLabel})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Yön Oku Etiketi (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Gourmet Şef Mutfağına Geçiş →"
                    value={linkLabel}
                    onChange={(e) => setLinkLabel(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#06070a] px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddLinkModalOpen(false)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl border border-blue-500 bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500"
                  >
                    Yön Okunu Ekle
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
         MODAL 3: Add New Room Dialog
         ========================================================================= */}
      <AnimatePresence>
        {isAddRoomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-gold-500/40 bg-[#0c1019] p-6 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/15 text-gold-400">
                    <Plus className="h-4 w-4" />
                  </div>
                  <h5 className="font-serif text-base font-bold text-white">
                    Tura Yeni Mekân / Oda Ekle
                  </h5>
                </div>
                <button
                  onClick={() => setIsAddRoomModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRoom} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Standart Mekân Etiketi (roomLabel) *
                  </label>
                  <select
                    value={newRoomLabel}
                    onChange={(e) =>
                      setNewRoomLabel(e.target.value as StandardRoomLabel)
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#06070a] px-3.5 py-2 text-xs text-white outline-none focus:border-gold-500"
                  >
                    {STANDARD_ROOM_LABELS.map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Özel Başlık / İsimlendirme
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Boğaz Manzaralı Teras Süiti"
                    value={newRoomTitle}
                    onChange={(e) => setNewRoomTitle(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#06070a] px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Başlangıç Panoraması
                  </label>
                  <select
                    value={newRoomPanorama}
                    onChange={(e) => setNewRoomPanorama(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#06070a] px-3.5 py-2 text-xs text-white outline-none focus:border-gold-500"
                  >
                    {PRESET_PANORAMAS.map((preset, idx) => (
                      <option key={idx} value={preset.url}>
                        {preset.name} ({preset.label})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddRoomModalOpen(false)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl border border-gold-500 bg-gold-gradient px-4 py-2 text-xs font-bold text-black shadow-md hover:brightness-110"
                  >
                    Odayı Oluştur
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
         MODAL 4: Upload Panorama & 6-Face Cubemap Converter Dialog
         ========================================================================= */}
      <AnimatePresence>
        {isUploadPanoramaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl border border-gold-500/40 bg-[#0c1019] p-6 shadow-2xl text-white my-8"
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/15 text-gold-400">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-serif text-lg font-bold text-white">
                      360° Panorama & Cubemap Yükleme Modülü
                    </h5>
                    <p className="text-xs text-zinc-400">
                      Hedef Mekân: <strong className="text-gold-300">{currentRoom.customTitle}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUploadPanoramaModalOpen(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs: Direct 360 vs 6-Face Cubemap vs Presets */}
              <div className="mt-4 flex items-center gap-2 border-b border-white/10 pb-3">
                <button
                  onClick={() => setCubemapTab("direct")}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    cubemapTab === "direct"
                      ? "bg-gold-500 text-black font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  📸 Doğrudan 360° Fotoğraf (Tek Dosya)
                </button>
                <button
                  onClick={() => setCubemapTab("cubemap")}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    cubemapTab === "cubemap"
                      ? "bg-gold-500 text-black font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  🎲 6 Kare Fotoğraf (Cubemap Dönüştürücü)
                </button>
                <button
                  onClick={() => setCubemapTab("presets")}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    cubemapTab === "presets"
                      ? "bg-gold-500 text-black font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  🏛️ Hazır Lüks Şablonlar
                </button>
              </div>

              {/* TAB 1: Direct 360 Camera Upload */}
              {cubemapTab === "direct" && (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border-2 border-dashed border-gold-500/30 bg-[#06070a]/60 p-8 text-center">
                    <Compass className="mx-auto h-12 w-12 text-gold-400/60 animate-pulse" />
                    <p className="mt-3 text-sm font-semibold text-white">
                      Ricoh Theta, Insta360 veya Drone 360° Fotoğrafınızı Sürükleyin
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      JPEG veya PNG formatında, 2:1 en-boy oranlı equirectangular görseller desteklenir.
                    </p>

                    <label className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gold-500 bg-gold-gradient px-4 py-2 text-xs font-bold text-black shadow-md cursor-pointer hover:brightness-110">
                      <Upload className="h-4 w-4" />
                      <span>Dosya Seç</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const url = event.target?.result as string;
                              setRooms((prev) =>
                                prev.map((r) =>
                                  r.id === activeRoomId
                                    ? { ...r, panoramaUrl: url, thumbnailUrl: url }
                                    : r
                                )
                              );
                              setIsUploadPanoramaModalOpen(false);
                              showToast("360° panorama başarıyla odaya atandı!");
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: 6-Face Cubemap Converter */}
              {cubemapTab === "cubemap" && (
                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-gold-500/20 bg-gold-500/5 p-3">
                    <p className="text-xs text-gold-300">
                      Tripod ve sabit kamerayla çekilmiş 6 açılı (Ön, Arka, Sol, Sağ, Tavan, Zemin) kare fotoğrafları küresel 360° panoramaya dönüştürün.
                    </p>
                    <button
                      onClick={handleLoadSampleCubemap}
                      className="shrink-0 rounded-lg border border-gold-500/40 bg-gold-500/20 px-3 py-1.5 text-xs font-semibold text-gold-300 hover:bg-gold-500/30 transition-all"
                    >
                      Örnek Cubemap Yükle
                    </button>
                  </div>

                  {/* 3D Cross Cubemap Slots */}
                  <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto pt-2">
                    {/* Top Row: Empty, Top, Empty, Empty */}
                    <div />
                    <CubemapFaceSlot
                      label="Üst (Tavan)"
                      value={cubemapFaces.top}
                      onChange={(url) => setCubemapFaces((p) => ({ ...p, top: url }))}
                    />
                    <div />
                    <div />

                    {/* Middle Row: Left, Front, Right, Back */}
                    <CubemapFaceSlot
                      label="Sol"
                      value={cubemapFaces.left}
                      onChange={(url) => setCubemapFaces((p) => ({ ...p, left: url }))}
                    />
                    <CubemapFaceSlot
                      label="Ön"
                      value={cubemapFaces.front}
                      onChange={(url) => setCubemapFaces((p) => ({ ...p, front: url }))}
                    />
                    <CubemapFaceSlot
                      label="Sağ"
                      value={cubemapFaces.right}
                      onChange={(url) => setCubemapFaces((p) => ({ ...p, right: url }))}
                    />
                    <CubemapFaceSlot
                      label="Arka"
                      value={cubemapFaces.back}
                      onChange={(url) => setCubemapFaces((p) => ({ ...p, back: url }))}
                    />

                    {/* Bottom Row: Empty, Bottom, Empty, Empty */}
                    <div />
                    <CubemapFaceSlot
                      label="Alt (Zemin)"
                      value={cubemapFaces.bottom}
                      onChange={(url) => setCubemapFaces((p) => ({ ...p, bottom: url }))}
                    />
                    <div />
                    <div />
                  </div>

                  {/* Progress Bar when converting */}
                  {isConvertingCubemap && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold text-gold-400">
                        <span>Pikseller Küresel Projeksiyona Haritalanıyor...</span>
                        <span>%{convertProgress}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full bg-gold-gradient transition-all duration-300"
                          style={{ width: `${convertProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsUploadPanoramaModalOpen(false)}
                      className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                    >
                      Kapat
                    </button>
                    <button
                      type="button"
                      disabled={isConvertingCubemap}
                      onClick={handleConvertCubemap}
                      className="flex items-center gap-2 rounded-xl border border-gold-500 bg-gold-gradient px-5 py-2 text-xs font-bold text-black shadow-lg hover:brightness-110 disabled:opacity-50"
                    >
                      <Wand2 className="h-4 w-4" />
                      <span>{isConvertingCubemap ? "Dönüştürülüyor..." : "⚡ 360° Equirectangular Panoramaya Dönüştür"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Preset Luxury Panoramas */}
              {cubemapTab === "presets" && (
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRESET_PANORAMAS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setRooms((prev) =>
                          prev.map((r) =>
                            r.id === activeRoomId
                              ? { ...r, panoramaUrl: preset.url, thumbnailUrl: preset.thumb }
                              : r
                          )
                        );
                        setIsUploadPanoramaModalOpen(false);
                        showToast(`"${preset.name}" panoraması odaya atandı!`);
                      }}
                      className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-[#06070a] hover:border-gold-500 cursor-pointer transition-all"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset.thumb}
                        alt={preset.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-2.5">
                        <span className="text-[10px] font-bold text-gold-400 uppercase">
                          {preset.label}
                        </span>
                        <span className="text-xs font-semibold text-white truncate">
                          {preset.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponent: Cubemap Single Face Slot
function CubemapFaceSlot({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  return (
    <div className="relative aspect-square rounded-xl border border-white/15 bg-[#06070a] p-1 flex flex-col items-center justify-center text-center overflow-hidden group hover:border-gold-500/60 transition-colors">
      {value ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="h-full w-full object-cover rounded-lg" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center p-1 transition-opacity">
            <span className="text-[9px] font-bold text-gold-300">{label}</span>
            <button
              onClick={() => onChange("")}
              className="mt-1 text-[9px] text-red-400 hover:underline"
            >
              Kaldır
            </button>
          </div>
        </>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-1">
          <Upload className="h-4 w-4 text-zinc-500 group-hover:text-gold-400 transition-colors" />
          <span className="text-[10px] font-semibold text-zinc-400 mt-1">{label}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  onChange(event.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>
      )}
    </div>
  );
}
