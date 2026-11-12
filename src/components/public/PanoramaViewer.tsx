"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Compass,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface PanoramaRoom {
  id: string;
  name: string;
  imageUrl: string;
  isStaged?: boolean;
}

export interface PanoramaViewerProps {
  rooms?: PanoramaRoom[];
  initialRoomId?: string;
  propertyTitle?: string;
  className?: string;
}

const DEFAULT_ROOMS: PanoramaRoom[] = [
  {
    id: "salon",
    name: "Ana Salon & Boğaz Cephesi",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=90",
    isStaged: true,
  },
  {
    id: "suite",
    name: "Master Süit & Teras",
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=90",
    isStaged: true,
  },
  {
    id: "havuz",
    name: "Sonsuzluk Havuzu & İskele",
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=90",
    isStaged: false,
  },
];

export function PanoramaViewer({
  rooms = DEFAULT_ROOMS,
  initialRoomId,
  propertyTitle = "The Bosphorus Waterfront Palace",
  className = "",
}: PanoramaViewerProps) {
  const [currentRoomIndex, setCurrentRoomIndex] = useState(
    Math.max(
      0,
      rooms.findIndex((r) => r.id === initialRoomId)
    )
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const currentRoom = rooms[currentRoomIndex] || rooms[0];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragOffset({
      x: e.clientX - startPos.x,
      y: Math.max(-50, Math.min(50, e.clientY - startPos.y)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-3xl border border-gold-500/30 bg-obsidian-950 shadow-luxury-glass ${
        isFullscreen ? "h-screen w-screen rounded-none" : "h-[560px] w-full"
      } ${className}`}
    >
      {/* 360 Interactive Canvas Container */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative h-full w-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
      >
        <div
          style={{
            transform: `scale(${zoomLevel}) translate(${dragOffset.x * 0.15}px, ${dragOffset.y * 0.15}px)`,
            transition: isDragging ? "none" : "transform 0.4s ease-out",
          }}
          className="relative h-full w-[140%] -left-[20%]"
        >
          <Image
            src={currentRoom.imageUrl}
            alt={currentRoom.name}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />
        </div>

        {/* Hotspot: Living Area details */}
        <div
          style={{
            transform: `translate(${dragOffset.x * 0.15 + 100}px, ${dragOffset.y * 0.15}px)`,
          }}
          className="absolute top-1/2 left-1/3 z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
        >
          <div className="group relative flex items-center justify-center">
            <span className="absolute -inset-2 rounded-full bg-gold-500/25 animate-ping opacity-75" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold-400 bg-obsidian-950/90 text-gold-400 shadow-gold-sm transition-transform group-hover:scale-110">
              <Eye className="h-4 w-4" />
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden w-44 rounded-xl border border-gold-500/30 bg-obsidian-950/90 p-2 text-center text-[11px] text-foreground backdrop-blur-md group-hover:block shadow-luxury-glass">
              <p className="font-semibold text-gold-400">Gaggenau Tasarım Mutfak</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Doğal İtalyan Calacatta Mermer Ada
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Controls Overlay */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 z-30 flex items-center justify-between">
        <div className="pointer-events-auto flex items-center gap-2">
          <Badge variant="gold" className="shadow-luxury-glass backdrop-blur-xl">
            <Compass className="h-3.5 w-3.5 text-gold-400 animate-spin-slow" />
            <span>360° VR Sanal Tur</span>
          </Badge>

          {currentRoom.isStaged && (
            <Badge variant="staged" className="shadow-luxury-glass backdrop-blur-xl">
              <Sparkles className="h-3 w-3 text-purple-300" />
              <span>AI Virtual Staged</span>
            </Badge>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-obsidian-950/80 p-1 backdrop-blur-xl">
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gold-400 hover:bg-gold-500/15 transition-colors"
            title="Yakınlaştır"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gold-400 hover:bg-gold-500/15 transition-colors"
            title="Uzaklaştır"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setDragOffset({ x: 0, y: 0 });
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gold-400 hover:bg-gold-500/15 transition-colors"
            title="Açıyı Sıfırla"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gold-400 hover:bg-gold-500/15 transition-colors"
            title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Room Selector Overlay */}
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="pointer-events-auto rounded-xl border border-gold-500/20 bg-obsidian-950/80 px-3.5 py-1.5 backdrop-blur-md">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {propertyTitle}
          </p>
          <p className="font-serif text-sm font-bold text-gold-400">
            {currentRoom.name}
          </p>
        </div>

        {/* Room Navigation Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-gold-500/30 bg-obsidian-950/80 p-1.5 backdrop-blur-xl">
          <button
            onClick={() =>
              setCurrentRoomIndex((i) => (i > 0 ? i - 1 : rooms.length - 1))
            }
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gold-400 hover:bg-gold-500/15 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            {rooms.map((room, idx) => (
              <button
                key={room.id}
                onClick={() => {
                  setCurrentRoomIndex(idx);
                  setDragOffset({ x: 0, y: 0 });
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  idx === currentRoomIndex
                    ? "bg-gold-500 text-obsidian-950 font-semibold shadow-gold-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {room.name.split("&")[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentRoomIndex((i) => (i < rooms.length - 1 ? i + 1 : 0))
            }
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gold-400 hover:bg-gold-500/15 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

