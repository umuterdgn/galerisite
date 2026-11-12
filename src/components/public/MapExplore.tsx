"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTheme } from "next-themes";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  type MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Compass,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  ArrowUpRight,
  Sparkles,
  Plane,
  Anchor,
  GraduationCap,
  Layers,
  Loader2,
  Building2,
} from "lucide-react";

export interface MapPropertyItem {
  id: string;
  title: string;
  price: string;
  rawPrice: number;
  currency: string;
  status?: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  imageUrl: string;
  hasPanorama360?: boolean;
  poiNearby?: {
    type: "marina" | "airport" | "school" | "golf";
    label: string;
  }[];
}

interface DynamicDestination {
  key: string;
  label: string;
  count: number;
  latitude: number;
  longitude: number;
  zoom: number;
  featuredProperty: MapPropertyItem | null;
}

const ACTIVE_MAP_STATUSES = new Set(["FOR_SALE", "FOR_RENT", "OFF_MARKET"]);
const CONFIGURED_IMAGE_HOSTS = new Set([
  "res.cloudinary.com",
  "images.unsplash.com",
]);

function isConfiguredImageHost(src: string): boolean {
  try {
    const parsed = new URL(src);
    return (
      parsed.protocol === "https:" &&
      CONFIGURED_IMAGE_HOSTS.has(parsed.hostname)
    );
  } catch {
    return src.startsWith("/");
  }
}

function isValidGeoProperty(item: MapPropertyItem): boolean {
  if (item.status && !ACTIVE_MAP_STATUSES.has(item.status)) {
    return false;
  }
  return (
    typeof item.latitude === "number" &&
    typeof item.longitude === "number" &&
    Number.isFinite(item.latitude) &&
    Number.isFinite(item.longitude) &&
    item.latitude >= -90 &&
    item.latitude <= 90 &&
    item.longitude >= -180 &&
    item.longitude <= 180
  );
}

function computeZoomFromSpread(
  items: MapPropertyItem[],
  isOverview = false
): number {
  if (items.length <= 1) return 13.0;
  const lats = items.map((i) => i.latitude);
  const lngs = items.map((i) => i.longitude);
  const latSpan = Math.max(...lats) - Math.min(...lats);
  const lngSpan = Math.max(...lngs) - Math.min(...lngs);
  const maxSpan = Math.max(latSpan, lngSpan);

  if (maxSpan > 40) return 2.1;
  if (maxSpan > 15) return 3.6;
  if (maxSpan > 5) return 5.5;
  if (maxSpan > 1.2) return 8.2;
  if (maxSpan > 0.35) return 10.4;
  if (maxSpan > 0.12) return 11.6;
  if (maxSpan > 0.04) return isOverview ? 12.2 : 12.6;
  return 13.2;
}

export interface MapExploreProps {
  properties?: MapPropertyItem[];
  className?: string;
}

