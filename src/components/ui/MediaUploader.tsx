"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  Compass,
  Sparkles,
  Plane,
  Loader2,
} from "lucide-react";
import { Badge } from "./badge";

export type MediaType = "IMAGE" | "VIDEO" | "PANORAMA_360" | "BIM_3D" | "DRONE";

export interface UploadedMediaItem {
  id?: string;
  url: string;
  type: MediaType;
  roomLabel?: string;
  isStaged?: boolean;
  sortOrder?: number;
}

export interface MediaUploaderProps {
  propertyId?: string;
  onUploadComplete?: (items: UploadedMediaItem[]) => void | Promise<void>;
  onMediaUploaded?: (item: UploadedMediaItem) => void | Promise<void>;
  maxFiles?: number;
  className?: string;
}

const ROOM_PRESETS = [
  "Ön Cephe & Manzara",
  "Salon & Yaşam Alanı",
  "Mutfak & Ada",
  "Master Süit",
  "Banyo & Spa",
  "Sonsuzluk Havuzu",
  "Teras & Balkon",
  "Özel İskele",
  "Şarap Mahzeni",
  "Bahçe & Peyzaj",
];

export function MediaUploader({
  propertyId,
  onUploadComplete,
  onMediaUploaded,
  maxFiles = 10,
  className = "",
}: MediaUploaderProps) {
  const [mediaList, setMediaList] = useState<UploadedMediaItem[]>([]);
  const [selectedType, setSelectedType] = useState<MediaType>("IMAGE");
  const [selectedRoom, setSelectedRoom] = useState<string>(ROOM_PRESETS[0]);
  const [customRoom, setCustomRoom] = useState<string>("");
  const [isStaged, setIsStaged] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeRoomLabel = customRoom.trim() || selectedRoom;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setIsUploading(true);
    const newUploadedItems: UploadedMediaItem[] = [];

    try {
      const fileCount = files.length;
      for (let i = 0; i < fileCount; i++) {
        const file = files[i];
        setUploadProgress(
          `${i + 1}/${fileCount} dosya Cloudinary'ye yükleniyor: ${file.name}...`
        );

        const formData = new FormData();
        formData.append("file", file);
        formData.append("mediaType", selectedType);
        formData.append("roomLabel", activeRoomLabel);
        formData.append("isStaged", isStaged ? "true" : "false");
        if (propertyId) {
          formData.append("propertyId", propertyId);
        }

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Yükleme hatası: ${file.name}`);
        }

        const data = await res.json();
        const uploadedItem: UploadedMediaItem = {
          url: data.media.url,
          type: data.media.type as MediaType,
          roomLabel: data.media.roomLabel,
          isStaged: data.media.isStaged,
          sortOrder: mediaList.length + newUploadedItems.length,
        };

        newUploadedItems.push(uploadedItem);

        // Tekil callback
        if (onMediaUploaded) {
          await onMediaUploaded(uploadedItem);
        }
      }

      const updatedList = [...mediaList, ...newUploadedItems];
      setMediaList(updatedList);

      // Çoklu callback
      if (onUploadComplete) {
        await onUploadComplete(updatedList);
      }
    } catch (err: unknown) {
      console.error(err);
      const msg =
        err instanceof Error
          ? err.message
          : "Yükleme sırasında bir hata oluştu.";
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeItem = (indexToRemove: number) => {
    const updated = mediaList.filter((_, idx) => idx !== indexToRemove);
    setMediaList(updated);
    if (onUploadComplete) {
      onUploadComplete(updated);
    }
  };

  const getTypeIcon = (type: MediaType) => {
    switch (type) {
      case "VIDEO":
        return <Video className="h-3.5 w-3.5 text-blue-400" />;
      case "PANORAMA_360":
        return <Compass className="h-3.5 w-3.5 text-emerald-400" />;
      case "DRONE":
        return <Plane className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <ImageIcon className="h-3.5 w-3.5 text-gold-400" />;
    }
  };

  return (
    <div
      className={`rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl shadow-luxury-glass ${className}`}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
            <span>Cloudinary Medya & 360 Sanal Tur Yükleyici</span>
            <Badge variant="gold" className="text-[10px]">
              PageSpeed CDN
            </Badge>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            4K HDR fotoğraflar, 360° panorama eşyalandırma ve drone videoları için optimize edilmiş depolama.
          </p>
        </div>
      </div>

      {/* Control Bar: Media Type, Room Preset, Virtual Staging */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Media Type */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Medya Türü
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { type: "IMAGE" as MediaType, label: "Fotoğraf", icon: ImageIcon },
              { type: "PANORAMA_360" as MediaType, label: "360° Tur", icon: Compass },
              { type: "DRONE" as MediaType, label: "Drone Hava", icon: Plane },
              { type: "VIDEO" as MediaType, label: "Video", icon: Video },
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
                  selectedType === type
                    ? "border-gold-500 bg-gold-500/15 text-gold-400"
                    : "border-border bg-background/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Room Label */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Oda / Alan Etiketi
          </label>
          <select
            value={selectedRoom}
            onChange={(e) => {
              setSelectedRoom(e.target.value);
              setCustomRoom("");
            }}
            className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-xs text-foreground focus:border-gold-500 focus:outline-none"
          >
            {ROOM_PRESETS.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="veya özel etiket yazın (Örn: Helipad)"
            value={customRoom}
            onChange={(e) => setCustomRoom(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-gold-500 focus:outline-none"
          />
        </div>

        {/* AI Virtual Staging Switch & Summary */}
        <div className="flex flex-col justify-between">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Yapay Zeka (AI) Seçeneği
            </label>
            <label className="flex items-center gap-2.5 rounded-xl border border-border bg-background/60 p-2.5 cursor-pointer hover:border-gold-500/40 transition-colors">
              <input
                type="checkbox"
                checked={isStaged}
                onChange={(e) => setIsStaged(e.target.checked)}
                className="h-4 w-4 rounded border-border text-gold-500 focus:ring-gold-500"
              />
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>AI Virtual Staging (Sanal Eşyalı)</span>
              </div>
            </label>
          </div>

          <p className="text-[11px] text-muted-foreground mt-2">
            Maksimum {maxFiles} dosya seçimi yapılabilir.
          </p>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          isUploading
            ? "border-gold-500/40 bg-gold-500/5 cursor-wait"
            : "border-border hover:border-gold-500/50 hover:bg-gold-500/5"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={
            selectedType === "VIDEO"
              ? "video/*"
              : "image/*,image/heic,image/heif"
          }
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-gold-400 animate-spin" />
            <p className="mt-3 text-xs font-semibold text-foreground">
              {uploadProgress || "Cloudinary CDN yüklemesi devam ediyor..."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-500/30 bg-gold-500/10 text-gold-400 shadow-gold-sm">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-foreground">
              Dosyaları buraya sürükleyin veya <span className="text-gold-400 underline">gözatın</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPEG, PNG, WebP, 360 Equirectangular Panorama veya MP4 Video (Max 50MB)
            </p>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Uploaded Media List Preview */}
      {mediaList.length > 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Yüklenen Medyalar ({mediaList.length})
            </h4>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3 w-3" />
              Cloudinary CDN Senkronize
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {mediaList.map((item, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl border border-border bg-card/80 p-1.5 shadow-sm"
              >
                <div className="relative h-24 w-full overflow-hidden rounded-lg bg-obsidian-900">
                  {item.type === "VIDEO" ? (
                    <div className="flex h-full w-full items-center justify-center bg-navy-950 text-gold-400">
                      <Video className="h-8 w-8" />
                    </div>
                  ) : (
                    <Image
                      src={item.url}
                      alt={item.roomLabel || "Medya"}
                      fill
                      sizes="150px"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(index);
                    }}
                    className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-obsidian-950/80 text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>

                  {/* Room Label Badge */}
                  {item.roomLabel && (
                    <span className="absolute bottom-1 left-1 max-w-[85%] truncate rounded bg-obsidian-950/80 px-1.5 py-0.5 text-[9px] font-medium text-foreground backdrop-blur-xs">
                      {item.roomLabel}
                    </span>
                  )}
                </div>

                <div className="mt-1.5 flex items-center justify-between px-1 text-[10px]">
                  <span className="flex items-center gap-1 text-muted-foreground font-medium">
                    {getTypeIcon(item.type)}
                    <span>{item.type}</span>
                  </span>

                  {item.isStaged && (
                    <span className="font-semibold text-purple-400">AI</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

