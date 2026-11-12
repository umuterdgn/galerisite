"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateSemanticParagraph } from "@/lib/semantic";
import { MediaType, PropertyStatus, Role } from "@prisma/client";
import type { PropertyCardItem } from "@/components/public/PropertyCard";

function revalidatePublicShowcase(propertyId?: string) {
  revalidateTag("properties");
  revalidatePath("/", "layout");
  revalidatePath("/tr");
  revalidatePath("/en");
  revalidatePath("/properties");
  revalidatePath("/tr/properties");
  revalidatePath("/en/properties");
  revalidatePath("/features/geo-explore");
  revalidatePath("/tr/features/geo-explore");
  revalidatePath("/en/features/geo-explore");
  revalidatePath("/admin/dashboard/portfolio");
  revalidatePath("/admin/dashboard");
  if (propertyId) {
    revalidatePath(`/properties/${propertyId}`);
    revalidatePath(`/tr/properties/${propertyId}`);
    revalidatePath(`/en/properties/${propertyId}`);
  }
}

export interface AdminPropertyItem {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  isFurnished: boolean;
  city: string;
  district: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  imageUrl: string;
  hasPanorama360: boolean;
  isStaged: boolean;
  agencyId: string;
  agentId?: string | null;
  agentName?: string;
  createdAt: string;
  source?: "prisma" | "memory";
}

export interface UpsertPropertyInput {
  title: string;
  description: string;
  price: number;
  currency: string;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  isFurnished: boolean;
  city: string;
  district: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  imageUrl: string;
}

// Local Fallback Portfolio Store (DB bağlantısı yoksa veya tablo boşsa kesintisiz CRUD deneyimi sağlar)
let FALLBACK_PROPERTIES: AdminPropertyItem[] = [
  {
    id: "prop-1",
    title: "The Bosphorus Waterfront Palace",
    description:
      "Tarihi Yeniköy sahil hattında tescilli, 1.450 m² kapalı kullanım alanlı, helikopter pisti ve özel yat iskelesi bulunan ultra-lüks Boğaz yalısı.",
    price: 42500000,
    currency: "EUR",
    status: PropertyStatus.FOR_SALE,
    bedrooms: 8,
    bathrooms: 9,
    squareMeters: 1450,
    isFurnished: true,
    city: "Istanbul",
    district: "Yeniköy / Sarıyer",
    address: "Köybaşı Caddesi No: 84",
    latitude: 41.1218,
    longitude: 29.0712,
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    hasPanorama360: true,
    isStaged: true,
    agencyId: "agency-prime-01",
    agentId: "user-owner-01",
    agentName: "Derin Soydan",
    createdAt: "2026-11-01",
    source: "memory",
  },
  {
    id: "prop-2",
    title: "Villa Belle Époque Cap d'Antibes",
    description:
      "Fransız Rivierası'nın kalbi Cap d'Antibes yarımadasında Akdeniz'e hakim kayalıklar üzerine inşa edilmiş neo-klasik sahil villası.",
    price: 38000000,
    currency: "EUR",
    status: PropertyStatus.FOR_SALE,
    bedrooms: 7,
    bathrooms: 8,
    squareMeters: 980,
    isFurnished: true,
    city: "Antibes",
    district: "Cap d'Antibes",
    address: "Boulevard du Cap 112",
    latitude: 43.5515,
    longitude: 7.1292,
    imageUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    hasPanorama360: true,
    isStaged: true,
    agencyId: "agency-prime-01",
    agentId: "user-agent-01",
    agentName: "Can Demir",
    createdAt: "2026-11-03",
    source: "memory",
  },
  {
    id: "prop-3",
    title: "Sky Penthouse at Palm Jumeirah",
    description:
      "Palm Jumeirah hilalinde 360 derece Basra Körfezi ve Dubai silüeti manzaralı çift katlı penthouse rezidans.",
    price: 27900000,
    currency: "USD",
    status: PropertyStatus.FOR_SALE,
    bedrooms: 5,
    bathrooms: 6,
    squareMeters: 820,
    isFurnished: false,
    city: "Dubai",
    district: "Palm Jumeirah",
    address: "Crescent Road Penthouse 1",
    latitude: 25.1124,
    longitude: 55.139,
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    hasPanorama360: true,
    isStaged: false,
    agencyId: "agency-prime-01",
    agentId: "user-owner-01",
    agentName: "Derin Soydan",
    createdAt: "2026-11-05",
    source: "memory",
  },
  {
    id: "prop-4",
    title: "Yalıkavak Cliffside Private Estate",
    description:
      "Yalıkavak Marina'ya hakim yamaçta tamamen doğal Bodrum taşlarıyla örülmüş müstakil malikâne ve sonsuzluk havuzu.",
    price: 18500000,
    currency: "EUR",
    status: PropertyStatus.OFF_MARKET,
    bedrooms: 6,
    bathrooms: 7,
    squareMeters: 860,
    isFurnished: true,
    city: "Bodrum",
    district: "Yalıkavak",
    address: "Tilkicik Koyu Yolu No: 18",
    latitude: 37.1065,
    longitude: 27.2885,
    imageUrl:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    hasPanorama360: false,
    isStaged: true,
    agencyId: "agency-prime-01",
    agentId: "user-agent-01",
    agentName: "Can Demir",
    createdAt: "2026-11-07",
    source: "memory",
  },
];

