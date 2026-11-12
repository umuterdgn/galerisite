"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Compass,
  Upload,
  Camera,
  Box,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MousePointerClick,
  Eye,
  Tag,
  Navigation,
  Building2,
  Wand2,
  Database,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RoomPreview3D,
  type ClickedCoords3D,
} from "@/components/admin/RoomPreview3D";
import {
  convertCubemapToEquirectangular,
  type CubemapFaces,
} from "@/lib/cubemap-to-equirectangular";
import {
  getAdminProperties,
  type AdminPropertyItem,
} from "@/lib/actions/property";
import {
  savePanoramaMediaRecord,
  saveFullVirtualTour,
  loadPropertyVirtualTour,
  type SavedTourRoomPayload,
  type SavedTourHotspot,
  type SavedTourLink,
} from "@/lib/actions/tour";

const ROOM_LABELS = [
  "Giriş",
  "Koridor",
  "Salon",
  "Mutfak",
  "Oda 1",
  "Oda 2",
  "Ebeveyn Süiti",
  "Banyo",
  "Teras",
  "Balkon",
  "Bahçe",
] as const;

const CUBEMAP_FACE_DEFS: {
  key: keyof CubemapFaces;
  label: string;
  axisHint: string;
}[] = [
  { key: "front", label: "Ön", axisHint: "+Z Cephesi" },
  { key: "back", label: "Arka", axisHint: "-Z Cephesi" },
  { key: "right", label: "Sağ", axisHint: "+X Cephesi" },
  { key: "left", label: "Sol", axisHint: "-X Cephesi" },
  { key: "top", label: "Üst", axisHint: "+Y Tavan" },
  { key: "bottom", label: "Alt", axisHint: "-Y Zemin" },
];

const SAMPLE_CUBEMAP_FACES: CubemapFaces = {
  front: "https://photo-sphere-viewer-data.netlify.app/assets/cubemap/px.jpg",
  right: "https://photo-sphere-viewer-data.netlify.app/assets/cubemap/nx.jpg",
  top: "https://photo-sphere-viewer-data.netlify.app/assets/cubemap/py.jpg",
  bottom: "https://photo-sphere-viewer-data.netlify.app/assets/cubemap/ny.jpg",
  back: "https://photo-sphere-viewer-data.netlify.app/assets/cubemap/pz.jpg",
  left: "https://photo-sphere-viewer-data.netlify.app/assets/cubemap/nz.jpg",
};

const DEFAULT_ROOMS: SavedTourRoomPayload[] = [
  {
    id: "room-salon",
    roomLabel: "Salon",
    customTitle: "Ana Salon & Boğaz Cephesi",
    captureMode: "equirectangular",
    panoramaUrl:
      "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-4.jpg",
    sortOrder: 0,
    hotspots: [
      {
        id: "hs-default-1",
        x: 1.2,
        y: -2.1,
        z: -9.7,
        yaw: 0.123,
        pitch: -0.212,
        category: "MİMARİ DETAY",
        title: "Planika Bioetanol Şömine",
        description:
          "Uzaktan kumandalı, bacasız gerçek alevli özel mermer çerçeveli şömine.",
        spec: "BEV Teknolojisi",
      },
    ],
    links: [],
  },
  {
    id: "room-mutfak",
    roomLabel: "Mutfak",
    customTitle: "Gourmet Şef Mutfağı",
    captureMode: "equirectangular",
    panoramaUrl:
      "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-3.jpg",
    sortOrder: 1,
    hotspots: [
      {
        id: "hs-default-2",
        x: 4.1,
        y: -0.8,
        z: -9.09,
        yaw: 0.424,
        pitch: -0.08,
        category: "ANKASTRE & CİHAZ",
        title: "Siemens StudioLine Ankastre",
        description: "FullTouch TFT akıllı fırın ve indüksiyonlu ocak seti.",
        spec: "Siemens Black Steel",
      },
    ],
    links: [
      {
        id: "lk-default-1",
        targetRoomId: "room-salon",
        x: -2.5,
        y: -1.4,
        z: 9.58,
        yaw: -0.255,
        pitch: -0.14,
        label: "Ana Salona Geçiş →",
      },
    ],
  },
];

async function readImageAspectInfo(
  file: File
): Promise<{ width: number; height: number; ratio: number; isTwoToOne: boolean }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const ratio = img.width / (img.height || 1);
      const isTwoToOne = Math.abs(ratio - 2.0) <= 0.25;
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.width, height: img.height, ratio, isTwoToOne });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Görsel boyutları okunamadı."));
    };
    img.src = objectUrl;
  });
}

async function uploadFileToMediaApi(
  file: File | Blob,
  filename: string,
  roomLabel: string
): Promise<{ url: string; storage: string }> {
  const formData = new FormData();
  formData.append("file", file, filename);
  formData.append("mediaType", "PANORAMA_360");
  formData.append("roomLabel", roomLabel);
  formData.append("isStaged", "false");

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Medya yükleme sunucusu hatası.");
  }

  const data = await res.json();
  return {
    url: data.media?.url,
    storage: data.storage || "cloudinary",
  };
}

