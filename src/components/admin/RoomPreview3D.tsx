"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { CubemapFaces } from "@/lib/cubemap-to-equirectangular";
import type { SavedTourHotspot, SavedTourLink } from "@/lib/actions/tour";
import { Compass, Info, Navigation, Sparkles, ZoomIn, ZoomOut } from "lucide-react";

export interface ClickedCoords3D {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

interface ProjectedMarker {
  id: string;
  screenX: number;
  screenY: number;
  visible: boolean;
}

export interface RoomPreview3DProps {
  mode: "equirectangular" | "cubemap";
  panoramaUrl: string;
  cubemapFaces?: CubemapFaces;
  hotspots: SavedTourHotspot[];
  links: SavedTourLink[];
  interactionMode: "explore" | "add-hotspot" | "add-link";
  focusCoords?: { x: number; y: number; z: number } | null;
  onPointClick?: (coords: ClickedCoords3D) => void;
  onHotspotClick?: (hotspot: SavedTourHotspot) => void;
  onLinkClick?: (link: SavedTourLink) => void;
}

const SPHERE_RADIUS = 10;

// Boş küp yüzü için koyu mimari ızgara placeholder dokusu üretir
function createPlaceholderFaceDataUrl(label: string): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#080b12";
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = "rgba(212, 175, 55, 0.16)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 256; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(212, 175, 55, 0.45)";
  ctx.strokeRect(8, 8, 240, 240);

  ctx.fillStyle = "rgba(212, 175, 55, 0.65)";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 128, 128);

  return canvas.toDataURL("image/png");
}

