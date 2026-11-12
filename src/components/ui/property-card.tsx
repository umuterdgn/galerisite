"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { MapPin, BedDouble, Bath, Maximize2, Sparkles, ArrowUpRight } from "lucide-react";
import { Badge } from "./badge";

export interface PropertyCardProps {
  id: string;
  slug: string;
  title: string;
  price: string;
  currency?: string;
  location: string;
  specs: {
    beds?: number;
    baths?: number;
    area?: number | string;
  };
  imageUrl: string;
  badge?: string;
  isStaged?: boolean;
  status?: string;
}

export function PropertyCard({
  slug,
  title,
  price,
  location,
  specs,
  imageUrl,
  badge = "Ayrıcalıklı Portföy",
  isStaged = false,
}: PropertyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-xl shadow-sm transition-all duration-300 hover:border-gold-500/50 hover:shadow-gold-md"
    >
      {/* Visual / Image Container */}
      <div className="relative h-64 w-full overflow-hidden bg-obsidian-900">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <Badge variant="gold" className="text-[11px] shadow-luxury-glass">
            <Sparkles className="h-3 w-3 text-gold-400" />
            {badge}
          </Badge>

          {isStaged && (
            <Badge variant="staged" className="text-[10px]">
              AI Sahnelenmiş
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-gold-500 shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          {/* Title */}
          <h3 className="mt-2 font-serif text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-gold-400">
            {title}
          </h3>

          {/* Specifications */}
          <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
            {specs.beds && (
              <div className="flex items-center gap-1.5">
                <BedDouble className="h-3.5 w-3.5 text-gold-400" />
                <span>{specs.beds} Yatak</span>
              </div>
            )}
            {specs.baths && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-3.5 w-3.5 text-gold-400" />
                <span>{specs.baths} Banyo</span>
              </div>
            )}
            {specs.area && (
              <div className="flex items-center gap-1.5">
                <Maximize2 className="h-3.5 w-3.5 text-gold-400" />
                <span>{specs.area} m²</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & Action Link */}
        <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              Fiyat
            </span>
            <p className="font-serif text-xl font-bold text-gold-500">
              {price}
            </p>
          </div>

          <Link
            href={`/properties/${slug}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gold-500/30 bg-gold-500/10 text-gold-400 transition-all duration-300 hover:bg-gold-500 hover:text-obsidian-950 hover:scale-105"
            aria-label="İlan Detayı"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

