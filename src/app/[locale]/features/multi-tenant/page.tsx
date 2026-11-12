import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFeatureBySlug } from "@/lib/features-catalog";
import { FeatureDetailView } from "@/components/public/FeatureDetailView";
import { PropertyInquiryForm } from "@/components/property-inquiry-form";

const feature = getFeatureBySlug("multi-tenant");

export const metadata: Metadata = {
  title: `${feature?.title || "Multi-Tenant Mimari"} | LUMIÈRE Estates`,
  description: feature?.heroDescription,
};

export default function MultiTenantFeaturePage() {
  if (!feature) notFound();

  return (
    <FeatureDetailView
      feature={feature}
      previewTitle="Ajans Ortaklığı & Beyaz Etiket Onboarding"
      previewDescription="Emlak ajansınız için özel alt alan adı (subdomain) ve kurumsal tema kurulumu hakkında bilgi alın."
    >
      <div className="mx-auto max-w-4xl">
        <PropertyInquiryForm />
      </div>
    </FeatureDetailView>
  );
}

