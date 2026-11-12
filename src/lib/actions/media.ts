"use server";

import prisma from "@/lib/prisma";
import { MediaType } from "@prisma/client";

export interface SaveMediaInput {
  url: string;
  type: MediaType;
  roomLabel?: string;
  isStaged?: boolean;
  sortOrder?: number;
}

/**
 * Cloudinary'den dönen optimize edilmiş medya URL'lerini
 * doğrudan Prisma veritabanındaki Media tablosuna kaydeder.
 */
export async function savePropertyMedia(
  propertyId: string,
  mediaItems: SaveMediaInput[]
) {
  try {
    if (!propertyId) {
      throw new Error("Geçerli bir propertyId gereklidir.");
    }

    if (!mediaItems || mediaItems.length === 0) {
      return { success: true, count: 0 };
    }

    const result = await prisma.media.createMany({
      data: mediaItems.map((item, idx) => ({
        propertyId,
        url: item.url,
        type: item.type,
        roomLabel: item.roomLabel || null,
        isStaged: item.isStaged || false,
        sortOrder: item.sortOrder ?? idx,
      })),
    });

    return { success: true, count: result.count };
  } catch (error: unknown) {
    console.error("Prisma Media save error:", error);
    const message =
      error instanceof Error ? error.message : "Medyalar kaydedilemedi.";
    return {
      success: false,
      error: message,
    };
  }
}