export function MapExplore({
  properties,
  className = "",
}: MapExploreProps) {
  const { resolvedTheme } = useTheme();
  const mapRef = useRef<MapRef>(null);
  const hasCenteredInitialView = useRef(false);

  const [fetchedProperties, setFetchedProperties] = useState<MapPropertyItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(properties === undefined);
  const [selectedProperty, setSelectedProperty] =
    useState<MapPropertyItem | null>(null);
  const [activeDestination, setActiveDestination] = useState<string>("");
  const [showPoiFilter, setShowPoiFilter] = useState<boolean>(true);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // When no SSR properties prop is provided, fetch live active listings from Prisma API
  useEffect(() => {
    if (properties !== undefined) {
      setIsLoading(false);
      return;
    }

    let isSubscribed = true;
    const controller = new AbortController();

    async function loadGeoProperties() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/properties/map", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (isSubscribed && Array.isArray(data?.properties)) {
          setFetchedProperties(data.properties);
        }
      } catch (err) {
        if ((err as { name?: string })?.name !== "AbortError") {
          console.warn("GEO map API fetch failed:", err);
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    loadGeoProperties();

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [properties]);

  // Only keep active listings with valid latitude & longitude coordinates
  const geoProperties = useMemo(() => {
    const rawList = properties !== undefined ? properties : fetchedProperties;
    return rawList.filter(isValidGeoProperty);
  }, [properties, fetchedProperties]);

  // Dynamically derive destination quick-fly buttons from database city & district values
  const destinations = useMemo<DynamicDestination[]>(() => {
    if (geoProperties.length === 0) return [];

    const cityGroups = new globalThis.Map<
      string,
      { displayCity: string; items: MapPropertyItem[] }
    >();

    for (const item of geoProperties) {
      const displayCity = item.city.trim() || "Diğer Bölge";
      const key = displayCity.toLowerCase();
      const existing = cityGroups.get(key);
      if (existing) {
        existing.items.push(item);
      } else {
        cityGroups.set(key, { displayCity, items: [item] });
      }
    }

    const derivedCities: DynamicDestination[] = Array.from(
      cityGroups.entries()
    ).map(([key, group]) => {
      const avgLat =
        group.items.reduce((sum, p) => sum + p.latitude, 0) /
        group.items.length;
      const avgLng =
        group.items.reduce((sum, p) => sum + p.longitude, 0) /
        group.items.length;

      const uniqueDistricts = Array.from(
        new Set(
          group.items
            .map((p) => p.district?.trim())
            .filter((d): d is string => Boolean(d))
        )
      );

      let label = group.displayCity;
      if (uniqueDistricts.length === 1) {
        const onlyDistrict = uniqueDistricts[0];
        label = onlyDistrict
          .toLowerCase()
          .includes(group.displayCity.toLowerCase())
          ? onlyDistrict
          : `${group.displayCity} • ${onlyDistrict}`;
      } else if (group.items.length > 1) {
        label = `${group.displayCity} (${group.items.length})`;
      }

      return {
        key: `city:${key}`,
        label,
        count: group.items.length,
        latitude: avgLat,
        longitude: avgLng,
        zoom: computeZoomFromSpread(group.items, false),
        featuredProperty: group.items[0] || null,
      };
    });

    if (derivedCities.length > 1) {
      const globalLat =
        geoProperties.reduce((sum, p) => sum + p.latitude, 0) /
        geoProperties.length;
      const globalLng =
        geoProperties.reduce((sum, p) => sum + p.longitude, 0) /
        geoProperties.length;

      return [
        {
          key: "ALL",
          label: `Tüm Portföy (${geoProperties.length})`,
          count: geoProperties.length,
          latitude: globalLat,
          longitude: globalLng,
          zoom: computeZoomFromSpread(geoProperties, true),
          featuredProperty: geoProperties[0] || null,
        },
        ...derivedCities,
      ];
    }

    return derivedCities;
  }, [geoProperties]);

  const mapStyle = useMemo(() => {
    return resolvedTheme === "light"
      ? "mapbox://styles/mapbox/light-v11"
      : "mapbox://styles/mapbox/dark-v11";
  }, [resolvedTheme]);

  const [viewState, setViewState] = useState({
    latitude: 41.0772,
    longitude: 29.0436,
    zoom: 11.8,
  });

  // Initialize selection and map camera smoothly when live properties load
  useEffect(() => {
    if (geoProperties.length === 0) {
      setSelectedProperty(null);
      setActiveDestination("");
      return;
    }

    setSelectedProperty((prev) =>
      prev && geoProperties.some((p) => p.id === prev.id)
        ? prev
        : geoProperties[0]
    );

    if (!hasCenteredInitialView.current && destinations.length > 0) {
      hasCenteredInitialView.current = true;
      const initialDest = destinations[0];
      setActiveDestination(initialDest.key);
      setViewState({
        latitude: initialDest.latitude,
        longitude: initialDest.longitude,
        zoom: initialDest.zoom,
      });
    }
  }, [geoProperties, destinations]);

  const flyToDestination = (dest: DynamicDestination) => {
    setActiveDestination(dest.key);
    if (dest.featuredProperty) {
      setSelectedProperty(dest.featuredProperty);
    }

    setViewState({
      latitude: dest.latitude,
      longitude: dest.longitude,
      zoom: dest.zoom,
    });

    mapRef.current?.flyTo({
      center: [dest.longitude, dest.latitude],
      zoom: dest.zoom,
      speed: 1.25,
      curve: 1.4,
      duration: 1600,
      essential: true,
    });
  };

  const handleMarkerSelect = (prop: MapPropertyItem) => {
    setSelectedProperty(prop);
    const cityKey = `city:${(prop.city.trim() || "diğer bölge").toLowerCase()}`;
    if (destinations.some((d) => d.key === cityKey)) {
      setActiveDestination(cityKey);
    }
    mapRef.current?.flyTo({
      center: [prop.longitude, prop.latitude],
      zoom: Math.max(viewState.zoom, 13.2),
      duration: 900,
      essential: true,
    });
  };

  // Fallback list filtered to active destination when token is absent
  const visibleFallbackProperties = useMemo(() => {
    if (!activeDestination || activeDestination === "ALL") {
      return geoProperties;
    }
    const targetCity = activeDestination.replace(/^city:/, "");
    const filtered = geoProperties.filter(
      (p) => (p.city.trim() || "diğer bölge").toLowerCase() === targetCity
    );
    return filtered.length > 0 ? filtered : geoProperties;
  }, [geoProperties, activeDestination]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl border border-gold-500/30 bg-card/70 backdrop-blur-2xl shadow-luxury-glass ${className}`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Dynamic Location / City & District FlyTo Pills */}
        {destinations.length > 0 && (
          <div className="pointer-events-auto flex max-w-full items-center gap-1.5 overflow-x-auto rounded-full border border-gold-500/30 bg-obsidian-950/85 p-1.5 backdrop-blur-xl shadow-luxury-glass scrollbar-none">
            <div className="flex items-center gap-1.5 pl-2 pr-1 text-gold-400 shrink-0">
              <Compass className="h-4 w-4 animate-spin-slow" />
              <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">
                GEO Keşif:
              </span>
            </div>

            {destinations.map((dest) => (
              <button
                key={dest.key}
                type="button"
                onClick={() => flyToDestination(dest)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  activeDestination === dest.key
                    ? "bg-gold-500 text-obsidian-950 font-bold shadow-gold-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {dest.label}
              </button>
            ))}
          </div>
        )}

        {/* POI Toggle */}
        <div className="pointer-events-auto flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => setShowPoiFilter((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-xl transition-all shadow-luxury-glass ${
              showPoiFilter
                ? "border-gold-500/40 bg-gold-500/15 text-gold-400"
                : "border-border bg-obsidian-950/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-gold-400" />
            <span>VIP Çevre &amp; Ulaşım (POI)</span>
          </button>
        </div>
      </div>

      {/* Loading / Empty / Live Mapbox / No-Token Luxury Views */}
      {isLoading ? (
        <div className="flex h-[540px] w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-navy-950 via-obsidian-950 to-obsidian-900">
          <Loader2 className="h-7 w-7 animate-spin text-gold-400" />
          <p className="text-xs font-medium text-muted-foreground">
            Canlı GEO portföy koordinatları yükleniyor...
          </p>
        </div>
      ) : geoProperties.length === 0 ? (
        <div className="flex h-[500px] w-full flex-col items-center justify-center bg-gradient-to-b from-navy-950 via-obsidian-950 to-obsidian-900 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold-500/30 bg-gold-500/10 text-gold-400">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-serif text-xl font-bold text-foreground">
            Haritada Konumlandırılmış Aktif İlan Bulunamadı
          </h3>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
            Admin Portföy Yönetimi panelinden aktif bir ilana enlem (latitude)
            ve boylam (longitude) bilgisi eklendiğinde burada otomatik olarak
            pinlenecektir.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/properties"
              className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/15 px-4 py-2 text-xs font-semibold text-gold-400 hover:bg-gold-500/25 transition-colors"
            >
              <span>Portföy Koleksiyonuna Git</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : token ? (
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={mapStyle}
          mapboxAccessToken={token}
          style={{ width: "100%", height: "620px" }}
          attributionControl={false}
        >
          <NavigationControl position="bottom-right" showCompass showZoom />
          <FullscreenControl position="bottom-right" />

          {/* Live Prisma Active Geo-Located Markers */}
          {geoProperties.map((prop) => {
            const isSelected = selectedProperty?.id === prop.id;

            return (
              <Marker
                key={prop.id}
                latitude={prop.latitude}
                longitude={prop.longitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleMarkerSelect(prop);
                }}
              >
                <div className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-110">
                  <span
                    className={`absolute -bottom-1 h-3 w-3 rounded-full bg-gold-500/40 ${
                      isSelected ? "animate-ping" : ""
                    }`}
                  />

                  <div
                    className={`relative flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold shadow-gold-md backdrop-blur-md transition-all whitespace-nowrap ${
                      isSelected
                        ? "border-gold-300 bg-gold-500 text-obsidian-950 scale-105 ring-4 ring-gold-500/30"
                        : "border-gold-500/50 bg-obsidian-950/90 text-gold-400 hover:border-gold-400 hover:text-gold-300"
                    }`}
                  >
                    <Sparkles className="h-3 w-3 shrink-0" />
                    <span>{prop.price}</span>
                  </div>

                  <div className="h-2 w-0.5 bg-gold-500 shadow-sm" />
                </div>
              </Marker>
            );
          })}

          {/* Interactive Luxury Property Summary Popup */}
          {selectedProperty && (
            <Popup
              latitude={selectedProperty.latitude}
              longitude={selectedProperty.longitude}
              offset={[0, -38]}
              closeButton={true}
              closeOnClick={false}
              onClose={() => setSelectedProperty(null)}
              className="apple-luxury-popup"
              maxWidth="320px"
            >
              <div className="overflow-hidden rounded-2xl bg-card p-2 text-foreground shadow-luxury-glass border border-gold-500/30">
                <Link
                  href={`/properties/${selectedProperty.id}`}
                  className="block group"
                >
                  <div className="relative h-36 w-full overflow-hidden rounded-xl bg-obsidian-950">
                    <Image
                      src={selectedProperty.imageUrl}
                      alt={selectedProperty.title}
                      fill
                      unoptimized={
                        !isConfiguredImageHost(selectedProperty.imageUrl)
                      }
                      sizes="300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                    {selectedProperty.hasPanorama360 && (
                      <span className="absolute top-2 left-2 rounded-full border border-gold-500/40 bg-obsidian-950/80 px-2 py-0.5 text-[9px] font-semibold text-gold-400 backdrop-blur-xs">
                        360° VR
                      </span>
                    )}

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white">
                      <span className="font-serif text-base font-extrabold text-gold-400">
                        {selectedProperty.price}
                      </span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-obsidian-950 transition-transform group-hover:scale-110">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-2 pt-2.5">
                    <h4 className="font-serif text-sm font-bold text-foreground line-clamp-1 group-hover:text-gold-400 transition-colors">
                      {selectedProperty.title}
                    </h4>

                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3 text-gold-500 shrink-0" />
                      <span className="truncate">
                        {selectedProperty.district
                          ? `${selectedProperty.district}, ${selectedProperty.city}`
                          : selectedProperty.city}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BedDouble className="h-3 w-3 text-gold-400" />
                        {selectedProperty.bedrooms} Yatak
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-3 w-3 text-gold-400" />
                        {selectedProperty.bathrooms} Banyo
                      </span>
                      <span className="flex items-center gap-1">
                        <Maximize2 className="h-3 w-3 text-gold-400" />
                        {selectedProperty.squareMeters} m²
                      </span>
                    </div>

                    {showPoiFilter &&
                      selectedProperty.poiNearby &&
                      selectedProperty.poiNearby.length > 0 && (
                        <div className="mt-2 border-t border-border/40 pt-1.5 flex flex-wrap gap-1">
                          {selectedProperty.poiNearby.map((poi, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded bg-gold-500/10 px-1.5 py-0.5 text-[9px] font-medium text-gold-400"
                            >
                              {poi.type === "marina" ? (
                                <Anchor className="h-2.5 w-2.5" />
                              ) : poi.type === "airport" ? (
                                <Plane className="h-2.5 w-2.5" />
                              ) : (
                                <GraduationCap className="h-2.5 w-2.5" />
                              )}
                              {poi.label}
                            </span>
                          ))}
                        </div>
                      )}

                    <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-gold-400">
                      <span>İlan Detayını Gör</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              </div>
            </Popup>
          )}
        </Map>
      ) : (
        /* Live Prisma Canvas Fallback when NEXT_PUBLIC_MAPBOX_TOKEN is not set */
        <div className="relative min-h-[580px] w-full flex flex-col items-center justify-center bg-gradient-to-b from-navy-950 via-obsidian-950 to-obsidian-900 p-6 pt-20 text-center overflow-hidden">
          <div className="pointer-events-none absolute h-[580px] w-[580px] rounded-full border border-gold-500/10 animate-ping opacity-20" />
          <div className="pointer-events-none absolute h-[380px] w-[380px] rounded-full border border-gold-500/15" />

          <div className="relative z-10 w-full max-w-5xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-400">
              <Compass className="h-3.5 w-3.5 animate-spin-slow" />
              <span>Canlı Prisma GEO Koordinat Verisi Bağlı</span>
            </div>

            <h3 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Aktif Konumlu Portföy ({visibleFallbackProperties.length} İlan)
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-slate-300">
              Seçili bölge koordinatı:{" "}
              <span className="font-mono text-gold-400">
                {viewState.latitude.toFixed(4)}, {viewState.longitude.toFixed(4)}
              </span>{" "}
              (Zoom {viewState.zoom.toFixed(1)}). İnteraktif uydu haritası için{" "}
              <code className="text-gold-400 font-mono">
                NEXT_PUBLIC_MAPBOX_TOKEN
              </code>{" "}
              değişkenini ekleyin.
            </p>

            {/* Real Database Property Pins Summary Cards */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-left">
              {visibleFallbackProperties.slice(0, 6).map((prop) => {
                const isSelected = selectedProperty?.id === prop.id;
                return (
                  <div
                    key={prop.id}
                    onClick={() => handleMarkerSelect(prop)}
                    className={`rounded-2xl border p-4 transition-all cursor-pointer backdrop-blur-xl ${
                      isSelected
                        ? "border-gold-500 bg-gold-500/15 shadow-gold-sm"
                        : "border-white/10 bg-obsidian-950/75 hover:border-gold-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-gold-400">
                        {prop.price}
                      </span>
                      <span className="text-[10px] text-slate-300 truncate">
                        {prop.district
                          ? `${prop.district}, ${prop.city}`
                          : prop.city}
                      </span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-white mt-1.5 line-clamp-1">
                      {prop.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      GPS: {prop.latitude.toFixed(4)}, {prop.longitude.toFixed(4)}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[11px] text-slate-300">
                      <span>
                        {prop.bedrooms} Yatak • {prop.squareMeters} m²
                      </span>
                      <Link
                        href={`/properties/${prop.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 font-semibold text-gold-400 hover:text-gold-300"
                      >
                        <span>Detay</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
