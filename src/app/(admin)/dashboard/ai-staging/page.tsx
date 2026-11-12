"use client";

import React, { useState } from "react";
import { Sparkles, Building2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VirtualStagingSlider } from "@/components/public/VirtualStagingSlider";
import { MediaUploader } from "@/components/ui/MediaUploader";
import { savePropertyMedia } from "@/lib/actions/media";

const PROPERTY_OPTIONS = [
  {
    id: "prop-1",
    title: "The Bosphorus Waterfront Palace",
    roomName: "Ana Salon & Boğaz Cephesi",
    beforeImage:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "prop-2",
    title: "Villa Belle Époque Cap d'Antibes",
    roomName: "Akdeniz Panoramik Teras Salonu",
    beforeImage:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "prop-3",
    title: "Sky Penthouse at Palm Jumeirah",
    roomName: "Çift Katlı Çatı Loft Salonu",
    beforeImage:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
  },
  {
    id: "prop-4",
    title: "Yalıkavak Cliffside Private Estate",
    roomName: "Taş Duvarlı Şömine Odası",
    beforeImage:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function AiStagingStudioPage() {
  const [selectedPropId, setSelectedPropId] = useState(PROPERTY_OPTIONS[0].id);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const selectedProperty =
    PROPERTY_OPTIONS.find((p) => p.id === selectedPropId) || PROPERTY_OPTIONS[0];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-widest text-purple-400 uppercase">
              ControlNet &amp; Generative Interior AI
            </span>
            <Badge variant="staged" className="text-[10px]">
              isStaged · 1:1 Ölçekli
            </Badge>
          </div>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>AI Virtual Staging Studio</span>
            <Sparkles className="h-6 w-6 text-purple-400" />
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Boş teslim edilecek odaları saniyeler içinde seçkin tasarım konseptleriyle mobilyalandırın, Cloudinary&apos;e yükleyin ve Before/After vitrinini yayınlayın.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2 self-start sm:self-auto">
          <Building2 className="h-4 w-4 text-gold-400 shrink-0" />
          <select
            value={selectedPropId}
            onChange={(e) => setSelectedPropId(e.target.value)}
            className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer"
          >
            {PROPERTY_OPTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {uploadNotice && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{uploadNotice}</span>
          </span>
          <button onClick={() => setUploadNotice(null)} className="hover:underline">
            Kapat
          </button>
        </div>
      )}

      {/* Live AI Virtual Staging Render & Before/After Slider */}
      <VirtualStagingSlider
        propertyId={selectedProperty.id}
        roomName={selectedProperty.roomName}
        beforeImage={selectedProperty.beforeImage}
      />

      {/* Multi-Media Cloudinary Uploader connected to Prisma Media */}
      <div className="pt-4">
        <MediaUploader
          propertyId={selectedProperty.id}
          onUploadComplete={async (items) => {
            const res = await savePropertyMedia(
              selectedProperty.id,
              items.map((it) => ({
                url: it.url,
                type: it.type,
                roomLabel: it.roomLabel,
                isStaged: it.isStaged,
                sortOrder: it.sortOrder,
              }))
            );
            setUploadNotice(
              res.success
                ? `✨ ${items.length} medya öğesi Cloudinary ve Prisma Media tablosuna başarıyla kaydedildi.`
                : `Medya yerelde işlendi (${res.error || "Demo modu"}).`
            );
          }}
        />
      </div>
    </div>
  );
}

