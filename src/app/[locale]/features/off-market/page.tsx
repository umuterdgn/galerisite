import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFeatureBySlug } from "@/lib/features-catalog";
import { FeatureDetailView } from "@/components/public/FeatureDetailView";
import { PropertyInquiryForm } from "@/components/property-inquiry-form";

const feature = getFeatureBySlug("off-market");

export const metadata: Metadata = {
  title: `${feature?.title || "Off-Market Mahremiyet"} | LUMIÈRE Estates`,
  description: feature?.heroDescription,
};

export default function OffMarketFeaturePage() {
  if (!feature) notFound();

  return (
    <FeatureDetailView
      feature={feature}
      previewTitle="Akredite Off-Market Erişim Başvurusu"
      previewDescription="NDA korumalı kapalı portföylere erişim talebi oluşturun veya ajans yöneticinizle doğrudan iletişime geçin."
    >
      <div className="mx-auto max-w-4xl">
        <PropertyInquiryForm />
      </div>
    </FeatureDetailView>
  );
}

