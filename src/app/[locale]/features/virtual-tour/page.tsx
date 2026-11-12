import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MediaType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getFeatureBySlug } from "@/lib/features-catalog";
import { FeatureDetailView } from "@/components/public/FeatureDetailView";
import { VirtualTour } from "@/components/public/VirtualTour";

export const dynamic = "force-dynamic";

const feature = getFeatureBySlug("virtual-tour");

export const metadata: Metadata = {
  title: `${feature?.title || "360° Sanal Tur"} | LUMIÈRE Estates`,
  description: feature?.heroDescription,
};

export default async function VirtualTourFeaturePage() {
  if (!feature) notFound();

  let showcaseTitle = "360° Portföy Vitrini";
  let showcaseMedia: Array<{
    id: string;
    url: string;
    type: string;
    roomLabel?: string | null;
    isStaged?: boolean;
  }> = [];

  try {
    const firstTourProp = await prisma.property.findFirst({
      where: {
        media: { some: { type: MediaType.PANORAMA_360 } },
      },
      include: {
        media: {
          where: { type: MediaType.PANORAMA_360 },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (firstTourProp && firstTourProp.media.length > 0) {
      showcaseTitle = firstTourProp.title;
      showcaseMedia = firstTourProp.media.map((m) => ({
        id: m.id,
        url: m.url,
        type: m.type,
        roomLabel: m.roomLabel,
        isStaged: m.isStaged,
      }));
    }
  } catch (err) {
    console.warn("VirtualTourFeaturePage DB fetch warning:", err);
  }

  return (
    <FeatureDetailView
      feature={feature}
      previewTitle="Canlı 360° Sanal Tur Önizlemesi"
      previewDescription="Odalar arası geçiş oklarını ve interaktif altın hotspot bilgi noktalarını canlı olarak deneyimleyin."
    >
      <VirtualTour propertyTitle={showcaseTitle} media={showcaseMedia} />
    </FeatureDetailView>
  );
}

