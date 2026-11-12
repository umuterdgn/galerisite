import React from "react";
import { getCachedPublicProperties } from "@/lib/public-properties";
import { HomePageClient } from "@/components/public/HomePageClient";

export default async function HomePage() {
  const { cards, mapItems } = await getCachedPublicProperties();

  return (
    <HomePageClient
      initialProperties={cards}
      mapProperties={mapItems}
    />
  );
}
