import React from "react";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { MediaType, PropertyStatus } from "@prisma/client";
import { getPublicFallbackProperties } from "@/lib/actions/property";
import { HomePageClient } from "@/components/public/HomePageClient";
import { type PropertyCardItem } from "@/components/public/PropertyCard";
import { type MapPropertyItem } from "@/components/public/MapExplore";

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80";

const getCachedPublicProperties = unstable_cache(
  async () => {
    try {
      const dbProperties = await prisma.property.findMany({
        where: {
          status: {
            not: PropertyStatus.DRAFT,
          },
        },
        include: {
          media: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const cards: PropertyCardItem[] = dbProperties.map((prop) => {
        const sortedMedia = [...prop.media].sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
        const coverMedia =
          sortedMedia.find((m) => m.type === MediaType.IMAGE) || sortedMedia[0];
        const hasPanorama360 = sortedMedia.some(
          (m) => m.type === MediaType.PANORAMA_360
        );

        return {
          id: prop.id,
          title: prop.title,
          price: Number(prop.price),
          currency: prop.currency,
          city: prop.city,
          district: prop.district,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          squareMeters: prop.squareMeters,
          imageUrl: coverMedia?.url || DEFAULT_FALLBACK_IMAGE,
          hasPanorama360,
          status: prop.status,
          isFurnished: prop.isFurnished,
        };
      });

      const mapItems: MapPropertyItem[] = dbProperties
        .filter(
          (prop) =>
            typeof prop.latitude === "number" &&
            typeof prop.longitude === "number"
        )
        .map((prop) => {
          const sortedMedia = [...prop.media].sort(
            (a, b) => a.sortOrder - b.sortOrder
          );
          const coverMedia =
            sortedMedia.find((m) => m.type === MediaType.IMAGE) || sortedMedia[0];
          const rawPrice = Number(prop.price);
          const formatted = new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: prop.currency || "EUR",
            maximumFractionDigits: 0,
          }).format(rawPrice);

          return {
            id: prop.id,
            title: prop.title,
            price: formatted,
            rawPrice,
            currency: prop.currency,
            city: prop.city,
            district: prop.district || "",
            latitude: prop.latitude as number,
            longitude: prop.longitude as number,
            bedrooms: prop.bedrooms ?? 3,
            bathrooms: prop.bathrooms ?? 2,
            squareMeters: prop.squareMeters ?? 200,
            imageUrl: coverMedia?.url || DEFAULT_FALLBACK_IMAGE,
            hasPanorama360: sortedMedia.some(
              (m) => m.type === MediaType.PANORAMA_360
            ),
          };
        });

      return { cards, mapItems, dbConnected: true };
    } catch (error) {
      console.warn("Homepage Prisma query fallback:", error);
      const { cards, items } = await getPublicFallbackProperties();
      const mapItems: MapPropertyItem[] = items
        .filter(
          (item) =>
            typeof item.latitude === "number" &&
            typeof item.longitude === "number"
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          price: new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: item.currency || "EUR",
            maximumFractionDigits: 0,
          }).format(item.price),
          rawPrice: item.price,
          currency: item.currency,
          city: item.city,
          district: item.district || "",
          latitude: item.latitude as number,
          longitude: item.longitude as number,
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          squareMeters: item.squareMeters,
          imageUrl: item.imageUrl || DEFAULT_FALLBACK_IMAGE,
          hasPanorama360: item.hasPanorama360,
        }));
      return { cards, mapItems, dbConnected: false };
    }
  },
  ["homepage-public-properties"],
  {
    tags: ["properties"],
    revalidate: 60,
  }
);

export default async function HomePage() {
  const { cards, mapItems } = await getCachedPublicProperties();

  return (
    <HomePageClient
      initialProperties={cards}
      mapProperties={mapItems}
    />
  );
}
