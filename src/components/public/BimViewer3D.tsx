"use client";

import React, { useState, useRef, Suspense, type ElementRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Grid,
  Html,
  useGLTF,
  Center,
} from "@react-three/drei";
import * as THREE from "three";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Layers,
  Box,
  Sun,
  Moon,
  Eye,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface BimViewerProps {
  modelUrl?: string; // Optional external .glb or .gltf URL
  propertyTitle?: string;
  className?: string;
}

// Procedural Parametric BIM Architectural Villa
function ArchitecturalBimModel({
  wireframe = false,
  floorLevel = "all", // "all" | "ground" | "first" | "roof"
  nightMode = false,
  showAnnotations = true,
}: {
  wireframe: boolean;
  floorLevel: string;
  nightMode: boolean;
  showAnnotations: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle idle animation
  useFrame((state) => {
    if (groupRef.current && !state.clock) return;
  });

  // Materials with luxury architecture styling
  const travertineMat = new THREE.MeshStandardMaterial({
    color: nightMode ? "#1a1e28" : "#e8e2d5",
    roughness: 0.6,
    metalness: 0.1,
    wireframe,
  });

  const obsidianSteelMat = new THREE.MeshStandardMaterial({
    color: nightMode ? "#12141c" : "#1e222d",
    roughness: 0.3,
    metalness: 0.8,
    wireframe,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: nightMode ? "#2a3d66" : "#a8c7e8",
    transparent: true,
    opacity: nightMode ? 0.45 : 0.35,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.7,
    ior: 1.5,
    wireframe,
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: "#d4af37",
    roughness: 0.25,
    metalness: 0.85,
    wireframe,
  });

  const woodSlatsMat = new THREE.MeshStandardMaterial({
    color: nightMode ? "#332218" : "#8c5835",
    roughness: 0.7,
    metalness: 0.05,
    wireframe,
  });

  const poolWaterMat = new THREE.MeshStandardMaterial({
    color: nightMode ? "#0d3b66" : "#2094c9",
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.8,
    wireframe,
  });

  const isGroundVisible = floorLevel === "all" || floorLevel === "ground";
  const isFirstVisible = floorLevel === "all" || floorLevel === "first";
  const isRoofVisible = floorLevel === "all" || floorLevel === "roof";

  return (
    <group ref={groupRef}>
      {/* =========================================================================
          PODIUM & GROUND BASE (Zemin & Peyzaj)
          ========================================================================= */}
      {isGroundVisible && (
        <group position={[0, -0.4, 0]}>
          {/* Main Travertine Terrace Slab */}
          <mesh position={[0, 0, 0]} material={travertineMat} receiveShadow>
            <boxGeometry args={[14, 0.4, 11]} />
          </mesh>

          {/* Stepped Water Basin */}
          <mesh position={[0, -0.1, 4.8]} material={travertineMat}>
            <boxGeometry args={[11, 0.3, 2.5]} />
          </mesh>

          {/* Infinity Pool Water Surface */}
          <mesh position={[0, 0.06, 4.8]} material={poolWaterMat}>
            <boxGeometry args={[10, 0.05, 2.0]} />
          </mesh>

          {/* Gold Inset Pool Perimeter Line */}
          <mesh position={[0, 0.08, 4.8]} material={goldAccentMat}>
            <boxGeometry args={[10.3, 0.02, 2.2]} />
          </mesh>

          {/* Sunken Lounge Seating on Deck */}
          <mesh position={[-4.5, 0.1, 1.8]} material={obsidianSteelMat}>
            <boxGeometry args={[3, 0.2, 3]} />
          </mesh>
        </group>
      )}

      {/* =========================================================================
          LEVEL 0: GROUND FLOOR LIVING & GRAND SALON (Zemin Kat)
          ========================================================================= */}
      {isGroundVisible && (
        <group position={[0, 0.7, 0]}>
          {/* Main Enclosed Living Core (Solid Walls) */}
          <mesh position={[-2.2, 0, -1.5]} material={travertineMat} castShadow receiveShadow>
            <boxGeometry args={[5, 1.8, 5]} />
          </mesh>

          {/* High-ceiling Glass Curtain Pavilion (Grand Salon) */}
          <mesh position={[2.5, 0, 0.5]} material={glassMat}>
            <boxGeometry args={[6.5, 1.8, 6.5]} />
          </mesh>

          {/* Obsidian Steel Mullions & Columns */}
          <mesh position={[5.6, 0, 3.6]} material={obsidianSteelMat}>
            <boxGeometry args={[0.15, 1.8, 0.15]} />
          </mesh>
          <mesh position={[-0.6, 0, 3.6]} material={obsidianSteelMat}>
            <boxGeometry args={[0.15, 1.8, 0.15]} />
          </mesh>
          <mesh position={[5.6, 0, -2.6]} material={obsidianSteelMat}>
            <boxGeometry args={[0.15, 1.8, 0.15]} />
          </mesh>

          {/* Interior Floating Marble Fireplace Column */}
          <mesh position={[1.5, 0, 0]} material={goldAccentMat}>
            <boxGeometry args={[0.4, 1.8, 1.8]} />
          </mesh>
        </group>
      )}

      {/* =========================================================================
          LEVEL 1: CANTILEVERED UPPER SUITES (1. Kat & Ebeveyn Odaları)
          ========================================================================= */}
      {isFirstVisible && (
        <group position={[0, 2.2, 0]}>
          {/* Suspended Intermediate Slab */}
          <mesh position={[0, -0.3, 0]} material={obsidianSteelMat}>
            <boxGeometry args={[13.5, 0.25, 9.5]} />
          </mesh>

          {/* Floating Cantilever Master Bedroom Wing (Protruding Left & Forward) */}
          <mesh position={[-2.8, 0.6, 0.8]} material={travertineMat} castShadow>
            <boxGeometry args={[6.5, 1.6, 6]} />
          </mesh>

          {/* Teak Wood Louver Sunshade Screen */}
          <mesh position={[-2.8, 0.6, 3.9]} material={woodSlatsMat}>
            <boxGeometry args={[6.3, 1.5, 0.1]} />
          </mesh>

          {/* Panoramic Suite Corner Glass */}
          <mesh position={[2.2, 0.6, -0.5]} material={glassMat}>
            <boxGeometry args={[5.5, 1.6, 4.5]} />
          </mesh>

          {/* Upper Terrace Balcony Railing */}
          <mesh position={[1.8, 0.3, 2.8]} material={glassMat}>
            <boxGeometry args={[6, 0.6, 0.05]} />
          </mesh>
          <mesh position={[1.8, 0.6, 2.8]} material={goldAccentMat}>
            <boxGeometry args={[6.05, 0.05, 0.08]} />
          </mesh>
        </group>
      )}

      {/* =========================================================================
          LEVEL 2: ROOFTOP SKY LOUNGE & CANOPY (Çatı Terası & Pergola)
          ========================================================================= */}
      {isRoofVisible && (
        <group position={[0, 3.5, 0]}>
          {/* Main Roof Slab */}
          <mesh position={[-0.5, 0, 0]} material={obsidianSteelMat}>
            <boxGeometry args={[11, 0.2, 8]} />
          </mesh>

          {/* Floating Modernist Pergola Canopy with Slats */}
          <group position={[2.2, 0.8, 0.5]}>
            <mesh position={[0, 0, 0]} material={goldAccentMat}>
              <boxGeometry args={[5, 0.08, 4.5]} />
            </mesh>
            {/* Pergola Columns */}
            <mesh position={[-2.3, -0.4, -2]} material={obsidianSteelMat}>
              <boxGeometry args={[0.1, 0.8, 0.1]} />
            </mesh>
            <mesh position={[2.3, -0.4, -2]} material={obsidianSteelMat}>
              <boxGeometry args={[0.1, 0.8, 0.1]} />
            </mesh>
            <mesh position={[-2.3, -0.4, 2]} material={obsidianSteelMat}>
              <boxGeometry args={[0.1, 0.8, 0.1]} />
            </mesh>
            <mesh position={[2.3, -0.4, 2]} material={obsidianSteelMat}>
              <boxGeometry args={[0.1, 0.8, 0.1]} />
            </mesh>
          </group>

          {/* Stairwell / Elevator Core Tower */}
          <mesh position={[-3.5, 0.6, -1.8]} material={travertineMat}>
            <boxGeometry args={[2.5, 1.2, 2.5]} />
          </mesh>
        </group>
      )}

      {/* =========================================================================
          3D FLOATING BIM ANNOTATIONS & LABELS (HTML 3D Tooltips)
          ========================================================================= */}
      {showAnnotations && (
        <>
          {/* Annotation: Sonsuzluk Havuzu */}
          <Html position={[0, 0.3, 4.8]} center distanceFactor={14}>
            <div className="pointer-events-none select-none rounded-full border border-gold-500/60 bg-[#06070a]/90 px-2.5 py-1 text-[10px] font-semibold text-gold-300 shadow-xl backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap animate-bounce">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>18m Isıtmalı Sonsuzluk Havuzu</span>
            </div>
          </Html>

          {/* Annotation: Master Suite Cantilever */}
          <Html position={[-3.2, 3.2, 3.5]} center distanceFactor={14}>
            <div className="pointer-events-none select-none rounded-full border border-gold-500/60 bg-[#06070a]/90 px-2.5 py-1 text-[10px] font-semibold text-gold-300 shadow-xl backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              <span>Master Süit & Boğaz Balkonu (+3.80m)</span>
            </div>
          </Html>

          {/* Annotation: Grand Salon */}
          <Html position={[4, 1.2, 2.5]} center distanceFactor={14}>
            <div className="pointer-events-none select-none rounded-full border border-gold-500/60 bg-[#06070a]/90 px-2.5 py-1 text-[10px] font-semibold text-gold-300 shadow-xl backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Panoramik Cam Salon (7.2m Tavan)</span>
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

// Custom External GLTF Loader Component
function ExternalGltfModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export function BimViewer3D({
  modelUrl,
  propertyTitle = "The Bosphorus Waterfront Palace",
  className = "",
}: BimViewerProps) {
  const [wireframe, setWireframe] = useState(false);
  const [floorLevel, setFloorLevel] = useState<"all" | "ground" | "first" | "roof">("all");
  const [nightMode, setNightMode] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);

  // Reset Camera View
  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // Fullscreen toggle
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

  return (
    <div
      ref={containerRef}
      className={`group relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-gold-500/30 bg-[#06070a] shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all duration-300 ${className}`}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div className="relative h-[480px] w-full sm:h-[600px] md:h-[660px] cursor-grab active:cursor-grabbing">
        <Canvas
          shadows
          gl={{ antialias: true, alpha: false }}
          className="w-full h-full"
        >
          {/* Background color based on day/night mode */}
          <color attach="background" args={[nightMode ? "#06080e" : "#0c1017"]} />

          {/* Perspective Camera */}
          <PerspectiveCamera makeDefault position={[15, 10, 16]} fov={40} />

          {/* Lighting Rig */}
          <ambientLight intensity={nightMode ? 0.35 : 0.85} />
          <directionalLight
            position={[15, 25, 12]}
            intensity={nightMode ? 0.4 : 1.6}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          {nightMode ? (
            <>
              {/* Warm interior & pool lighting for night scene */}
              <pointLight position={[2, 1.5, 1]} intensity={2.5} color="#ffd180" distance={15} />
              <pointLight position={[-3, 2.5, 1]} intensity={2.0} color="#ffb74d" distance={12} />
              <pointLight position={[0, 0.2, 5]} intensity={3.0} color="#00e5ff" distance={8} />
            </>
          ) : (
            <directionalLight position={[-10, 15, -10]} intensity={0.4} color="#e0f2fe" />
          )}

          {/* BIM Architectural Floor Grid */}
          <Grid
            position={[0, -0.65, 0]}
            args={[28, 28]}
            cellSize={1}
            cellThickness={0.8}
            cellColor={nightMode ? "#1a2233" : "#242d3d"}
            sectionSize={4}
            sectionThickness={1.5}
            sectionColor={nightMode ? "#28354d" : "#3d4b63"}
            fadeDistance={30}
            fadeStrength={1.2}
          />

          {/* 3D Model with Center Alignment */}
          <Center top>
            <Suspense fallback={null}>
              {modelUrl ? (
                <ExternalGltfModel url={modelUrl} />
              ) : (
                <ArchitecturalBimModel
                  wireframe={wireframe}
                  floorLevel={floorLevel}
                  nightMode={nightMode}
                  showAnnotations={showAnnotations}
                />
              )}
            </Suspense>
          </Center>

          {/* Orbit Controls (Rotation, Pitch, Zoom, Damping) */}
          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.06}
            autoRotate={autoRotate}
            autoRotateSpeed={0.8}
            maxPolarAngle={Math.PI / 2 - 0.05} // Do not dip below the ground
            minDistance={6}
            maxDistance={32}
          />
        </Canvas>
      </div>

      {/* Top Header Bar: Property Info & Mode Badges */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6 bg-gradient-to-b from-[#06070a]/90 via-[#06070a]/40 to-transparent">
        <div className="pointer-events-auto flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/40 bg-[#06070a]/80 shadow-[0_0_15px_rgba(212,175,55,0.25)] backdrop-blur-md">
            <Box className="h-4 w-4 text-gold-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold tracking-widest text-gold-500 uppercase">
                BIM Dijital İkiz (3D Model)
              </span>
              <span className="inline-block h-1 w-1 rounded-full bg-gold-400" />
              <span className="text-[10px] text-zinc-400 hidden sm:inline">
                {propertyTitle}
              </span>
            </div>
            <h4 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide">
              İnteraktif Mimari & Kesit Modeli
            </h4>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          <Badge
            variant="outline"
            className="border-gold-500/30 bg-[#06070a]/70 text-[10px] font-medium text-gold-300 backdrop-blur-md"
          >
            <Sparkles className="mr-1 h-3 w-3 text-gold-400" />
            WebGL / Fiber 3D
          </Badge>
          <Badge
            variant="outline"
            className="border-white/10 bg-[#06070a]/70 text-[10px] font-medium text-zinc-300 backdrop-blur-md hidden sm:inline-flex"
          >
            GLTF / GLB Uyumlu
          </Badge>
        </div>
      </div>

      {/* Floating Floor Selector Ribbon (Bottom Left) */}
      <div className="absolute left-4 bottom-4 z-20 flex flex-wrap items-center gap-1.5 rounded-2xl border border-gold-500/25 bg-[#06070a]/85 p-1.5 shadow-2xl backdrop-blur-xl">
        <span className="text-[10px] font-bold text-gold-400 uppercase px-2 hidden sm:inline">
          Kat Planı:
        </span>
        <button
          onClick={() => setFloorLevel("all")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            floorLevel === "all"
              ? "bg-gold-500 text-black font-bold shadow-md"
              : "text-zinc-300 hover:bg-white/10"
          }`}
        >
          Tüm Yapı
        </button>
        <button
          onClick={() => setFloorLevel("ground")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            floorLevel === "ground"
              ? "bg-gold-500 text-black font-bold shadow-md"
              : "text-zinc-300 hover:bg-white/10"
          }`}
        >
          Zemin & Havuz
        </button>
        <button
          onClick={() => setFloorLevel("first")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            floorLevel === "first"
              ? "bg-gold-500 text-black font-bold shadow-md"
              : "text-zinc-300 hover:bg-white/10"
          }`}
        >
          1. Kat Süitler
        </button>
        <button
          onClick={() => setFloorLevel("roof")}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
            floorLevel === "roof"
              ? "bg-gold-500 text-black font-bold shadow-md"
              : "text-zinc-300 hover:bg-white/10"
          }`}
        >
          Çatı Terası
        </button>
      </div>

      {/* Floating Right Controls Sidebar */}
      <div className="absolute right-3 sm:right-5 top-20 z-20 flex flex-col gap-2 rounded-2xl border border-gold-500/25 bg-[#06070a]/85 p-1.5 shadow-2xl backdrop-blur-xl">
        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Tam Ekrandan Çık" : "Tam Ekran Yap"}
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-gold-500/15 hover:text-gold-400 active:scale-95"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        {/* Day / Night Lighting Mode */}
        <button
          onClick={() => setNightMode(!nightMode)}
          title={nightMode ? "Gündüz Işığına Geç" : "Gece Mimari Aydınlatması"}
          className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-all active:scale-95 ${
            nightMode
              ? "bg-indigo-950 text-indigo-300 border border-indigo-500/40"
              : "text-zinc-300 hover:bg-gold-500/15 hover:text-gold-400"
          }`}
        >
          {nightMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* Wireframe Mode Toggle */}
        <button
          onClick={() => setWireframe(!wireframe)}
          title="BIM Tel Kafes (Wireframe) Modu"
          className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-all active:scale-95 ${
            wireframe
              ? "bg-gold-500 text-black shadow-md font-bold"
              : "text-zinc-300 hover:bg-gold-500/15 hover:text-gold-400"
          }`}
        >
          <Layers className="h-4 w-4" />
        </button>

        {/* Auto Rotate Toggle */}
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title="Otomatik Dönüşü Durdur / Başlat"
          className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-all active:scale-95 ${
            autoRotate
              ? "bg-gold-500/20 text-gold-400"
              : "text-zinc-300 hover:bg-gold-500/15 hover:text-gold-400"
          }`}
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Annotation Tooltips Toggle */}
        <button
          onClick={() => setShowAnnotations(!showAnnotations)}
          title="Mimari Bilgi Etiketlerini Göster / Gizle"
          className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl transition-all active:scale-95 ${
            showAnnotations ? "text-gold-400" : "text-zinc-500 hover:bg-white/10"
          }`}
        >
          <Info className="h-4 w-4" />
        </button>

        {/* Reset Camera View */}
        <button
          onClick={handleResetCamera}
          title="Kamera Açısını Sıfırla"
          className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-gold-500/15 hover:text-gold-400 active:scale-95"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {/* User Interaction Guide */}
      <div className="pointer-events-none absolute right-4 bottom-4 z-10 hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-[#06070a]/80 px-3.5 py-1 text-[11px] text-zinc-400 backdrop-blur-md">
        <span>Modeli fare veya parmakla 360° döndürebilir, tekerlekle yakınlaştırabilirsiniz</span>
      </div>
    </div>
  );
}

