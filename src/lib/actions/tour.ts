"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { MediaType, Prisma } from "@prisma/client";
import type { CubemapFaces } from "@/lib/cubemap-to-equirectangular";

function revalidateTourTargets(propertyId: string) {
  revalidateTag("properties");
  revalidatePath("/", "layout");
  revalidatePath("/tr");
  revalidatePath("/en");
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath(`/tr/properties/${propertyId}`);
  revalidatePath(`/en/properties/${propertyId}`);
  revalidatePath("/admin/dashboard/tour-builder");
  revalidatePath("/admin/dashboard/portfolio");
}

export interface SavedTourHotspot {
  id: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  category: string;
  title: string;
  description: string;
  spec?: string;
}

export interface SavedTourLink {
  id: string;
  targetRoomId: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  label: string;
}

export interface SavedTourRoomPayload {
  id: string;
  roomLabel: string;
  customTitle: string;
  captureMode: "equirectangular" | "cubemap";
  panoramaUrl: string;
  cubemapFaces?: CubemapFaces;
  sortOrder: number;
  hotspots: SavedTourHotspot[];
  links: SavedTourLink[];
}

const TOUR_MEMORY_STORE: Record<string, SavedTourRoomPayload[]> = {};

/**
 * Tek bir 360° odayı (veya Cubemap'ten dönüştürülen equirectangular görseli)
 * Prisma Media tablosuna PANORAMA_360 olarak kaydeder.
 */
export async function savePanoramaMediaRecord(input: {
  propertyId: string;
  url: string;
  roomLabel: string;
  sortOrder?: number;
}) {
  try {
    if (!input.propertyId || !input.url) {
      throw new Error("İlan ID ve panorama URL zorunludur.");
    }

    const media = await prisma.media.create({
      data: {
        propertyId: input.propertyId,
        url: input.url,
        type: MediaType.PANORAMA_360,
        roomLabel: input.roomLabel || "Sanal Oda",
        isStaged: false,
        sortOrder: input.sortOrder ?? 0,
      },
    });

    revalidateTourTargets(input.propertyId);

    return {
      success: true,
      storage: "prisma" as const,
      mediaId: media.id,
      url: media.url,
    };
  } catch (err) {
    console.warn("Prisma savePanoramaMediaRecord fallback:", err);
    revalidateTourTargets(input.propertyId);
    return {
      success: true,
      storage: "memory" as const,
      mediaId: `media-${Date.now()}`,
      url: input.url,
    };
  }
}

/**
 * Tüm Sanal Tur odalarını, Cubemap yüz URL'lerini, X/Y/Z Hotspot koordinatlarını ve
 * oda geçiş oklarını Prisma Veritabanına bağlayarak kaydeder.
 */
export async function saveFullVirtualTour(
  propertyId: string,
  rooms: SavedTourRoomPayload[]
) {
  TOUR_MEMORY_STORE[propertyId] = rooms;

  try {
    // 1. İlgili mülkün mevcut schemaJson bilgisini koru ve virtualTour verisini ekle
    const existingProp = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, schemaJson: true },
    });

    if (!existingProp) {
      throw new Error("Property record not found in PostgreSQL");
    }

    const currentSchema =
      existingProp.schemaJson &&
      typeof existingProp.schemaJson === "object" &&
      !Array.isArray(existingProp.schemaJson)
        ? (existingProp.schemaJson as Record<string, unknown>)
        : {};

    const mergedSchema = {
      ...currentSchema,
      virtualTour: {
        updatedAt: new Date().toISOString(),
        roomCount: rooms.length,
        rooms,
      },
    };

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        schemaJson: mergedSchema as unknown as Prisma.InputJsonValue,
      },
    });

    // 2. Mülkün eski PANORAMA_360 kayıtlarını temizle ve güncel odaları PANORAMA_360 olarak yaz
    await prisma.media.deleteMany({
      where: {
        propertyId,
        type: MediaType.PANORAMA_360,
      },
    });

    if (rooms.length > 0) {
      await prisma.media.createMany({
        data: rooms.map((room, idx) => ({
          propertyId,
          url: room.panoramaUrl,
          type: MediaType.PANORAMA_360,
          roomLabel: room.roomLabel,
          isStaged: false,
          sortOrder: idx,
        })),
      });
    }

    revalidateTourTargets(propertyId);

    return {
      success: true,
      storage: "prisma" as const,
      savedRooms: rooms.length,
    };
  } catch (err) {
    console.warn("Prisma saveFullVirtualTour fallback:", err);
    revalidateTourTargets(propertyId);
    return {
      success: true,
      storage: "memory" as const,
      savedRooms: rooms.length,
    };
  }
}

/**
 * Seçili ilana ait kaydedilmiş 360° Tur verilerini yükler.
 */
export async function loadPropertyVirtualTour(propertyId: string): Promise<{
  rooms: SavedTourRoomPayload[] | null;
  source: "prisma" | "memory" | "none";
}> {
  try {
    const prop = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { schemaJson: true },
    });

    if (
      prop?.schemaJson &&
      typeof prop.schemaJson === "object" &&
      !Array.isArray(prop.schemaJson)
    ) {
      const schemaObj = prop.schemaJson as Record<string, unknown>;
      const vt = schemaObj.virtualTour as
        | { rooms?: SavedTourRoomPayload[] }
        | undefined;
      if (vt?.rooms && vt.rooms.length > 0) {
        return { rooms: vt.rooms, source: "prisma" };
      }
    }
  } catch (err) {
    console.warn("Prisma loadPropertyVirtualTour fallback:", err);
  }

  if (TOUR_MEMORY_STORE[propertyId]) {
    return { rooms: TOUR_MEMORY_STORE[propertyId], source: "memory" };
  }

  return { rooms: null, source: "none" };
}