async function ensureTenantAgency(preferredAgencyId?: string | null) {
  const slug = "lumiere-prime";
  const existing = preferredAgencyId
    ? await prisma.agency.findUnique({ where: { id: preferredAgencyId } })
    : await prisma.agency.findUnique({ where: { slug } });

  if (existing) return existing;

  return prisma.agency.upsert({
    where: { slug },
    update: {},
    create: {
      name: "Lumière Prime Estates",
      slug,
      themeColor: "#D4AF37",
    },
  });
}

/**
 * Portföy listesini getir (Prisma DB öncelikli, yoksa Fallback havuzu)
 */
export async function getAdminProperties(): Promise<{
  properties: AdminPropertyItem[];
  storageMode: "prisma" | "memory";
}> {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || Role.AGENCY_OWNER;
  const userId = session?.user?.id;
  const agencyId = session?.user?.agencyId;

  try {
    const whereClause =
      role === Role.SUPERADMIN
        ? {}
        : role === Role.AGENT && userId
        ? { agentId: userId }
        : agencyId
        ? { agencyId }
        : {};

    const rows = await prisma.property.findMany({
      where: whereClause,
      include: {
        media: { orderBy: { sortOrder: "asc" } },
        agent: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (rows.length > 0) {
      return {
        storageMode: "prisma",
        properties: rows.map((row) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          price: Number(row.price),
          currency: row.currency,
          status: row.status,
          bedrooms: row.bedrooms ?? 4,
          bathrooms: row.bathrooms ?? 3,
          squareMeters: row.squareMeters ?? 350,
          isFurnished: row.isFurnished,
          city: row.city,
          district: row.district ?? "",
          address: row.address ?? "",
          latitude: row.latitude,
          longitude: row.longitude,
          imageUrl:
            row.media[0]?.url ||
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
          hasPanorama360: row.media.some((m) => m.type === MediaType.PANORAMA_360),
          isStaged: row.media.some((m) => m.isStaged),
          agencyId: row.agencyId,
          agentId: row.agentId,
          agentName: row.agent?.fullName || "Derin Soydan",
          createdAt: row.createdAt.toISOString().split("T")[0],
          source: "prisma",
        })),
      };
    }
  } catch (err) {
    console.warn("Prisma getAdminProperties fallback:", err);
  }

  const scopedMemory =
    role === Role.AGENT && userId
      ? FALLBACK_PROPERTIES.filter((p) => p.agentId === userId)
      : FALLBACK_PROPERTIES;

  return {
    storageMode: "memory",
    properties: scopedMemory,
  };
}

/**
 * Yeni İlan Ekle (Prisma Create + Semantik Paragraf Üretimi)
 */
export async function createAdminProperty(input: UpsertPropertyInput) {
  const session = await getServerSession(authOptions);
  const semanticText = generateSemanticParagraph({
    title: input.title,
    description: input.description,
    city: input.city,
    district: input.district,
    price: input.price,
    currency: input.currency,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    squareMeters: input.squareMeters,
  });

  try {
    const agency = await ensureTenantAgency(session?.user?.agencyId);
    const created = await prisma.property.create({
      data: {
        title: input.title,
        description: input.description,
        price: input.price,
        currency: input.currency,
        status: input.status,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        squareMeters: input.squareMeters,
        isFurnished: input.isFurnished,
        city: input.city,
        district: input.district,
        address: input.address,
        latitude:
          typeof input.latitude === "number" && Number.isFinite(input.latitude)
            ? input.latitude
            : null,
        longitude:
          typeof input.longitude === "number" && Number.isFinite(input.longitude)
            ? input.longitude
            : null,
        semanticText,
        agencyId: agency.id,
        ...(session?.user?.id ? { agentId: session.user.id } : {}),
        ...(input.imageUrl
          ? {
              media: {
                create: {
                  url: input.imageUrl,
                  type: MediaType.IMAGE,
                  roomLabel: "Dış Cephe & Vitrin",
                  sortOrder: 0,
                },
              },
            }
          : {}),
      },
      include: { media: true },
    });

    revalidatePublicShowcase(created.id);

    return {
      success: true,
      storage: "prisma" as const,
      property: {
        id: created.id,
        title: created.title,
        description: created.description,
        price: Number(created.price),
        currency: created.currency,
        status: created.status,
        bedrooms: created.bedrooms ?? input.bedrooms,
        bathrooms: created.bathrooms ?? input.bathrooms,
        squareMeters: created.squareMeters ?? input.squareMeters,
        isFurnished: created.isFurnished,
        city: created.city,
        district: created.district ?? input.district,
        address: created.address ?? input.address,
        latitude: created.latitude,
        longitude: created.longitude,
        imageUrl: created.media[0]?.url || input.imageUrl,
        hasPanorama360: false,
        isStaged: false,
        agencyId: created.agencyId,
        agentId: created.agentId,
        agentName: session?.user?.name || "Derin Soydan",
        createdAt: created.createdAt.toISOString().split("T")[0],
        source: "prisma" as const,
      },
    };
  } catch (err) {
    console.warn("Prisma createProperty fallback to memory:", err);
    const newItem: AdminPropertyItem = {
      id: `prop-${Date.now()}`,
      ...input,
      hasPanorama360: false,
      isStaged: false,
      agencyId: session?.user?.agencyId || "agency-prime-01",
      agentId: session?.user?.id || "user-owner-01",
      agentName: session?.user?.name || "Derin Soydan",
      createdAt: new Date().toISOString().split("T")[0],
      source: "memory",
    };
    FALLBACK_PROPERTIES = [newItem, ...FALLBACK_PROPERTIES];
    revalidatePublicShowcase(newItem.id);
    return {
      success: true,
      storage: "memory" as const,
      property: newItem,
    };
  }
}

/**
 * Mevcut İlanı Düzenle (Prisma Update)
 */
export async function updateAdminProperty(id: string, input: UpsertPropertyInput) {
  const semanticText = generateSemanticParagraph({
    title: input.title,
    description: input.description,
    city: input.city,
    district: input.district,
    price: input.price,
    currency: input.currency,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    squareMeters: input.squareMeters,
  });

  try {
    const updated = await prisma.property.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        price: input.price,
        currency: input.currency,
        status: input.status,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        squareMeters: input.squareMeters,
        isFurnished: input.isFurnished,
        city: input.city,
        district: input.district,
        address: input.address,
        latitude:
          typeof input.latitude === "number" && Number.isFinite(input.latitude)
            ? input.latitude
            : null,
        longitude:
          typeof input.longitude === "number" && Number.isFinite(input.longitude)
            ? input.longitude
            : null,
        semanticText,
      },
      include: { media: true },
    });

    if (input.imageUrl) {
      const firstMedia = updated.media[0];
      if (firstMedia) {
        await prisma.media.update({
          where: { id: firstMedia.id },
          data: { url: input.imageUrl },
        });
      } else {
        await prisma.media.create({
          data: {
            propertyId: id,
            url: input.imageUrl,
            type: MediaType.IMAGE,
            roomLabel: "Dış Cephe & Vitrin",
            sortOrder: 0,
          },
        });
      }
    }

    revalidatePublicShowcase(id);

    return { success: true, storage: "prisma" as const };
  } catch (err) {
    console.warn("Prisma updateProperty fallback to memory:", err);
    FALLBACK_PROPERTIES = FALLBACK_PROPERTIES.map((item) =>
      item.id === id ? { ...item, ...input } : item
    );
    revalidatePublicShowcase(id);
    return { success: true, storage: "memory" as const };
  }
}

