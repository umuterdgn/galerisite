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
  const propertyId = input.propertyId?.trim();
  const url = input.url?.trim();

  if (!propertyId || !url) {
    throw new Error("İlan seçimi (propertyId) ve panorama URL zorunludur.");
  }

  const targetProperty = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!targetProperty) {
    throw new Error("Seçili ilan veritabanında bulunamadı.");
  }

  const media = await prisma.media.create({
    data: {
      property: { connect: { id: propertyId } },
      url,
      type: MediaType.PANORAMA_360,
      roomLabel: input.roomLabel?.trim() || "Sanal Oda",
      isStaged: false,
      sortOrder: input.sortOrder ?? 0,
    },
  });

  revalidateTourTargets(propertyId);

  return {
    success: true,
    storage: "prisma" as const,
    mediaId: media.id,
    url: media.url,
  };
}

/**
 * Tüm Sanal Tur odalarını, Cubemap yüz URL'lerini, X/Y/Z Hotspot koordinatlarını ve
 * oda geçiş oklarını Prisma Veritabanına bağlayarak kaydeder.
 */
export async function saveFullVirtualTour(
  propertyId: string,
  rooms: SavedTourRoomPayload[]
) {
  const cleanPropertyId = propertyId?.trim();
  if (!cleanPropertyId) {
    throw new Error("360° sanal tur kaydedebilmek için hedef ilan (propertyId) zorunludur.");
  }

  const sanitizedRooms = rooms.filter((r) => Boolean(r.panoramaUrl?.trim()));

  const result = await prisma.$transaction(async (tx) => {
    const existingProp = await tx.property.findUnique({
      where: { id: cleanPropertyId },
      select: { id: true, schemaJson: true },
    });

    if (!existingProp) {
      throw new Error("Seçili ilan veritabanında bulunamadı.");
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
        roomCount: sanitizedRooms.length,
        rooms: sanitizedRooms,
      },
    };

    await tx.property.update({
      where: { id: cleanPropertyId },
      data: {
        schemaJson: mergedSchema as unknown as Prisma.InputJsonValue,
      },
    });

    await tx.media.deleteMany({
      where: {
        propertyId: cleanPropertyId,
        type: MediaType.PANORAMA_360,
      },
    });

    for (let idx = 0; idx < sanitizedRooms.length; idx++) {
      const room = sanitizedRooms[idx];
      await tx.media.create({
        data: {
          property: { connect: { id: cleanPropertyId } },
          url: room.panoramaUrl.trim(),
          type: MediaType.PANORAMA_360,
          roomLabel: room.roomLabel?.trim() || `Oda ${idx + 1}`,
          isStaged: false,
          sortOrder: idx,
        },
      });
    }

    return sanitizedRooms.length;
  });

  TOUR_MEMORY_STORE[cleanPropertyId] = sanitizedRooms;
  revalidateTourTargets(cleanPropertyId);

  return {
    success: true,
    storage: "prisma" as const,
    savedRooms: result,
  };
}

/**
 * Seçili ilana ait kaydedilmiş 360° Tur verilerini yükler.
 */
export async function loadPropertyVirtualTour(propertyId: string): Promise<{
  rooms: SavedTourRoomPayload[] | null;
  source: "prisma" | "memory" | "none";
}> {
  const cleanPropertyId = propertyId?.trim();
  if (!cleanPropertyId) {
    return { rooms: null, source: "none" };
  }

  try {
    const prop = await prisma.property.findUnique({
      where: { id: cleanPropertyId },
      select: {
        schemaJson: true,
        media: {
          where: { type: MediaType.PANORAMA_360 },
          orderBy: { sortOrder: "asc" },
        },
      },
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

    if (prop?.media && prop.media.length > 0) {
      const mediaRooms: SavedTourRoomPayload[] = prop.media.map((m, idx) => ({
        id: `media-room-${m.id}`,
        roomLabel: m.roomLabel || `Oda ${idx + 1}`,
        customTitle: m.roomLabel || `360° Panorama ${idx + 1}`,
        captureMode: "equirectangular",
        panoramaUrl: m.url,
        sortOrder: m.sortOrder ?? idx,
        hotspots: [],
        links: [],
      }));
      return { rooms: mediaRooms, source: "prisma" };
    }
  } catch (err) {
    console.warn("Prisma loadPropertyVirtualTour failed:", err);
  }

  return { rooms: null, source: "none" };
}

