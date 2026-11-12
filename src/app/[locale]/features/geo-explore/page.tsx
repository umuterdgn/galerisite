import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFeatureBySlug } from "@/lib/features-catalog";
import { getCachedPublicProperties } from "@/lib/public-properties";
import { FeatureDetailView } from "@/components/public/FeatureDetailView";
import { MapExplore } from "@/components/public/MapExplore";

const feature = getFeatureBySlug("geo-explore");

export const metadata: Metadata = {
  title: `${feature?.title || "GEO Keşif"} | LUMIÈRE Estates`,
  description: feature?.heroDescription,
};

export default async function GeoExploreFeaturePage() {
  if (!feature) notFound();

  const { mapItems } = await getCachedPublicProperties();

  return (
    <FeatureDetailView
      feature={feature}
      previewTitle="Canlı GEO Portföy Haritası"
      previewDescription="Veritabanındaki koordinatlı lüks portföyü destinasyonlara göre interaktif harita üzerinde keşfedin."
    >
      <MapExplore properties={mapItems} />
    </FeatureDetailView>
  );
}