export default function TourBuilderPage() {
  // Portfolio Properties from Prisma / Fallback
  const [properties, setProperties] = useState<AdminPropertyItem[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("prop-1");

  // Rooms State
  const [rooms, setRooms] = useState<SavedTourRoomPayload[]>(DEFAULT_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>(DEFAULT_ROOMS[0].id);

  // Required Dual Upload Option ("360 Kamera" vs "6 Yönlü Sabit Çekim")
  const [captureOption, setCaptureOption] = useState<"equirectangular" | "cubemap">(
    "equirectangular"
  );

  // Equirectangular Upload States
  const [isDragging360, setIsDragging360] = useState(false);
  const [isUploading360, setIsUploading360] = useState(false);
  const [aspectCheckInfo, setAspectCheckInfo] = useState<{
    width: number;
    height: number;
    isTwoToOne: boolean;
  } | null>(null);

  // Cubemap 6-Face Upload States
  const [cubemapFaces, setCubemapFaces] = useState<CubemapFaces>({
    front: "",
    back: "",
    right: "",
    left: "",
    top: "",
    bottom: "",
  });
  const [isConvertingCubemap, setIsConvertingCubemap] = useState(false);
  const [cubemapProgress, setCubemapProgress] = useState(0);

  // Three.js Preview & Coordinate Picking State
  const [interactionMode, setInteractionMode] = useState<
    "explore" | "add-hotspot" | "add-link"
  >("add-hotspot");
  const [clickedCoords, setClickedCoords] = useState<ClickedCoords3D | null>(null);
  const [focusCoords, setFocusCoords] = useState<{
    x: number;
    y: number;
    z: number;
  } | null>(null);

  // Hotspot Form Modal State
  const [isHotspotFormOpen, setIsHotspotFormOpen] = useState(false);
  const [hsTitle, setHsTitle] = useState("");
  const [hsCategory, setHsCategory] = useState("ANKASTRE & CİHAZ");
  const [hsDesc, setHsDesc] = useState("");
  const [hsSpec, setHsSpec] = useState("");

  // Navigation Arrow Form Modal State
  const [isLinkFormOpen, setIsLinkFormOpen] = useState(false);
  const [linkTargetId, setLinkTargetId] = useState("");
  const [linkLabel, setLinkLabel] = useState("");

  // New Room Form State
  const [isNewRoomOpen, setIsNewRoomOpen] = useState(false);
  const [newRoomLabel, setNewRoomLabel] = useState<string>("Salon");
  const [newRoomTitle, setNewRoomTitle] = useState("");

  // Persistence & Status Banner
  const [isSavingTour, setIsSavingTour] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  // 1. Load properties from Prisma on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getAdminProperties();
        if (res.properties.length > 0) {
          setProperties(res.properties);
          setSelectedPropertyId(res.properties[0].id);
        }
      } catch (err) {
        console.warn("Properties fetch fallback:", err);
      }
    })();
  }, []);

  // 2. Load saved virtual tour when property changes
  useEffect(() => {
    if (!selectedPropertyId) return;
    (async () => {
      const saved = await loadPropertyVirtualTour(selectedPropertyId);
      if (saved.rooms && saved.rooms.length > 0) {
        setRooms(saved.rooms);
        setActiveRoomId(saved.rooms[0].id);
        if (saved.rooms[0].cubemapFaces) {
          setCubemapFaces(saved.rooms[0].cubemapFaces);
        }
      }
    })();
  }, [selectedPropertyId]);

  const activeCubemapKey = activeRoom.cubemapFaces
    ? [
        activeRoom.cubemapFaces.front,
        activeRoom.cubemapFaces.back,
        activeRoom.cubemapFaces.left,
        activeRoom.cubemapFaces.right,
        activeRoom.cubemapFaces.top,
        activeRoom.cubemapFaces.bottom,
      ].join("\n")
    : "";

  // Keep cubemapFaces synced with active room without identity churn
  useEffect(() => {
    if (activeCubemapKey) {
      const [front = "", back = "", left = "", right = "", top = "", bottom = ""] =
        activeCubemapKey.split("\n");
      setCubemapFaces((prev) => {
        if (
          prev.front === front &&
          prev.back === back &&
          prev.left === left &&
          prev.right === right &&
          prev.top === top &&
          prev.bottom === bottom
        ) {
          return prev;
        }
        return { front, back, left, right, top, bottom };
      });
    }
    const nextCapture = activeRoom.captureMode || "equirectangular";
    setCaptureOption((prev) => (prev === nextCapture ? prev : nextCapture));
  }, [activeRoom.id, activeCubemapKey, activeRoom.captureMode]);

  // SEÇENEK 1: 360 Kamera (2:1 Equirectangular) -> Cloudinary + Prisma PANORAMA_360
  const handleEquirectangularFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setStatusBanner({
          type: "error",
          text: "Lütfen yalnızca geçerli bir görsel dosyası (.jpg, .png, .webp) yükleyin.",
        });
        return;
      }

      setIsUploading360(true);
      setStatusBanner(null);

      try {
        // 2:1 en-boy oranı kontrolü
        const info = await readImageAspectInfo(file);
        setAspectCheckInfo({
          width: info.width,
          height: info.height,
          isTwoToOne: info.isTwoToOne,
        });

        // Cloudinary'e yükle (/api/upload)
        const uploaded = await uploadFileToMediaApi(
          file,
          file.name,
          activeRoom.roomLabel
        );

        // Prisma'da ilgili ilana 'PANORAMA_360' olarak kaydet
        const prismaRes = await savePanoramaMediaRecord({
          propertyId: selectedPropertyId,
          url: uploaded.url,
          roomLabel: activeRoom.roomLabel,
          sortOrder: activeRoom.sortOrder,
        });

        // Aktif odayı anında önizlemeye bağla
        setRooms((prev) =>
          prev.map((r) =>
            r.id === activeRoom.id
              ? {
                  ...r,
                  captureMode: "equirectangular",
                  panoramaUrl: uploaded.url,
                }
              : r
          )
        );

        setStatusBanner({
          type: info.isTwoToOne ? "success" : "info",
          text: `${
            info.isTwoToOne
              ? "✓ 2:1 Equirectangular doğrulandı!"
              : `⚠ Görsel ${info.width}×${info.height} (${info.ratio.toFixed(
                  2
                )}:1) oranında.`
          } Görsel ${
            uploaded.storage === "cloudinary" ? "Cloudinary CDN'e" : "sunucuya"
          } yüklendi ve Prisma Media (PANORAMA_360, ${
            prismaRes.storage
          }) olarak kaydedildi.`,
        });
      } catch (err) {
        setStatusBanner({
          type: "error",
          text:
            err instanceof Error
              ? err.message
              : "360° panorama yüklenirken bir hata oluştu.",
        });
      } finally {
        setIsUploading360(false);
      }
    },
    [activeRoom.id, activeRoom.roomLabel, activeRoom.sortOrder, selectedPropertyId]
  );

  // SEÇENEK 2: 6 Yönlü Cubemap Yüzü Yükleme (Ön, Arka, Sağ, Sol, Üst, Alt)
  const handleCubemapFaceFile = (faceKey: keyof CubemapFaces, file: File) => {
    if (!file.type.startsWith("image/")) return;
    const localUrl = URL.createObjectURL(file);

    const updatedFaces: CubemapFaces = {
      ...cubemapFaces,
      [faceKey]: localUrl,
    };
    setCubemapFaces(updatedFaces);

    // Anında Three.js CubeTextureLoader önizlemesine aktar
    setRooms((prev) =>
      prev.map((r) =>
        r.id === activeRoom.id
          ? {
              ...r,
              captureMode: "cubemap",
              cubemapFaces: updatedFaces,
            }
          : r
      )
    );
  };

  // Örnek 6 Yönlü Cubemap Yükle (Hızlı Test)
  const handleLoadSampleCubemap = () => {
    setCaptureOption("cubemap");
    setCubemapFaces(SAMPLE_CUBEMAP_FACES);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === activeRoom.id
          ? {
              ...r,
              captureMode: "cubemap",
              cubemapFaces: SAMPLE_CUBEMAP_FACES,
            }
          : r
      )
    );
    setStatusBanner({
      type: "info",
      text: "6 yönlü örnek Cubemap kareleri Three.js CubeTextureLoader ile sanal odaya yüklendi.",
    });
  };

  // 6 Cubemap Yüzünü Tek Kaydedilebilir Panoramaya Dönüştürüp Cloudinary + Prisma'ya Kaydet
  const handleConvertAndSaveCubemap = async () => {
    const missing = CUBEMAP_FACE_DEFS.filter((f) => !cubemapFaces[f.key]);
    if (missing.length > 0) {
      setStatusBanner({
        type: "error",
        text: `Lütfen eksik kalan yön karelerini yükleyin: ${missing
          .map((m) => m.label)
          .join(", ")}`,
      });
      return;
    }

    setIsConvertingCubemap(true);
    setCubemapProgress(10);
    setStatusBanner(null);

    try {
      // 1. Eğer blob: URL varsa upload edilebilir 2:1 panorama üret & yüzleri kaydet
      const equirectangularDataUrl = await convertCubemapToEquirectangular(
        cubemapFaces,
        {
          width: 2048,
          height: 1024,
          onProgress: (p) => setCubemapProgress(Math.min(85, p)),
        }
      );

      // 2. Data URL -> Blob -> FormData (/api/upload)
      const blobRes = await fetch(equirectangularDataUrl);
      const jpegBlob = await blobRes.blob();

      setCubemapProgress(90);
      const uploaded = await uploadFileToMediaApi(
        jpegBlob,
        `cubemap-${activeRoom.roomLabel.toLowerCase()}-${Date.now()}.jpg`,
        activeRoom.roomLabel
      );

      // 3. Prisma Media tablosuna PANORAMA_360 kaydı
      const prismaMedia = await savePanoramaMediaRecord({
        propertyId: selectedPropertyId,
        url: uploaded.url,
        roomLabel: activeRoom.roomLabel,
        sortOrder: activeRoom.sortOrder,
      });

      const nextRooms = rooms.map((r) =>
        r.id === activeRoom.id
          ? {
              ...r,
              captureMode: "cubemap" as const,
              cubemapFaces,
              panoramaUrl: uploaded.url,
            }
          : r
      );
      setRooms(nextRooms);

      await saveFullVirtualTour(selectedPropertyId, nextRooms);
      setCubemapProgress(100);

      setStatusBanner({
        type: "success",
        text: `✨ 6 yönlü Cubemap sanal odaya dönüştürüldü, ${
          uploaded.storage === "cloudinary" ? "Cloudinary CDN'e" : "sunucuya"
        } yüklendi ve Prisma PANORAMA_360 (${prismaMedia.storage}) veritabanına bağlandı!`,
      });
    } catch (err) {
      setStatusBanner({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Cubemap dönüştürülürken hata oluştu.",
      });
    } finally {
      setIsConvertingCubemap(false);
    }
  };

  // Three.js Preview Tıklama -> X, Y, Z Koordinatlarını Yakala
  const handlePreviewPointClick = (coords: ClickedCoords3D) => {
    setClickedCoords(coords);
    if (interactionMode === "add-hotspot") {
      setIsHotspotFormOpen(true);
    } else if (interactionMode === "add-link") {
      setIsLinkFormOpen(true);
    }
  };

  // Hotspot Kaydet (X, Y, Z Koordinatlarıyla)
  const handleAddHotspot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clickedCoords || !hsTitle.trim()) return;

    const newHotspot: SavedTourHotspot = {
      id: `hs-${Date.now()}`,
      x: clickedCoords.x,
      y: clickedCoords.y,
      z: clickedCoords.z,
      yaw: clickedCoords.yaw,
      pitch: clickedCoords.pitch,
      category: hsCategory,
      title: hsTitle.trim(),
      description: hsDesc.trim(),
      spec: hsSpec.trim(),
    };

    setRooms((prev) =>
      prev.map((r) =>
        r.id === activeRoom.id
          ? { ...r, hotspots: [...r.hotspots, newHotspot] }
          : r
      )
    );

    setIsHotspotFormOpen(false);
    setHsTitle("");
    setHsDesc("");
    setHsSpec("");
    setStatusBanner({
      type: "success",
      text: `📍 "${newHotspot.title}" (X: ${newHotspot.x}, Y: ${newHotspot.y}, Z: ${newHotspot.z}) koordinatına eklendi!`,
    });
  };

  // Geçiş Oku Kaydet (X, Y, Z Koordinatlarıyla)
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clickedCoords || !linkTargetId) return;

    const target = rooms.find((r) => r.id === linkTargetId);
    const newLink: SavedTourLink = {
      id: `lk-${Date.now()}`,
      targetRoomId: linkTargetId,
      x: clickedCoords.x,
      y: clickedCoords.y,
      z: clickedCoords.z,
      yaw: clickedCoords.yaw,
      pitch: clickedCoords.pitch,
      label: linkLabel.trim() || `${target?.roomLabel || "Odaya"} Geçiş →`,
    };

    setRooms((prev) =>
      prev.map((r) =>
        r.id === activeRoom.id ? { ...r, links: [...r.links, newLink] } : r
      )
    );

    setIsLinkFormOpen(false);
    setLinkLabel("");
    setLinkTargetId("");
    setStatusBanner({
      type: "success",
      text: `🧭 "${newLink.label}" geçiş oku (X: ${newLink.x}, Y: ${newLink.y}, Z: ${newLink.z}) konumuna eklendi.`,
    });
  };

  // Yeni Oda Ekle
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `room-${Date.now()}`;
    const room: SavedTourRoomPayload = {
      id,
      roomLabel: newRoomLabel,
      customTitle: newRoomTitle.trim() || `${newRoomLabel} Alanı`,
      captureMode: captureOption,
      panoramaUrl:
        "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-1.jpg",
      sortOrder: rooms.length,
      hotspots: [],
      links: [],
    };
    setRooms((prev) => [...prev, room]);
    setActiveRoomId(id);
    setIsNewRoomOpen(false);
    setNewRoomTitle("");
  };

  // Tüm Sanal Turu & X, Y, Z Hotspot Verilerini Prisma'ya Kaydet
  const handleSaveEntireTour = async () => {
    setIsSavingTour(true);
    try {
      const res = await saveFullVirtualTour(selectedPropertyId, rooms);
      setStatusBanner({
        type: "success",
        text: `💾 ${res.savedRooms} oda, PANORAMA_360 medya kayıtları ve tüm (X, Y, Z) Hotspot verileri veritabanına (${res.storage}) kaydedildi!`,
      });
    } finally {
      setIsSavingTour(false);
    }
  };

  const completedFacesCount = CUBEMAP_FACE_DEFS.filter(
    (f) => Boolean(cubemapFaces[f.key])
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Studio Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
              Three.js CubeTextureLoader &amp; Cloudinary Pipeline
            </span>
            <Badge variant="gold" className="text-[10px]">
              PANORAMA_360 · Gerçek 3B Kayıt
            </Badge>
          </div>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>360° Sanal Tur &amp; Cubemap Stüdyosu</span>
            <Compass className="h-6 w-6 text-gold-400" />
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            360° küresel kamera fotoğrafı veya 6 yönlü sabit çekim yükleyin, 3B odada tıklayarak X, Y, Z koordinatlı Hotspot&apos;lar yerleştirin.
          </p>
        </div>

        {/* Property Selector & Save Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-gold-500/30 bg-card px-3 py-2 text-xs">
            <Building2 className="h-4 w-4 text-gold-400 shrink-0" />
            <span className="text-muted-foreground">Hedef İlan:</span>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="bg-transparent font-semibold text-foreground outline-none cursor-pointer max-w-[200px]"
            >
              {(properties.length > 0
                ? properties
                : [
                    { id: "prop-1", title: "The Bosphorus Waterfront Palace" },
                    { id: "prop-2", title: "Villa Belle Époque Cap d'Antibes" },
                    { id: "prop-3", title: "Sky Penthouse at Palm Jumeirah" },
                    { id: "prop-4", title: "Yalıkavak Cliffside Private Estate" },
                  ]
              ).map((p) => (
                <option key={p.id} value={p.id} className="bg-card text-foreground">
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="gold"
            size="sm"
            disabled={isSavingTour}
            onClick={handleSaveEntireTour}
            className="gap-2"
          >
            {isSavingTour ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Turu Veritabanına Kaydet</span>
          </Button>
        </div>
      </div>

      {/* Status Notification */}
      {statusBanner && (
        <div
          className={`rounded-2xl p-4 text-xs flex items-center justify-between gap-3 ${
            statusBanner.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : statusBanner.type === "error"
              ? "border border-red-500/30 bg-red-500/10 text-red-400"
              : "border border-gold-500/30 bg-gold-500/10 text-gold-300"
          }`}
        >
          <span className="flex items-center gap-2">
            {statusBanner.type === "error" ? (
              <AlertCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            <span>{statusBanner.text}</span>
          </span>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="hover:underline shrink-0"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Room Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 p-3.5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
            Tur Odaları:
          </span>
          {rooms.map((room, idx) => (
            <div key={room.id} className="inline-flex items-center">
              <button
                type="button"
                onClick={() => setActiveRoomId(room.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  room.id === activeRoom.id
                    ? "bg-gold-500 text-black shadow-gold-sm"
                    : "border border-border bg-background/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">{idx + 1}.</span>
                <span>{room.roomLabel}</span>
                <span className="text-[10px] opacity-75">
                  ({room.hotspots.length}📍)
                </span>
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsNewRoomOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-xs font-semibold text-gold-400 hover:bg-gold-500/20 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Yeni Oda Ekle</span>
        </button>
      </div>

      {/* =========================================================================
          1. İKİ SEÇENEKLİ ÇEKİM & YÜKLEME PANELİ
          ========================================================================= */}
      <div className="rounded-2xl border border-gold-500/30 bg-card/70 p-5 sm:p-6 backdrop-blur-2xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Seçenek 1: 360 Kamera Görüntüsü Yükle */}
          <button
            type="button"
            onClick={() => {
              setCaptureOption("equirectangular");
              setRooms((prev) =>
                prev.map((r) =>
                  r.id === activeRoom.id ? { ...r, captureMode: "equirectangular" } : r
                )
              );
            }}
            className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
              captureOption === "equirectangular"
                ? "border-gold-500 bg-gold-500/10 ring-2 ring-gold-500/20 shadow-gold-sm"
                : "border-border bg-background/50 hover:border-gold-500/40"
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/15 text-gold-400">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-bold text-foreground">
                  360 Kamera Görüntüsü Yükle
                </span>
                {captureOption === "equirectangular" && (
                  <Badge variant="gold" className="text-[9px]">
                    Seçili
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                2:1 oranlı equirectangular küresel fotoğrafı Cloudinary&apos;e yükler ve Prisma&apos;da ilgili ilana <code className="text-gold-400">PANORAMA_360</code> olarak kaydeder.
              </p>
            </div>
          </button>

          {/* Seçenek 2: 6 Yönlü Sabit Çekim (Cubemap) Yükle */}
          <button
            type="button"
            onClick={() => {
              setCaptureOption("cubemap");
              setRooms((prev) =>
                prev.map((r) =>
                  r.id === activeRoom.id ? { ...r, captureMode: "cubemap" } : r
                )
              );
            }}
            className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
              captureOption === "cubemap"
                ? "border-gold-500 bg-gold-500/10 ring-2 ring-gold-500/20 shadow-gold-sm"
                : "border-border bg-background/50 hover:border-gold-500/40"
            }`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/15 text-sky-400">
              <Box className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-base font-bold text-foreground">
                  6 Yönlü Sabit Çekim (Cubemap) Yükle
                </span>
                {captureOption === "cubemap" && (
                  <Badge variant="gold" className="text-[9px]">
                    Seçili
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Ön, Arka, Sağ, Sol, Üst, Alt fotoğraflarını Three.js <code className="text-sky-400">CubeTextureLoader</code> ile sanal odaya dönüştürüp veritabanına kaydeder.
              </p>
            </div>
          </button>
        </div>

        {/* =========================================================================
            2. SEÇENEK 1 AKIŞI: 360 KAMERA EQUIRECTANGULAR YÜKLEME
            ========================================================================= */}
        {captureOption === "equirectangular" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging360(true);
            }}
            onDragLeave={() => setIsDragging360(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging360(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleEquirectangularFile(file);
            }}
            className={`rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all ${
              isDragging360
                ? "border-gold-400 bg-gold-500/10"
                : "border-gold-500/30 bg-background/50 hover:border-gold-500/60"
            }`}
          >
            {isUploading360 ? (
              <div className="flex flex-col items-center py-4">
                <Loader2 className="h-10 w-10 text-gold-400 animate-spin" />
                <p className="mt-3 text-sm font-semibold text-gold-300">
                  Cloudinary&apos;e yükleniyor ve Prisma PANORAMA_360 kaydı oluşturuluyor...
                </p>
              </div>
            ) : (
              <>
                <Compass className="mx-auto h-10 w-10 text-gold-400" />
                <h3 className="mt-3 font-serif text-base font-bold text-foreground">
                  2:1 Oranlı 360° Küresel Fotoğrafı Buraya Sürükleyin ({activeRoom.roomLabel})
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ricoh Theta, Insta360 veya GoPro MAX panoramalar otomatik doğrulanır ve Cloudinary CDN + Prisma Media tablosuna işlenir.
                </p>

                {aspectCheckInfo && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono text-emerald-400">
                    <Database className="h-3.5 w-3.5" />
                    <span>
                      {aspectCheckInfo.width}×{aspectCheckInfo.height}px{" "}
                      {aspectCheckInfo.isTwoToOne
                        ? "(2:1 Oran Doğrulandı)"
                        : "(Özel En-Boy Oranı)"}
                    </span>
                  </div>
                )}

                <div className="mt-4">
                  <label className="inline-flex items-center gap-2 rounded-xl border border-gold-500 bg-gold-gradient px-5 py-2.5 text-xs font-bold text-black shadow-gold-sm cursor-pointer hover:brightness-110">
                    <Upload className="h-4 w-4" />
                    <span>360° Fotoğraf Seç &amp; Cloudinary&apos;e Yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleEquirectangularFile(file);
                      }}
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        )}

        {/* =========================================================================
            3. SEÇENEK 2 AKIŞI: 6 YÖNLÜ CUBEMAP DROPZONE ALANLARI (Ön, Arka, Sağ, Sol, Üst, Alt)
            ========================================================================= */}
        {captureOption === "cubemap" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3.5">
              <div className="text-xs text-muted-foreground">
                <strong className="text-sky-400">6 Yönlü Sabit Çekim ({completedFacesCount}/6 Yüklü):</strong>{" "}
                Ön, Arka, Sağ, Sol, Üst ve Alt karelerini bırakın; Three.js{" "}
                <code className="text-sky-300">CubeTextureLoader</code> sahneyi anında sanal odaya çevirir.
              </div>
              <button
                type="button"
                onClick={handleLoadSampleCubemap}
                className="shrink-0 rounded-lg border border-sky-500/40 bg-sky-500/15 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/25 transition-all"
              >
                Örnek 6 Kare Yükle
              </button>
            </div>

            {/* 6 Separate Drag-and-Drop Dropzones */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CUBEMAP_FACE_DEFS.map((faceDef) => (
                <CubemapDropzoneCard
                  key={faceDef.key}
                  label={faceDef.label}
                  axisHint={faceDef.axisHint}
                  previewUrl={cubemapFaces[faceDef.key]}
                  onFileSelected={(file) =>
                    handleCubemapFaceFile(faceDef.key, file)
                  }
                  onClear={() => {
                    const updated = { ...cubemapFaces, [faceDef.key]: "" };
                    setCubemapFaces(updated);
                    setRooms((prev) =>
                      prev.map((r) =>
                        r.id === activeRoom.id
                          ? { ...r, cubemapFaces: updated }
                          : r
                      )
                    );
                  }}
                />
              ))}
            </div>

            {isConvertingCubemap && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-gold-400">
                  <span>
                    Cubemap Verisi Dönüştürülüyor, Cloudinary ve Prisma&apos;ya Kaydediliyor...
                  </span>
                  <span>%{cubemapProgress}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gold-gradient transition-all duration-300"
                    style={{ width: `${cubemapProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="gold"
                disabled={isConvertingCubemap || completedFacesCount < 6}
                onClick={handleConvertAndSaveCubemap}
                className="gap-2"
              >
                {isConvertingCubemap ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                <span>
                  {isConvertingCubemap
                    ? "Dönüştürülüyor & Kaydediliyor..."
                    : "Cubemap'i Dönüştür & Veritabanına Kaydet"}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          4. ZORUNLU İNTERAKTİF 3B ÖNİZLEME (PREVIEW) & X, Y, Z HOTSPOT EDİTÖRÜ
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Three.js Preview Canvas */}
        <div className="lg:col-span-8 space-y-3">
          {/* Interaction Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/70 p-3 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setInteractionMode("explore")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  interactionMode === "explore"
                    ? "bg-gold-500 text-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Önizleme Gezintisi</span>
              </button>

              <button
                type="button"
                onClick={() => setInteractionMode("add-hotspot")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  interactionMode === "add-hotspot"
                    ? "bg-gold-500 text-black shadow-sm"
                    : "text-gold-400 hover:bg-gold-500/10"
                }`}
              >
                <MousePointerClick className="h-3.5 w-3.5" />
                <span>+ Tıklayarak Hotspot Ekle (X,Y,Z)</span>
              </button>

              <button
                type="button"
                onClick={() => setInteractionMode("add-link")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  interactionMode === "add-link"
                    ? "bg-sky-500 text-black shadow-sm"
                    : "text-sky-400 hover:bg-sky-500/10"
                }`}
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>+ Oda Geçiş Oku</span>
              </button>
            </div>

            {clickedCoords && (
              <span className="font-mono text-[11px] text-gold-400">
                Seçili 3B: X={clickedCoords.x}, Y={clickedCoords.y}, Z={clickedCoords.z}
              </span>
            )}
          </div>

          {/* Mandatory Interactive Three.js Preview */}
          <RoomPreview3D
            mode={activeRoom.captureMode || captureOption}
            panoramaUrl={activeRoom.panoramaUrl}
            cubemapFaces={activeRoom.cubemapFaces || cubemapFaces}
            hotspots={activeRoom.hotspots}
            links={activeRoom.links}
            interactionMode={interactionMode}
            focusCoords={focusCoords}
            onPointClick={handlePreviewPointClick}
            onLinkClick={(lk) => {
              setActiveRoomId(lk.targetRoomId);
            }}
          />
        </div>

        {/* Right: Hotspots (X, Y, Z) & Links Inspector */}
        <div className="lg:col-span-4 space-y-5 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-xl h-fit">
          <div className="border-b border-border/70 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-gold-400" />
                <span>Hotspotlar ({activeRoom.hotspots.length})</span>
              </h3>
              <Badge variant="outline" className="text-[10px] border-gold-500/30 text-gold-400">
                {activeRoom.roomLabel}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Önizleme ekranında istediğiniz noktaya tıklayarak X, Y, Z koordinatlı bilgi noktası ekleyin.
            </p>
          </div>

          {activeRoom.hotspots.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
              Bu odada henüz Hotspot yok. Sol taraftaki 3B önizleme görseline tıklayın.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {activeRoom.hotspots.map((h) => (
                <div
                  key={h.id}
                  className="rounded-xl border border-border bg-background/60 p-3 text-xs space-y-1.5 hover:border-gold-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
                        {h.category}
                      </span>
                      <p className="font-semibold text-foreground">{h.title}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setRooms((prev) =>
                          prev.map((r) =>
                            r.id === activeRoom.id
                              ? {
                                  ...r,
                                  hotspots: r.hotspots.filter((x) => x.id !== h.id),
                                }
                              : r
                          )
                        )
                      }
                      className="text-muted-foreground hover:text-red-400"
                      title="Hotspot'u Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {h.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {h.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] font-mono text-gold-300">
                    <span>
                      X:{h.x} Y:{h.y} Z:{h.z}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFocusCoords({ x: h.x, y: h.y, z: h.z })}
                      className="font-sans font-semibold text-gold-400 hover:underline"
                    >
                      👁️ Oraya Bak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Wayfinding Links */}
          <div className="pt-3 border-t border-border/70 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-sky-400" />
              <span>Oda Geçiş Okları ({activeRoom.links.length})</span>
            </h4>
            {activeRoom.links.map((lk) => (
              <div
                key={lk.id}
                className="flex items-center justify-between rounded-xl border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-xs"
              >
                <button
                  type="button"
                  onClick={() => setActiveRoomId(lk.targetRoomId)}
                  className="text-left font-medium text-sky-300 hover:underline truncate"
                >
                  {lk.label}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRooms((prev) =>
                      prev.map((r) =>
                        r.id === activeRoom.id
                          ? { ...r, links: r.links.filter((l) => l.id !== lk.id) }
                          : r
                      )
                    )
                  }
                  className="text-muted-foreground hover:text-red-400 ml-2 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: Add Hotspot at Clicked X, Y, Z */}
      {isHotspotFormOpen && clickedCoords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-gold-500/40 bg-card p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h5 className="font-serif text-base font-bold text-foreground">
                  Yeni Hotspot (Bilgi Noktası) Ekle
                </h5>
                <span className="font-mono text-[11px] text-gold-400">
                  3B Koordinat: X={clickedCoords.x}, Y={clickedCoords.y}, Z={clickedCoords.z}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsHotspotFormOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddHotspot} className="space-y-3">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">
                  Kategori
                </label>
                <select
                  value={hsCategory}
                  onChange={(e) => setHsCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-gold-500 focus:outline-none"
                >
                  <option value="ANKASTRE & CİHAZ">ANKASTRE &amp; CİHAZ</option>
                  <option value="MİMARİ DETAY">MİMARİ DETAY</option>
                  <option value="İKLİMLENDİRME">İKLİMLENDİRME &amp; KNX</option>
                  <option value="DOĞAL TAŞ">DOĞAL TAŞ &amp; MERMER</option>
                  <option value="GÜVENLİK">GÜVENLİK &amp; ERİŞİM</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">
                  Hotspot Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={hsTitle}
                  onChange={(e) => setHsTitle(e.target.value)}
                  placeholder="Örn: Gaggenau 400 Serisi Şef Mutfağı"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">
                  Bilgi Açıklaması
                </label>
                <textarea
                  rows={2}
                  value={hsDesc}
                  onChange={(e) => setHsDesc(e.target.value)}
                  placeholder="Ziyaretçiye gösterilecek detay metni..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-gold-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">
                  Teknik Rozet (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={hsSpec}
                  onChange={(e) => setHsSpec(e.target.value)}
                  placeholder="Örn: A+++ Smart Home"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsHotspotFormOpen(false)}
                >
                  İptal
                </Button>
                <Button type="submit" variant="gold">
                  Hotspot&apos;u Ekle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Room Link at Clicked X, Y, Z */}
      {isLinkFormOpen && clickedCoords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-sky-500/40 bg-card p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h5 className="font-serif text-base font-bold text-foreground">
                  Oda Geçiş Oku Ekle
                </h5>
                <span className="font-mono text-[11px] text-sky-400">
                  Kapı 3B: X={clickedCoords.x}, Y={clickedCoords.y}, Z={clickedCoords.z}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkFormOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddLink} className="space-y-3">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">
                  Hedef Oda *
                </label>
                <select
                  required
                  value={linkTargetId}
                  onChange={(e) => setLinkTargetId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-sky-500 focus:outline-none"
                >
                  <option value="">Hedef Oda Seçin...</option>
                  {rooms
                    .filter((r) => r.id !== activeRoom.id)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.roomLabel} ({r.customTitle})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">
                  Geçiş Etiketi
                </label>
                <input
                  type="text"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder="Örn: Mutfağa Geçiş →"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsLinkFormOpen(false)}
                >
                  İptal
                </Button>
                <Button type="submit" variant="gold">
                  Oku Ekle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Room */}
      {isNewRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-gold-500/40 bg-card p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h5 className="font-serif text-base font-bold text-foreground">
                Tura Yeni Oda Ekle
              </h5>
              <button
                type="button"
                onClick={() => setIsNewRoomOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">
                  Oda Etiketi (roomLabel)
                </label>
                <select
                  value={newRoomLabel}
                  onChange={(e) => setNewRoomLabel(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-gold-500 focus:outline-none"
                >
                  {ROOM_LABELS.map((lbl) => (
                    <option key={lbl} value={lbl}>
                      {lbl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">
                  Oda Özel Başlığı
                </label>
                <input
                  type="text"
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  placeholder="Örn: Boğaz Manzaralı Master Süit"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:border-gold-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewRoomOpen(false)}
                >
                  İptal
                </Button>
                <Button type="submit" variant="gold">
                  Odayı Ekle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// 6-Face Cubemap Dropzone Subcomponent
function CubemapDropzoneCard({
  label,
  axisHint,
  previewUrl,
  onFileSelected,
  onClear,
}: {
  label: string;
  axisHint: string;
  previewUrl: string;
  onFileSelected: (file: File) => void;
  onClear: () => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFileSelected(file);
      }}
      className={`relative aspect-square rounded-2xl border-2 border-dashed overflow-hidden transition-all flex flex-col items-center justify-center p-2 text-center ${
        previewUrl
          ? "border-gold-500/60 bg-black"
          : isDragOver
          ? "border-gold-400 bg-gold-500/15"
          : "border-border bg-background/60 hover:border-gold-500/40"
      }`}
    >
      {previewUrl ? (
        <div className="group relative w-full h-full">
          <Image
            src={previewUrl}
            alt={label}
            fill
            unoptimized
            className="object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
            <span className="text-xs font-bold text-gold-400">{label}</span>
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg bg-red-500/80 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-red-500"
            >
              Kaldır
            </button>
          </div>
          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-gold-300">
            {label}
          </span>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
          <Upload className="h-5 w-5 text-muted-foreground mb-1.5" />
          <span className="text-xs font-bold text-foreground">{label}</span>
          <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {axisHint}
          </span>
          <span className="text-[9px] text-gold-400/80 mt-1">
            Sürükle / Seç
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelected(file);
            }}
          />
        </label>
      )}
    </div>
  );
}