/**
 * İlanı Vitrine Yayınla (Durumu Güncelle + Ana Sayfa Cache'ini Temizle)
 */
export async function publishAdminProperty(
  id: string,
  status: PropertyStatus = PropertyStatus.FOR_SALE
) {
  try {
    const updated = await prisma.property.update({
      where: { id },
      data: { status },
    });

    revalidatePublicShowcase(id);

    return {
      success: true,
      storage: "prisma" as const,
      status: updated.status,
    };
  } catch (err) {
    console.warn("Prisma publishAdminProperty fallback to memory:", err);
    FALLBACK_PROPERTIES = FALLBACK_PROPERTIES.map((item) =>
      item.id === id ? { ...item, status } : item
    );
    revalidatePublicShowcase(id);
    return {
      success: true,
      storage: "memory" as const,
      status,
    };
  }
}

/**
 * İlan Sil (Prisma Delete)
 */
export async function deleteAdminProperty(id: string) {
  try {
    await prisma.property.delete({ where: { id } });
    revalidatePublicShowcase(id);
    return { success: true, storage: "prisma" as const };
  } catch (err) {
    console.warn("Prisma deleteProperty fallback to memory:", err);
    FALLBACK_PROPERTIES = FALLBACK_PROPERTIES.filter((item) => item.id !== id);
    revalidatePublicShowcase(id);
    return { success: true, storage: "memory" as const };
  }
}

/**
 * Çevrimdışı / Lokal fallback modunda vitrin kartlarını döner
 */
export async function getPublicFallbackProperties(): Promise<{
  cards: PropertyCardItem[];
  items: AdminPropertyItem[];
}> {
  const active = FALLBACK_PROPERTIES.filter(
    (item) => item.status !== PropertyStatus.DRAFT
  );
  const cards: PropertyCardItem[] = active.map((item) => ({
    id: item.id,
    title: item.title,
    price: item.price,
    currency: item.currency,
    city: item.city,
    district: item.district,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    squareMeters: item.squareMeters,
    imageUrl: item.imageUrl,
    hasPanorama360: item.hasPanorama360,
    status: item.status,
    isFurnished: item.isFurnished,
  }));
  return { cards, items: active };
}

/**
 * ID ile lokal fallback mülkünü getirir
 */
export async function getFallbackPropertyById(
  id: string
): Promise<AdminPropertyItem | null> {
  return FALLBACK_PROPERTIES.find((item) => item.id === id) || null;
}