export function RoomPreview3D({
  mode,
  panoramaUrl,
  cubemapFaces,
  hotspots,
  links,
  interactionMode,
  focusCoords,
  onPointClick,
  onHotspotClick,
  onLinkClick,
}: RoomPreview3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoadingTexture, setIsLoadingTexture] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hoverCoords, setHoverCoords] = useState<ClickedCoords3D | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<SavedTourHotspot | null>(null);
  const [markerPositions, setMarkerPositions] = useState<Record<string, ProjectedMarker>>({});
  const [fovDisplay, setFovDisplay] = useState(72);

  // Camera orientation state held in refs for 60fps loop
  const cameraAnglesRef = useRef({ lon: 0, lat: 0, fov: 72 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const hotspotsRef = useRef(hotspots);
  const linksRef = useRef(links);
  const interactionModeRef = useRef(interactionMode);
  const onPointClickRef = useRef(onPointClick);

  hotspotsRef.current = hotspots;
  linksRef.current = links;
  interactionModeRef.current = interactionMode;
  onPointClickRef.current = onPointClick;

  // Focus camera externally when focusCoords changes
  useEffect(() => {
    if (!focusCoords) return;
    const { x, y, z } = focusCoords;
    const r = Math.sqrt(x * x + y * y + z * z) || SPHERE_RADIUS;
    const lat = THREE.MathUtils.radToDeg(
      Math.asin(THREE.MathUtils.clamp(y / r, -1, 1))
    );
    const lon = THREE.MathUtils.radToDeg(Math.atan2(z, x));
    cameraAnglesRef.current.lat = Math.max(-85, Math.min(85, lat));
    cameraAnglesRef.current.lon = lon;
  }, [focusCoords]);

  const adjustZoom = (delta: number) => {
    const nextFov = Math.max(35, Math.min(95, cameraAnglesRef.current.fov + delta));
    cameraAnglesRef.current.fov = nextFov;
    setFovDisplay(nextFov);
    if (cameraRef.current) {
      cameraRef.current.fov = nextFov;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDisposed = false;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      cameraAnglesRef.current.fov,
      width / height,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Radius 10 Sphere for Raycasting X, Y, Z & Equirectangular texture mapping
    const sphereGeo = new THREE.SphereGeometry(SPHERE_RADIUS, 64, 32);
    sphereGeo.scale(-1, 1, 1);

    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: mode === "cubemap",
      opacity: mode === "cubemap" ? 0 : 1,
    });

    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);

    const raycaster = new THREE.Raycaster();
    const camDir = new THREE.Vector3();

    // Texture Loader (CubeTextureLoader vs TextureLoader)
    setIsLoadingTexture(true);
    setLoadError(null);

    let loadedTexture: THREE.Texture | THREE.CubeTexture | null = null;

    if (mode === "cubemap") {
      const cubeLoader = new THREE.CubeTextureLoader();
      cubeLoader.setCrossOrigin("anonymous");

      const faces: CubemapFaces = cubemapFaces || {
        front: "",
        back: "",
        left: "",
        right: "",
        top: "",
        bottom: "",
      };

      // Three.js CubeTextureLoader order: [+X (Right), -X (Left), +Y (Top), -Y (Bottom), +Z (Front), -Z (Back)]
      const faceUrls = [
        faces.right || createPlaceholderFaceDataUrl("SAĞ (+X)"),
        faces.left || createPlaceholderFaceDataUrl("SOL (-X)"),
        faces.top || createPlaceholderFaceDataUrl("ÜST (+Y)"),
        faces.bottom || createPlaceholderFaceDataUrl("ALT (-Y)"),
        faces.front || createPlaceholderFaceDataUrl("ÖN (+Z)"),
        faces.back || createPlaceholderFaceDataUrl("ARKA (-Z)"),
      ];

      cubeLoader.load(
        faceUrls,
        (cubeTexture) => {
          if (isDisposed) {
            cubeTexture.dispose();
            return;
          }
          cubeTexture.colorSpace = THREE.SRGBColorSpace;
          loadedTexture = cubeTexture;
          scene.background = cubeTexture;
          setIsLoadingTexture(false);
        },
        undefined,
        () => {
          if (!isDisposed) {
            setLoadError("Cubemap görselleri yüklenirken ağ/CORS hatası oluştu.");
            setIsLoadingTexture(false);
          }
        }
      );
    } else {
      const texLoader = new THREE.TextureLoader();
      texLoader.setCrossOrigin("anonymous");

      texLoader.load(
        panoramaUrl,
        (texture) => {
          if (isDisposed) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          loadedTexture = texture;
          sphereMat.map = texture;
          sphereMat.transparent = false;
          sphereMat.opacity = 1;
          sphereMat.needsUpdate = true;
          setIsLoadingTexture(false);
        },
        undefined,
        () => {
          if (!isDisposed) {
            setLoadError("360° panorama görseli yüklenemedi.");
            setIsLoadingTexture(false);
          }
        }
      );
    }

    // Pointer Interaction State
    let isPointerDown = false;
    let pointerDownPos = { x: 0, y: 0 };
    let startAngles = { lon: 0, lat: 0 };

    const computeCoordsFromClient = (clientX: number, clientY: number): ClickedCoords3D | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(ndc, camera);
      const intersects = raycaster.intersectObject(sphereMesh);
      if (intersects.length === 0) return null;

      const p = intersects[0].point;
      const x = Number(p.x.toFixed(2));
      const y = Number(p.y.toFixed(2));
      const z = Number(p.z.toFixed(2));
      const r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) || SPHERE_RADIUS;
      const pitch = Number(
        Math.asin(THREE.MathUtils.clamp(p.y / r, -1, 1)).toFixed(3)
      );
      const yaw = Number(Math.atan2(p.x, -p.z).toFixed(3));

      return { x, y, z, yaw, pitch };
    };

    const handlePointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      startAngles = { ...cameraAnglesRef.current };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isPointerDown) {
        const dx = pointerDownPos.x - e.clientX;
        const dy = e.clientY - pointerDownPos.y;
        cameraAnglesRef.current.lon = startAngles.lon + dx * 0.16;
        cameraAnglesRef.current.lat = Math.max(
          -85,
          Math.min(85, startAngles.lat + dy * 0.16)
        );
      } else {
        const coords = computeCoordsFromClient(e.clientX, e.clientY);
        if (coords) {
          setHoverCoords(coords);
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!isPointerDown) return;
      isPointerDown = false;

      const dist = Math.hypot(
        e.clientX - pointerDownPos.x,
        e.clientY - pointerDownPos.y
      );
      // Clean click (not drag) -> Capture 3D X, Y, Z coordinates
      if (dist < 6) {
        const coords = computeCoordsFromClient(e.clientX, e.clientY);
        if (coords) {
          setSelectedHotspot(null);
          if (onPointClickRef.current) {
            onPointClickRef.current(coords);
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const nextFov = Math.max(
        35,
        Math.min(95, cameraAnglesRef.current.fov + e.deltaY * 0.04)
      );
      cameraAnglesRef.current.fov = nextFov;
      setFovDisplay(Math.round(nextFov));
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    domEl.addEventListener("wheel", handleWheel, { passive: false });

    const handleResize = () => {
      if (!container || isDisposed) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 60FPS Render Loop & 3D->2D Marker Projection
    let animId = 0;
    const targetVec = new THREE.Vector3();
    const projVec = new THREE.Vector3();

    const animate = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      const { lon, lat } = cameraAnglesRef.current;
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);

      targetVec.set(
        SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta),
        SPHERE_RADIUS * Math.cos(phi),
        SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(targetVec);
      camera.updateMatrixWorld();
      renderer.render(scene, camera);

      // Project 3D (x, y, z) markers to 2D CSS overlay coordinates
      camera.getWorldDirection(camDir);
      const cw = container.clientWidth || 800;
      const ch = container.clientHeight || 520;
      const nextPositions: Record<string, ProjectedMarker> = {};

      const allItems = [
        ...hotspotsRef.current.map((h) => ({ id: h.id, x: h.x, y: h.y, z: h.z })),
        ...linksRef.current.map((l) => ({ id: l.id, x: l.x, y: l.y, z: l.z })),
      ];

      for (const item of allItems) {
        projVec.set(item.x, item.y, item.z);
        const dirToPoint = projVec.clone().normalize();
        const inFront = camDir.dot(dirToPoint) > 0.1;

        if (!inFront) {
          nextPositions[item.id] = { id: item.id, screenX: -999, screenY: -999, visible: false };
          continue;
        }

        projVec.project(camera);
        const screenX = (projVec.x * 0.5 + 0.5) * cw;
        const screenY = (-projVec.y * 0.5 + 0.5) * ch;
        nextPositions[item.id] = {
          id: item.id,
          screenX,
          screenY,
          visible: screenX >= -40 && screenX <= cw + 40 && screenY >= -40 && screenY <= ch + 40,
        };
      }

      setMarkerPositions(nextPositions);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      domEl.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      domEl.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      if (loadedTexture) loadedTexture.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      renderer.dispose();
    };
  }, [mode, panoramaUrl, cubemapFaces]);

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] overflow-hidden rounded-2xl border border-gold-500/30 bg-[#04060a] select-none">
      {/* Three.js WebGL Mount */}
      <div
        ref={mountRef}
        className={`w-full h-full ${
          interactionMode === "add-hotspot"
            ? "cursor-crosshair"
            : interactionMode === "add-link"
            ? "cursor-cell"
            : "cursor-grab active:cursor-grabbing"
        }`}
      />

      {/* Loading Indicator */}
      {isLoadingTexture && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
          <Compass className="h-10 w-10 text-gold-400 animate-spin" />
          <p className="mt-3 text-xs font-semibold text-gold-300">
            {mode === "cubemap"
              ? "Three.js CubeTextureLoader ile 6 Yüz Sanal Odaya Dönüştürülüyor..."
              : "360° Equirectangular Küre Sahnesi Yükleniyor..."}
          </p>
        </div>
      )}

      {/* Error Indicator */}
      {loadError && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 rounded-xl border border-red-500/40 bg-red-950/80 px-4 py-2 text-xs text-red-300 backdrop-blur-md">
          {loadError}
        </div>
      )}

      {/* Projected 3D Hotspot Markers */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {hotspots.map((hs) => {
          const pos = markerPositions[hs.id];
          if (!pos || !pos.visible) return null;

          return (
            <button
              key={hs.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHotspot(hs);
                onHotspotClick?.(hs);
              }}
              style={{
                left: `${pos.screenX}px`,
                top: `${pos.screenY}px`,
              }}
              className="pointer-events-auto group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center focus:outline-none"
            >
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-gold-400 bg-obsidian-950/90 text-gold-400 shadow-[0_0_20px_rgba(212,175,55,0.65)] transition-transform group-hover:scale-115">
                <span className="absolute inset-0 rounded-full border border-gold-400 animate-ping opacity-40" />
                <Info className="h-4 w-4" />
              </span>
              <span className="mt-1.5 whitespace-nowrap rounded-full border border-gold-500/40 bg-black/90 px-2.5 py-0.5 text-[10px] font-semibold text-gold-300 shadow-lg backdrop-blur-md">
                {hs.title}
              </span>
            </button>
          );
        })}

        {/* Projected 3D Room Navigation Links */}
        {links.map((lk) => {
          const pos = markerPositions[lk.id];
          if (!pos || !pos.visible) return null;

          return (
            <button
              key={lk.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLinkClick?.(lk);
              }}
              style={{
                left: `${pos.screenX}px`,
                top: `${pos.screenY}px`,
              }}
              className="pointer-events-auto group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center focus:outline-none"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-sky-400 bg-sky-950/90 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.6)] transition-transform group-hover:scale-110">
                <Navigation className="h-4 w-4" />
              </span>
              <span className="mt-1.5 whitespace-nowrap rounded-full border border-sky-400/40 bg-black/90 px-2.5 py-0.5 text-[10px] font-semibold text-sky-300 shadow-lg">
                {lk.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Hotspot Info Popover */}
      {selectedHotspot && (
        <div className="absolute top-4 right-4 z-30 w-72 rounded-2xl border border-gold-500/40 bg-[#080b12]/95 p-4 text-xs shadow-2xl backdrop-blur-xl">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {selectedHotspot.category}
              </span>
              <h5 className="font-serif text-sm font-bold text-white mt-0.5">
                {selectedHotspot.title}
              </h5>
            </div>
            <button
              type="button"
              onClick={() => setSelectedHotspot(null)}
              className="text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          {selectedHotspot.description && (
            <p className="mt-2 text-[11px] text-zinc-300 leading-relaxed">
              {selectedHotspot.description}
            </p>
          )}
          <div className="mt-3 pt-2 border-t border-white/10 font-mono text-[10px] text-gold-400">
            X: {selectedHotspot.x} | Y: {selectedHotspot.y} | Z: {selectedHotspot.z}
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/80 p-1 backdrop-blur-md">
        <button
          type="button"
          onClick={() => adjustZoom(-10)}
          title="Yakınlaştır"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-gold-500/20 hover:text-gold-400"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <span className="px-1.5 font-mono text-[10px] text-zinc-400">
          {fovDisplay}°
        </span>
        <button
          type="button"
          onClick={() => adjustZoom(10)}
          title="Uzaklaştır"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-300 hover:bg-gold-500/20 hover:text-gold-400"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Live 3D Raycaster X, Y, Z Coordinates HUD */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-gold-500/30 bg-black/85 px-3.5 py-2 text-[11px] font-mono text-zinc-300 backdrop-blur-md">
        <span className="text-gold-400 font-bold">
          {mode === "cubemap" ? "Three.js CubeTexture" : "360° Sphere"}
        </span>
        <span className="text-zinc-600">|</span>
        {hoverCoords ? (
          <span>
            İmleç 3B: <strong className="text-gold-300">X={hoverCoords.x}</strong>{" "}
            <strong className="text-emerald-400">Y={hoverCoords.y}</strong>{" "}
            <strong className="text-sky-400">Z={hoverCoords.z}</strong>
          </span>
        ) : (
          <span>Üzerine tıklayarak X, Y, Z koordinatı seçin</span>
        )}
      </div>
    </div>
  );
}

