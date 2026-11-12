import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { MediaType, PropertyStatus, type Media, type Property } from "@prisma/client";
import { getPublicFallbackProperties } from "@/lib/actions/property";
import type { PropertyCardItem } from "@/components/public/PropertyCard";
import type { MapPropertyItem } from "@/components/public/MapExplore";

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80";

export const ACTIVE_GEO_STATUSES: PropertyStatus[] = [
  PropertyStatus.FOR_SALE,
  PropertyStatus.FOR_RENT,
  PropertyStatus.OFF_MARKET,
];

export interface PublicPropertiesSnapshot {
  cards: PropertyCardItem[];
  mapItems: MapPropertyItem[];
  dbConnected: boolean;
}

type PropertyWithMedia = Property & { media: Media[] };

function formatMapPrice(rawPrice: number, currency: string): string {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currency || "EUR",
      maximumFractionDigits: 0,
    }).format(rawPrice);
  } catch {
    return `${currency || "EUR"} ${rawPrice.toLocaleString("tr-TR")}`;
  }
}

export function isValidCoordinate(
  lat: unknown,
  lng: unknown
): lat is number {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function mapPropertyToCard(prop: PropertyWithMedia): PropertyCardItem {
  const sortedMedia = [...prop.media].sort((a, b) => a.sortOrder - b.sortOrder);
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
}

function mapPropertyToGeoItem(prop: PropertyWithMedia): MapPropertyItem | null {
  if (
    !ACTIVE_GEO_STATUSES.includes(prop.status) ||
    !isValidCoordinate(prop.latitude, prop.longitude)
  ) {
    return null;
  }

  const sortedMedia = [...prop.media].sort((a, b) => a.sortOrder - b.sortOrder);
  const coverMedia =
    sortedMedia.find((m) => m.type === MediaType.IMAGE) || sortedMedia[0];
  const rawPrice = Number(prop.price);

  return {
    id: prop.id,
    title: prop.title,
    price: formatMapPrice(rawPrice, prop.currency),
    rawPrice,
    currency: prop.currency,
    status: prop.status,
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
}

/**
 * Live uncached query strictly for active properties that have valid
 * latitude/longitude coordinates in PostgreSQL (used by /api/properties/map).
 */
export async function getLiveGeoMapProperties(): Promise<{
  properties: MapPropertyItem[];
  dbConnected: boolean;
}> {
  try {
    const dbProperties = await prisma.property.findMany({
      where: {
        status: { in: ACTIVE_GEO_STATUSES },
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        media: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const properties = dbProperties
      .map(mapPropertyToGeoItem)
      .filter((item): item is MapPropertyItem => item !== null);

    return { properties, dbConnected: true };
  } catch (error) {
    console.warn("Geo map Prisma query fallback:", error);
    const { items } = await getPublicFallbackProperties();
    const properties: MapPropertyItem[] = items
      .filter(
        (item) =>
          ACTIVE_GEO_STATUSES.includes(item.status) &&
          isValidCoordinate(item.latitude, item.longitude)
      )
      .map((item) => ({
        id: item.id,
        title: item.title,
        price: formatMapPrice(item.price, item.currency),
        rawPrice: item.price,
        currency: item.currency,
        status: item.status,
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
    return { properties, dbConnected: false };
  }
}

/**
 * Queries non-draft properties from PostgreSQL with Next.js cache tags
 * shared across the homepage showcase, collection grid, and GEO map.
 */
export const getCachedPublicProperties = unstable_cache(
  async (): Promise<PublicPropertiesSnapshot> => {
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

      const cards = dbProperties.map(mapPropertyToCard);
      const mapItems = dbProperties
        .map(mapPropertyToGeoItem)
        .filter((item): item is MapPropertyItem => item !== null);

      return { cards, mapItems, dbConnected: true };
    } catch (error) {
      console.warn("Public properties Prisma query fallback:", error);
      const { cards, items } = await getPublicFallbackProperties();
      const mapItems: MapPropertyItem[] = items
        .filter(
          (item) =>
            ACTIVE_GEO_STATUSES.includes(item.status) &&
            isValidCoordinate(item.latitude, item.longitude)
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          price: formatMapPrice(item.price, item.currency),
          rawPrice: item.price,
          currency: item.currency,
          status: item.status,
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
