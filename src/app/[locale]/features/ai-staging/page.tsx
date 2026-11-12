import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFeatureBySlug } from "@/lib/features-catalog";
import { FeatureDetailView } from "@/components/public/FeatureDetailView";
import { VirtualStagingSlider } from "@/components/public/VirtualStagingSlider";

const feature = getFeatureBySlug("ai-staging");

export const metadata: Metadata = {
  title: `${feature?.title || "AI Virtual Staging"} | LUMIÈRE Estates`,
  description: feature?.heroDescription,
};

export default function AiStagingFeaturePage() {
  if (!feature) notFound();

  return (
    <FeatureDetailView
      feature={feature}
      previewTitle="İnteraktif AI Virtual Staging Stüdyosu"
      previewDescription="Orta çizgiyi sürükleyerek boş mekânın yapay zekâ ile nasıl fotorealistik lüks iç mekâna dönüştüğünü inceleyin."
    >
      <VirtualStagingSlider roomName="Boğaz Manzaralı Ana Salon" />
    </FeatureDetailView>
  );
}

