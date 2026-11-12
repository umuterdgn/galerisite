import React from "react";
import type { Metadata } from "next";
import { getCachedPublicProperties } from "@/lib/public-properties";
import { PropertiesCollectionClient } from "@/components/public/PropertiesCollectionClient";

export const metadata: Metadata = {
  title: "Portföy Koleksiyonu | LUMIÈRE Estates",
  description:
    "Boğaz yalıları, sahil villaları, Sky Penthouse ve Off-Market ultra-lüks gayrimenkul koleksiyonunun tamamını keşfedin.",
};

export default async function PropertiesCollectionPage() {
  const { cards } = await getCachedPublicProperties();

  return <PropertiesCollectionClient initialProperties={cards} />;
}

