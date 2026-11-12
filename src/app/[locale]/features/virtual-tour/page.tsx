import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFeatureBySlug } from "@/lib/features-catalog";
import { FeatureDetailView } from "@/components/public/FeatureDetailView";
import { VirtualTour } from "@/components/public/VirtualTour";

const feature = getFeatureBySlug("virtual-tour");

export const metadata: Metadata = {
  title: `${feature?.title || "360° Sanal Tur"} | LUMIÈRE Estates`,
  description: feature?.heroDescription,
};

export default function VirtualTourFeaturePage() {
  if (!feature) notFound();

  return (
    <FeatureDetailView
      feature={feature}
      previewTitle="Canlı 360° Sanal Tur Önizlemesi"
      previewDescription="Odalar arası geçiş oklarını ve interaktif altın hotspot bilgi noktalarını canlı olarak deneyimleyin."
    >
      <VirtualTour propertyTitle="LUMIÈRE Örnek Boğaz Köşkü" />
    </FeatureDetailView>
  );
}

