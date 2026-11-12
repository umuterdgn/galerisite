"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { MapPin, BedDouble, Bath, Maximize2, Compass, ArrowUpRight } from "lucide-react";

export interface PropertyCardItem {
  id: string;
  title: string;
  price: number | string;
  currency?: string;
  city: string;
  district?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareMeters?: number | null;
  imageUrl: string;
  hasPanorama360?: boolean;
  status?: string;
  isFurnished?: boolean;
}

export interface PropertyCardProps {
  property: PropertyCardItem;
  priority?: boolean;
}

export function PropertyCard({ property, priority = false }: PropertyCardProps) {
  const {
    id,
    title,
    price,
    currency = "EUR",
    city,
    district,
    bedrooms,
    bathrooms,
    squareMeters,
    imageUrl,
    hasPanorama360 = false,
  } = property;

  // Format currency & price (e.g. € 42.500.000)
  const formattedPrice =
    typeof price === "number"
      ? new Intl.NumberFormat("tr-TR", {
          style: "currency",
          currency: currency,
          maximumFractionDigits: 0,
        }).format(price)
      : price;

  const locationText = district ? `${district}, ${city}` : city;
  const isConfiguredDomain =
    imageUrl.startsWith("/") ||
    imageUrl.includes("res.cloudinary.com") ||
    imageUrl.includes("images.unsplash.com");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl transition-all duration-300 hover:border-gold-500/50 hover:shadow-gold-md"
    >
      <Link href={`/properties/${id}`} className="flex flex-1 flex-col">
        {/* Main Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-obsidian-950">
          <Image
            src={imageUrl}
            alt={title}
            fill
            unoptimized={!isConfiguredDomain}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Luxury Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-black/30" />

          {/* Top Right: 360° / 3D Animated Luxury Badge */}
          {hasPanorama360 && (
            <div className="absolute top-3 right-3 z-10">
              <div className="relative inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-obsidian-950/80 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-gold-400 backdrop-blur-md shadow-luxury-glass">
                {/* Subtle Pulsing Ring */}
                <span className="absolute -inset-0.5 rounded-full bg-gold-500/20 animate-ping opacity-75" />
                <Compass className="relative h-3.5 w-3.5 text-gold-400 animate-spin-slow" />
                <span className="relative">360° TUR</span>
              </div>
            </div>
          )}

          {/* Quick Corner Arrow for Apple simplicity */}
          <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-gold-500/30 bg-obsidian-950/70 text-gold-400 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-105">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>

        {/* Card Body & Specs */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            {/* Price (Prominent luxury typography) */}
            <div className="flex items-baseline justify-between">
              <span className="font-serif text-2xl font-bold tracking-tight text-gold-500">
                {formattedPrice}
              </span>
            </div>

            {/* Title */}
            <h3 className="mt-1.5 font-serif text-base font-semibold text-foreground line-clamp-1 transition-colors group-hover:text-gold-400">
              {title}
            </h3>

            {/* Location */}
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-gold-500/80 shrink-0" />
              <span className="truncate">{locationText}</span>
            </div>
          </div>

          {/* Minimal Specs Divider */}
          <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
            {bedrooms != null && (
              <div className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5 text-gold-400/90" />
                <span>{bedrooms} Yatak</span>
              </div>
            )}

            {bathrooms != null && (
              <div className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5 text-gold-400/90" />
                <span>{bathrooms} Banyo</span>
              </div>
            )}

            {squareMeters != null && (
              <div className="flex items-center gap-1">
                <Maximize2 className="h-3.5 w-3.5 text-gold-400/90" />
                <span>{squareMeters} m²</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

