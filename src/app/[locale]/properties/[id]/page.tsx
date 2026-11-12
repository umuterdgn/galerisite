import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import prisma from "@/lib/prisma";
import { MediaType, PropertyStatus } from "@prisma/client";
import { getFallbackPropertyById } from "@/lib/actions/property";
import {
  loadPropertyVirtualTour,
  type SavedTourRoomPayload,
} from "@/lib/actions/tour";
import type {
  VirtualTourHotspot,
  VirtualTourRoom,
} from "@/components/public/VirtualTour";
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Calendar,
  Compass,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RoiCalculator } from "@/components/ui/RoiCalculator";
import { MediaGallery } from "@/components/public/MediaGallery";
import { VirtualStagingSlider } from "@/components/public/VirtualStagingSlider";
import { AppointmentModal } from "@/components/public/AppointmentModal";
import { TourBookingWidget } from "@/components/public/TourBookingWidget";

// Lüks Gayrimenkul Veri Havuzu
interface DetailMediaItem {
  id: string;
  url: string;
  type: string;
  roomLabel?: string | null;
  isStaged?: boolean;
}

interface DetailProperty {
  id: string;
  title: string;
  price: string;
  rawPrice: number;
  currency: string;
  location: string;
  city: string;
  district: string;
  country: string;
  description: string;
  specs: { beds: number; baths: number; area: number; year: number };
  images: string[];
  hasPanorama360: boolean;
  amenities: string[];
  beforeStagingImage?: string;
  afterStagingImage?: string;
  media?: DetailMediaItem[];
  virtualTourRooms?: VirtualTourRoom[];
  seoTitle?: string | null;
  seoDesc?: string | null;
  agencyName?: string;
  availability?: string;
}

const DEFAULT_FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85";

const CONFIGURED_IMAGE_HOSTS = new Set([
  "res.cloudinary.com",
  "images.unsplash.com",
]);

function isConfiguredImageHost(src: string): boolean {
  try {
    const parsed = new URL(src);
    return parsed.protocol === "https:" && CONFIGURED_IMAGE_HOSTS.has(parsed.hostname);
  } catch {
    return src.startsWith("/");
  }
}

function formatDetailPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency || "EUR"} ${amount.toLocaleString("tr-TR")}`;
  }
}

function buildVirtualTourRooms(
  savedRooms: SavedTourRoomPayload[],
  mediaItems: DetailMediaItem[]
): VirtualTourRoom[] {
  const panoramaMedia = mediaItems.filter(
    (m) => m.type === MediaType.PANORAMA_360 && Boolean(m.url)
  );
  if (panoramaMedia.length === 0) {
    return [];
  }

  const allowedPanoramaUrls = new Set(panoramaMedia.map((m) => m.url));
  const validSaved = savedRooms.filter(
    (r) => Boolean(r.panoramaUrl) && allowedPanoramaUrls.has(r.panoramaUrl)
  );
  const validRoomIds = new Set(validSaved.map((r) => r.id));

  const mapped: VirtualTourRoom[] = validSaved.map((room) => ({
    id: room.id,
    name: room.roomLabel || room.customTitle || "360° Oda",
    caption: room.customTitle || room.roomLabel || "360° İnteraktif VR Turu",
    panorama: room.panoramaUrl,
    thumbnail: room.panoramaUrl,
    links: (room.links || [])
      .filter((lnk) => lnk.targetRoomId && validRoomIds.has(lnk.targetRoomId))
      .map((lnk) => ({
        nodeId: lnk.targetRoomId,
        yaw: lnk.yaw,
        pitch: lnk.pitch,
        name: lnk.label,
      })),
    hotspots: (room.hotspots || []).map(
      (hs): VirtualTourHotspot => ({
        id: hs.id,
        yaw: hs.yaw,
        pitch: hs.pitch,
        category: hs.category || "Özellik",
        title: hs.title,
        description: hs.description,
        spec: hs.spec,
        iconType: "general",
      })
    ),
  }));

  const existingUrls = new Set(mapped.map((r) => r.panorama));

  panoramaMedia.forEach((m, index) => {
    if (!existingUrls.has(m.url)) {
      mapped.push({
        id: `media-360-${m.id}`,
        name: m.roomLabel || `360° Panorama ${mapped.length + index + 1}`,
        caption: m.roomLabel || "360° VR Sanal Tur Odası",
        panorama: m.url,
        thumbnail: m.url,
        links: [],
        hotspots: [],
      });
    }
  });

  return mapped;
}

const mockProperties: Record<string, DetailProperty> = {
  "prop-1": {
    id: "prop-1",
    title: "The Bosphorus Waterfront Palace",
    price: "€ 42.500.000",
    rawPrice: 42500000,
    currency: "EUR",
    location: "Yeniköy, Sarıyer / Istanbul, Türkiye",
    city: "Istanbul",
    district: "Yeniköy",
    country: "TR",
    description:
      "Tarihi Yeniköy sahil hattında tescilli, 1.450 m² kapalı kullanım alanlı, helikopter pisti ve özel yat iskelesi bulunan ultra-lüks Boğaz yalısı. Osmanlı mimarisinin zarafetini akıllı ev otomasyonu ile buluşturan eşsiz bir gayrimenkul şaheseri.",
    specs: { beds: 8, baths: 9, area: 1450, year: 2021 },
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
    ],
    hasPanorama360: true,
    amenities: [
      "Özel Yat İskelesi (Deep-water Dock)",
      "Helikopter İniş Alanı",
      "Sonsuzluk Boğaz Havuzu",
      "Klimatize Şarap Mahzeni",
      "Özel Türk Hamamı & Spa",
      "24/7 Güvenlik & Biyometrik Giriş",
    ],
    beforeStagingImage:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85",
    afterStagingImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
  },
  "prop-2": {
    id: "prop-2",
    title: "Villa Belle Époque",
    price: "€ 38.000.000",
    rawPrice: 38000000,
    currency: "EUR",
    location: "Cap d'Antibes, French Riviera, Fransa",
    city: "Antibes",
    district: "Cap d'Antibes",
    country: "FR",
    description:
      "Fransız Rivierası'nın kalbi Cap d'Antibes yarımadasında Akdeniz'e hakim kayalıklar üzerine inşa edilmiş neo-klasik sahil villası. 980 m² kapalı alan, asırlık zeytin ağaçlarıyla çevrili 4.500 m² özel bahçe.",
    specs: { beds: 7, baths: 8, area: 980, year: 2019 },
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
    ],
    hasPanorama360: true,
    amenities: [
      "Özel Deniz Koyu & Güverte",
      "Isıtmalı Sonsuzluk Havuzu",
      "Panoramik Akdeniz Terası",
      "Özel Şef Mutfağı (Gaggenau)",
      "Kapalı Spor Salonu & Sauna",
    ],
  },
  "prop-3": {
    id: "prop-3",
    title: "Sky Penthouse at Palm Jumeirah",
    price: "$ 27.900.000",
    rawPrice: 27900000,
    currency: "USD",
    location: "Palm Jumeirah, Dubai, BAE",
    city: "Dubai",
    district: "Palm Jumeirah",
    country: "AE",
    description:
      "Dubai Palm Jumeirah'da yer alan bu tripleks penthouse, 820 m² kapalı alan ve 350 m² özel çatı terası ile lüksün sınırlarını zorluyor. Özel asansör ve Burj Al Arab manzarası.",
    specs: { beds: 5, baths: 6, area: 820, year: 2023 },
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85",
    ],
    hasPanorama360: true,
    amenities: [
      "Özel Çatı Sonsuzluk Havuzu",
      "Doğrudan Daireye Çıkan Özel Asansör",
      "360 Derece Marina & Körfez Manzarası",
      "Özel Konsiyerj Hizmeti (24/7)",
    ],
  },
};

async function resolvePropertyDetail(id: string): Promise<DetailProperty> {
  try {
    const dbProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        media: {
          where: { type: MediaType.PANORAMA_360 },
          orderBy: { sortOrder: "asc" },
        },
        agency: true,
      },
    });

    if (dbProperty) {
      const otherMediaRows = await prisma.media.findMany({
        where: {
          propertyId: id,
          type: { not: MediaType.PANORAMA_360 },
        },
        orderBy: { sortOrder: "asc" },
      });

      const panoramaMedia: DetailMediaItem[] = dbProperty.media.map((m) => ({
        id: m.id,
        url: m.url,
        type: m.type,
        roomLabel: m.roomLabel,
        isStaged: m.isStaged,
      }));

      const otherMedia: DetailMediaItem[] = otherMediaRows.map((m) => ({
        id: m.id,
        url: m.url,
        type: m.type,
        roomLabel: m.roomLabel,
        isStaged: m.isStaged,
      }));

      const dbMedia: DetailMediaItem[] = [...panoramaMedia, ...otherMedia];

      let savedRooms: SavedTourRoomPayload[] = [];
      if (
        dbProperty.schemaJson &&
        typeof dbProperty.schemaJson === "object" &&
        !Array.isArray(dbProperty.schemaJson)
      ) {
        const schemaObj = dbProperty.schemaJson as Record<string, unknown>;
        const vt = schemaObj.virtualTour as
          | { rooms?: SavedTourRoomPayload[] }
          | undefined;
        if (vt?.rooms && Array.isArray(vt.rooms)) {
          savedRooms = vt.rooms;
        }
      }

      if (savedRooms.length === 0) {
        const loadedTour = await loadPropertyVirtualTour(id);
        if (loadedTour.rooms) {
          savedRooms = loadedTour.rooms;
        }
      }

      const virtualTourRooms = buildVirtualTourRooms(savedRooms, dbMedia);
      const imageMedia = dbMedia.filter((m) => m.type === MediaType.IMAGE);
      const images =
        imageMedia.length > 0
          ? imageMedia.map((m) => m.url)
          : [DEFAULT_FALLBACK_PHOTO];

      const rawPrice = Number(dbProperty.price);
      const beds = dbProperty.bedrooms ?? 4;
      const baths = dbProperty.bathrooms ?? 3;
      const area = Math.round(dbProperty.squareMeters ?? 350);
      const district = dbProperty.district || dbProperty.city;
      const hasPanorama360 =
        virtualTourRooms.length > 0 ||
        dbMedia.some((m) => m.type === MediaType.PANORAMA_360);

      const stagedAfter = imageMedia.find((m) => m.isStaged)?.url;
      const stagedBefore = imageMedia.find((m) => !m.isStaged)?.url;

      return {
        id: dbProperty.id,
        title: dbProperty.title,
        price: formatDetailPrice(rawPrice, dbProperty.currency),
        rawPrice,
        currency: dbProperty.currency || "EUR",
        location: [dbProperty.district, dbProperty.city, dbProperty.address]
          .filter(Boolean)
          .join(" / "),
        city: dbProperty.city,
        district,
        country: "TR",
        description: dbProperty.description,
        specs: {
          beds,
          baths,
          area,
          year: dbProperty.createdAt.getFullYear(),
        },
        images,
        hasPanorama360,
        amenities: [
          dbProperty.isFurnished
            ? "Anahtar Teslim Tam Mobilyalı Konsept"
            : "Özel Mimari Tasarım Potansiyeli",
          `${beds} Suit Yatak Odası & ${baths} Lüks Banyo`,
          `${area} m² Kapalı Kullanım Alanı`,
          hasPanorama360
            ? "360° İnteraktif VR Sanal Tur Destekli"
            : "VIP Özel Yerinde & Online Tur Seçeneği",
          "7/24 Özel Güvenlik & Akıllı Ev Otomasyonu",
          `${dbProperty.agency?.name || "Lumière Prime Estates"} Özel Temsilciliği`,
        ],
        beforeStagingImage: stagedBefore,
        afterStagingImage: stagedAfter,
        media: dbMedia,
        virtualTourRooms,
        seoTitle: dbProperty.seoTitle,
        seoDesc: dbProperty.seoDesc,
        agencyName: dbProperty.agency?.name || "Lumière Prime Estates",
        availability:
          dbProperty.status === PropertyStatus.SOLD ||
          dbProperty.status === PropertyStatus.RENTED
            ? "https://schema.org/SoldOut"
            : "https://schema.org/InStock",
      };
    }
  } catch (err) {
    console.warn("Property detail Prisma fallback:", err);
  }

  const fallbackProp = await getFallbackPropertyById(id);
  const loadedTour = await loadPropertyVirtualTour(id);
  const virtualTourRooms = buildVirtualTourRooms(loadedTour.rooms || [], []);

  if (fallbackProp) {
    return {
      id: fallbackProp.id,
      title: fallbackProp.title,
      price: formatDetailPrice(fallbackProp.price, fallbackProp.currency),
      rawPrice: fallbackProp.price,
      currency: fallbackProp.currency,
      location: [fallbackProp.district, fallbackProp.city, fallbackProp.address]
        .filter(Boolean)
        .join(" / "),
      city: fallbackProp.city,
      district: fallbackProp.district || fallbackProp.city,
      country: "TR",
      description: fallbackProp.description,
      specs: {
        beds: fallbackProp.bedrooms,
        baths: fallbackProp.bathrooms,
        area: fallbackProp.squareMeters,
        year: new Date().getFullYear(),
      },
      images: [fallbackProp.imageUrl || DEFAULT_FALLBACK_PHOTO],
      hasPanorama360:
        fallbackProp.hasPanorama360 || virtualTourRooms.length > 0,
      amenities: [
        fallbackProp.isFurnished
          ? "Anahtar Teslim Tam Mobilyalı Konsept"
          : "Özel Mimari Tasarım Potansiyeli",
        `${fallbackProp.bedrooms} Suit Yatak Odası & ${fallbackProp.bathrooms} Lüks Banyo`,
        `${fallbackProp.squareMeters} m² Kapalı Kullanım Alanı`,
        "VIP Özel Gösterim & Online Randevu",
      ],
      virtualTourRooms,
      agencyName: "Lumière Prime Estates",
      availability:
        fallbackProp.status === PropertyStatus.SOLD ||
        fallbackProp.status === PropertyStatus.RENTED
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
    };
  }

  const mock = mockProperties[id] || mockProperties["prop-1"];
  return {
    ...mock,
    virtualTourRooms,
    hasPanorama360: mock.hasPanorama360 || virtualTourRooms.length > 0,
    agencyName: "Lumière Prime Estates",
    availability: "https://schema.org/InStock",
  };
}

export async function generateMetadata({
  params,
}: {
  params: { id: string; locale: string };
}): Promise<Metadata> {
  const property = await resolvePropertyDetail(params.id);
  const seoTitle =
    property.seoTitle ||
    `${property.city} ${property.district}'de Satılık Ultra Lüks ${property.specs.beds}+1 ${property.title}`;
  const seoDesc =
    property.seoDesc ||
    `${property.location} konumunda ${property.specs.area} m² kullanım alanlı ${property.specs.beds}+1 lüks mülk. ${property.price}. Detaylı bilgi ve VIP gösterim için randevu oluşturun.`;

  return {
    title: seoTitle,
    description: seoDesc,
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      images: property.images.slice(0, 1),
      type: "website",
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const property = await resolvePropertyDetail(params.id);

  // Schema.org RealEstateListing JSON-LD Microdata for Google Rich Snippets & AI (GEO)
  const schemaLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://lumiere.luxury"}/${params.locale}/properties/${property.id}`,
    image: property.images,
    category: "Luxury Residential Real Estate",
    offers: {
      "@type": "Offer",
      price: property.rawPrice,
      priceCurrency: property.currency,
      availability: property.availability || "https://schema.org/InStock",
      priceValidUntil: "2027-12-31",
      seller: {
        "@type": "RealEstateAgent",
        name: property.agencyName || "Lumière Prime Estates",
        telephone: "+90 (212) 800 40 50",
        priceRange: "€€€€",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.96",
          reviewCount: "54",
        },
      },
    },
    about: {
      "@type": "SingleFamilyResidence",
      name: property.title,
      numberOfRooms: property.specs.beds + 1,
      numberOfBedrooms: property.specs.beds,
      numberOfBathroomsTotal: property.specs.baths,
      floorSize: {
        "@type": "QuantitativeValue",
        value: property.specs.area,
        unitCode: "MTK",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: property.city,
        addressRegion: property.district,
        addressCountry: property.country,
      },
      amenityFeature: property.amenities.map((amenity) => ({
        "@type": "LocationFeatureSpecification",
        name: amenity,
        value: true,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-gold-400 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Vitrini Keşfetmeye Dön</span>
        </Link>

        {/* Top Header & VIP Booking Action */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-border pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="gold">Ayrıcalıklı Portföy</Badge>
              {property.hasPanorama360 && (
                <Badge variant="navy" className="flex items-center gap-1">
                  <Compass className="h-3 w-3 text-gold-400 animate-spin-slow" />
                  <span>360° VR Sanal Tur</span>
                </Badge>
              )}
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {property.title}
            </h1>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2.5">
              <MapPin className="h-4 w-4 text-gold-500" />
              <span>{property.location}</span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Rezerve Fiyat
              </span>
              <p className="font-serif text-3xl sm:text-4xl font-extrabold text-gold-500">
                {property.price}
              </p>
            </div>

            {/* VIP Showing Modal Trigger */}
            <AppointmentModal
              propertyId={property.id}
              propertyTitle={property.title}
            />
          </div>
        </div>

        {/* Gallery Visuals */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            className={`relative aspect-[16/10] overflow-hidden rounded-2xl border border-border ${
              property.images.length > 1 ? "md:col-span-2" : "md:col-span-3"
            }`}
          >
            <Image
              src={property.images[0]}
              alt={property.title}
              fill
              priority
              unoptimized={!isConfiguredImageHost(property.images[0])}
              className="object-cover"
            />
          </div>
          {property.images.length > 1 && (
            <div className="grid grid-cols-1 gap-4">
              {property.images.slice(1, 3).map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border"
                >
                  <Image
                    src={img}
                    alt={`${property.title} - ${i + 2}`}
                    fill
                    unoptimized={!isConfiguredImageHost(img)}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specifications Ribbon */}
        <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xl sm:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <BedDouble className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">
                Yatak Odası
              </p>
              <p className="font-serif text-base font-bold text-foreground">
                {property.specs.beds} Suit
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <Bath className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">
                Banyo
              </p>
              <p className="font-serif text-base font-bold text-foreground">
                {property.specs.baths} Lüks Banyo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <Maximize2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">
                Kapalı Alan
              </p>
              <p className="font-serif text-base font-bold text-foreground">
                {property.specs.area} m²
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-400 border border-gold-500/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase">
                Yapım Yılı
              </p>
              <p className="font-serif text-base font-bold text-foreground">
                {property.specs.year}
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Luxury Multi-Media Gallery (360 Tour, Drone, Video, 3D BIM) */}
        <MediaGallery
          propertyTitle={property.title}
          media={property.media}
          virtualTourRooms={
            property.virtualTourRooms && property.virtualTourRooms.length > 0
              ? property.virtualTourRooms
              : undefined
          }
          className="mt-12"
        />

        {/* AI Virtual Staging Comparison Slider */}
        <div className="mt-14 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold tracking-widest text-gold-500 uppercase">
                Yapay Zekâ ile Mimari Yenileme
              </span>
              <h3 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                <span>AI Virtual Staging Öncesi & Sonrası</span>
                <Sparkles className="h-5 w-5 text-purple-400" />
              </h3>
            </div>
            <Badge variant="staged">AI Staging</Badge>
          </div>

          <VirtualStagingSlider
            beforeImage={property.beforeStagingImage}
            afterImage={property.afterStagingImage}
            roomName="Ana Salon & Şömine Hattı"
            propertyId={property.id}
          />
        </div>

        {/* Content & Inquiry Form */}
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Mülk Hakkında
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {property.description}
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-4">
                Ayrıcalıklı Donanım & Olanaklar
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {property.amenities.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-card/40 p-3 text-xs font-medium text-foreground"
                  >
                    <Sparkles className="h-4 w-4 text-gold-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Akıllı Takvim & Ev Turu Randevu Widget'ı */}
          <div>
            <TourBookingWidget
              propertyId={property.id}
              propertyTitle={property.title}
              propertyPrice={property.price}
            />
          </div>
        </div>

        {/* Dynamic ROI & Investment Simulation Section */}
        <div className="mt-14 border-t border-border/80 pt-12">
          <RoiCalculator
            initialPrice={property.rawPrice}
            initialRent={Math.round(property.rawPrice * 0.0035)}
            currency={property.currency}
          />
        </div>
      </div>
    </div>
  );
}
