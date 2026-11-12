"use client";

import React, { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTheme } from "next-themes";
import Map, { Marker, Popup, NavigationControl, FullscreenControl, MapRef } from "react-map-gl/mapbox";
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
} from "lucide-react";

export interface MapPropertyItem {
  id: string;
  title: string;
  price: string;
  rawPrice: number;
  currency: string;
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

const DEFAULT_MAP_PROPERTIES: MapPropertyItem[] = [
  {
    id: "prop-1",
    title: "The Bosphorus Waterfront Palace",
    price: "€ 42.500.000",
    rawPrice: 42500000,
    currency: "EUR",
    city: "Istanbul",
    district: "Yeniköy",
    latitude: 41.1218,
    longitude: 29.0712,
    bedrooms: 8,
    bathrooms: 9,
    squareMeters: 1450,
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80",
    hasPanorama360: true,
    poiNearby: [
      { type: "marina", label: "İstinye Marina (5 dk)" },
      { type: "airport", label: "Helipad Sahası (Özel)" },
    ],
  },
  {
    id: "prop-2",
    title: "Villa Belle Époque",
    price: "€ 38.000.000",
    rawPrice: 38000000,
    currency: "EUR",
    city: "Antibes",
    district: "Cap d'Antibes",
    latitude: 43.5528,
    longitude: 7.1265,
    bedrooms: 7,
    bathrooms: 8,
    squareMeters: 980,
    imageUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80",
    hasPanorama360: true,
    poiNearby: [
      { type: "marina", label: "Port Vauban Marina" },
      { type: "airport", label: "Nice Côte d'Azur (20 dk)" },
    ],
  },
  {
    id: "prop-3",
    title: "Sky Penthouse Palm Jumeirah",
    price: "$ 27.900.000",
    rawPrice: 27900000,
    currency: "USD",
    city: "Dubai",
    district: "The Palm",
    latitude: 25.1124,
    longitude: 55.139,
    bedrooms: 5,
    bathrooms: 6,
    squareMeters: 820,
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    hasPanorama360: true,
    poiNearby: [
      { type: "marina", label: "Dubai Marina Yacht Club" },
      { type: "airport", label: "DXB VIP Terminal" },
    ],
  },
  {
    id: "prop-4",
    title: "Yalıkavak Cliffside Private Estate",
    price: "€ 18.500.000",
    rawPrice: 18500000,
    currency: "EUR",
    city: "Bodrum",
    district: "Yalıkavak",
    latitude: 37.1032,
    longitude: 27.2917,
    bedrooms: 6,
    bathrooms: 7,
    squareMeters: 860,
    imageUrl:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80",
    hasPanorama360: false,
    poiNearby: [
      { type: "marina", label: "Yalıkavak Marina (4 dk)" },
      { type: "airport", label: "Milas-Bodrum Havalimanı" },
    ],
  },
  {
    id: "prop-5",
    title: "The Grosvenor Townhouse",
    price: "£ 32.000.000",
    rawPrice: 32000000,
    currency: "GBP",
    city: "London",
    district: "Mayfair",
    latitude: 51.5115,
    longitude: -0.1528,
    bedrooms: 6,
    bathrooms: 7,
    squareMeters: 750,
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    hasPanorama360: true,
    poiNearby: [
      { type: "school", label: "Eton College & Regent's" },
      { type: "airport", label: "RAF Northolt VIP FBO" },
    ],
  },
  {
    id: "prop-8",
    title: "Bebek Waterfront Historical Mansion",
    price: "€ 52.000.000",
    rawPrice: 52000000,
    currency: "EUR",
    city: "Istanbul",
    district: "Bebek",
    latitude: 41.0772,
    longitude: 29.0436,
    bedrooms: 9,
    bathrooms: 10,
    squareMeters: 1680,
    imageUrl:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80",
    hasPanorama360: true,
    poiNearby: [
      { type: "marina", label: "Bebek İskelesi & Yat Palamarı" },
      { type: "school", label: "Boğaziçi Kampüsü" },
    ],
  },
];

const DESTINATIONS = [
  { name: "İstanbul Boğazı", center: { latitude: 41.1005, longitude: 29.055, zoom: 12.5 } },
  { name: "Bodrum Yalıkavak", center: { latitude: 37.1032, longitude: 27.2917, zoom: 12.8 } },
  { name: "Cap d'Antibes", center: { latitude: 43.5528, longitude: 7.1265, zoom: 13.2 } },
  { name: "Dubai Palm", center: { latitude: 25.1124, longitude: 55.139, zoom: 12.8 } },
  { name: "London Mayfair", center: { latitude: 51.5115, longitude: -0.1528, zoom: 13.8 } },
];

export interface MapExploreProps {
  properties?: MapPropertyItem[];
  className?: string;
}

export function MapExplore({
  properties = DEFAULT_MAP_PROPERTIES,
  className = "",
}: MapExploreProps) {
  const { resolvedTheme } = useTheme();
  const mapRef = useRef<MapRef>(null);

  const [selectedProperty, setSelectedProperty] = useState<MapPropertyItem | null>(
    properties[0] || null
  );
  const [activeDestination, setActiveDestination] = useState<string>("İstanbul Boğazı");
  const [showPoiFilter, setShowPoiFilter] = useState<boolean>(true);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Apple-like Clean Mapbox Styles
  const mapStyle = useMemo(() => {
    return resolvedTheme === "light"
      ? "mapbox://styles/mapbox/light-v11"
      : "mapbox://styles/mapbox/dark-v11";
  }, [resolvedTheme]);

  const [viewState, setViewState] = useState({
    latitude: 41.1005,
    longitude: 29.055,
    zoom: 12.2,
  });

  const flyToDestination = (dest: (typeof DESTINATIONS)[number]) => {
    setActiveDestination(dest.name);
    mapRef.current?.flyTo({
      center: [dest.center.longitude, dest.center.latitude],
      zoom: dest.center.zoom,
      duration: 1600,
      essential: true,
    });
  };

  return (
    <div
      className={`relative w-full overflow-hidden rounded-3xl border border-gold-500/30 bg-card/70 backdrop-blur-2xl shadow-luxury-glass ${className}`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Destination Pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto rounded-full border border-gold-500/30 bg-obsidian-950/85 p-1.5 backdrop-blur-xl shadow-luxury-glass scrollbar-none">
          <div className="flex items-center gap-1.5 pl-2 pr-1 text-gold-400">
            <Compass className="h-4 w-4 animate-spin-slow" />
            <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">
              GEO Keşif:
            </span>
          </div>

          {DESTINATIONS.map((dest) => (
            <button
              key={dest.name}
              onClick={() => flyToDestination(dest)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                activeDestination === dest.name
                  ? "bg-gold-500 text-obsidian-950 font-bold shadow-gold-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {dest.name}
            </button>
          ))}
        </div>

        {/* POI Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowPoiFilter(!showPoiFilter)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-xl transition-all shadow-luxury-glass ${
              showPoiFilter
                ? "border-gold-500/40 bg-gold-500/15 text-gold-400"
                : "border-border bg-obsidian-950/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-gold-400" />
            <span>VIP Çevre & Ulaşım (POI)</span>
          </button>
        </div>
      </div>

      {/* Mapbox Map Container */}
      {token ? (
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

          {/* Luxury Gold Custom Markers */}
          {properties.map((prop) => {
            const isSelected = selectedProperty?.id === prop.id;

            return (
              <Marker
                key={prop.id}
                latitude={prop.latitude}
                longitude={prop.longitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedProperty(prop);
                }}
              >
                <div className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-110">
                  {/* Subtle pulsing beacon */}
                  <span
                    className={`absolute -bottom-1 h-3 w-3 rounded-full bg-gold-500/40 ${
                      isSelected ? "animate-ping" : ""
                    }`}
                  />

                  {/* Gold Pill Badge */}
                  <div
                    className={`relative flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold shadow-gold-md backdrop-blur-md transition-all ${
                      isSelected
                        ? "border-gold-300 bg-gold-500 text-obsidian-950 scale-105 ring-4 ring-gold-500/30"
                        : "border-gold-500/50 bg-obsidian-950/90 text-gold-400 hover:border-gold-400 hover:text-gold-300"
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{prop.price.split(" ")[1] || prop.price}</span>
                  </div>

                  {/* Marker Stem */}
                  <div className="h-2 w-0.5 bg-gold-500 shadow-sm" />
                </div>
              </Marker>
            );
          })}

          {/* Minimal Luxury Popup Above Pin */}
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
                      sizes="300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {selectedProperty.hasPanorama360 && (
                      <span className="absolute top-2 left-2 rounded-full border border-gold-500/40 bg-obsidian-950/80 px-2 py-0.5 text-[9px] font-semibold text-gold-400 backdrop-blur-xs">
                        360° VR
                      </span>
                    )}

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white">
                      <span className="font-serif text-base font-extrabold text-gold-400">
                        {selectedProperty.price}
                      </span>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-obsidian-950">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-2 pt-2.5">
                    <h4 className="font-serif text-sm font-bold text-foreground line-clamp-1 group-hover:text-gold-400 transition-colors">
                      {selectedProperty.title}
                    </h4>

                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3 text-gold-500" />
                      <span>
                        {selectedProperty.district}, {selectedProperty.city}
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

                    {/* Nearby POI */}
                    {showPoiFilter && selectedProperty.poiNearby && (
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
                  </div>
                </Link>
              </div>
            </Popup>
          )}
        </Map>
      ) : (
        /* Token Fallback / Interactive Luxury Canvas Simulation */
        <div className="relative h-[620px] w-full flex flex-col items-center justify-center bg-gradient-to-b from-navy-950 via-obsidian-950 to-obsidian-900 p-6 text-center select-none overflow-hidden">
          {/* Animated radar rings simulating luxury location grid */}
          <div className="pointer-events-none absolute h-[600px] w-[600px] rounded-full border border-gold-500/10 animate-ping opacity-25" />
          <div className="pointer-events-none absolute h-[400px] w-[400px] rounded-full border border-gold-500/15" />
          <div className="pointer-events-none absolute h-[200px] w-[200px] rounded-full border border-gold-500/20" />

          {/* Simulated Floating Markers */}
          <div className="relative z-10 w-full max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-xs font-semibold text-gold-400">
              <Compass className="h-3.5 w-3.5 animate-spin-slow" />
              <span>Mapbox Vektör Harita Modülü Hazır</span>
            </div>

            <h3 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Lüks GEO Destinasyon Keşfi
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-muted-foreground">
              Harita üzerinde {properties.length} seçkin portföy koordinatları (Boğaz, Bodrum, Cap d&apos;Antibes, Dubai) işaretlenmiştir. Canlı uydu katmanı için `.env` dosyanıza <code className="text-gold-400 font-mono">NEXT_PUBLIC_MAPBOX_TOKEN</code> anahtarınızı ekleyebilirsiniz.
            </p>

            {/* Quick interactive cards below simulated map */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {properties.slice(0, 3).map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => setSelectedProperty(prop)}
                  className={`rounded-2xl border p-4 text-left transition-all cursor-pointer backdrop-blur-xl ${
                    selectedProperty?.id === prop.id
                      ? "border-gold-500 bg-gold-500/15 shadow-gold-sm"
                      : "border-border bg-card/60 hover:border-gold-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gold-400">{prop.price}</span>
                    <span className="text-[10px] text-muted-foreground">{prop.city}</span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-foreground mt-1 truncate">
                    {prop.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {prop.district} • {prop.bedrooms} Yatak • {prop.squareMeters} m²
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
