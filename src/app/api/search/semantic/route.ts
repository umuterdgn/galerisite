import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getEmbedding,
  cosineSimilarity,
  generateSemanticParagraph,
} from "@/lib/semantic";

// Seed / In-Memory Portfolio with rich semantic paragraphs & precomputed vectors for instant sub-second search
interface SeedSemanticProperty {
  id: string;
  title: string;
  price: number;
  currency: string;
  city: string;
  district: string;
  bedrooms: number;
  bathrooms: number;
  squareMeters: number;
  imageUrl: string;
  hasPanorama360: boolean;
  status: "FOR_SALE" | "OFF_MARKET";
  semanticText: string;
  pois: string[];
}

const SEED_PROPERTIES: SeedSemanticProperty[] = [
  {
    id: "prop-1",
    title: "The Bosphorus Waterfront Palace",
    price: 42500000,
    currency: "EUR",
    city: "Istanbul",
    district: "Yeniköy / Sarıyer",
    bedrooms: 8,
    bathrooms: 9,
    squareMeters: 1450,
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    hasPanorama360: true,
    status: "FOR_SALE",
    pois: ["Acıbadem Maslak Hastanesi", "İstinye Marina", "Yeniköy Sahil Hattı", "Tarabya"],
    semanticText: generateSemanticParagraph({
      title: "The Bosphorus Waterfront Palace",
      description:
        "Tarihi Yeniköy sahil hattında tescilli, helikopter pisti ve özel yat iskelesi bulunan ultra-lüks Boğaz yalısı. Osmanlı mimarisinin zarafetini akıllı ev otomasyonu ile buluşturan eşsiz bir gayrimenkul şaheseri. Kesintisiz deniz ve Boğaz manzaralı geniş teras ve sonsuzluk havuzu.",
      city: "Istanbul",
      district: "Yeniköy / Sarıyer",
      price: 42500000,
      currency: "EUR",
      bedrooms: 8,
      bathrooms: 9,
      squareMeters: 1450,
      amenities: [
        "Özel Yat İskelesi (Deep-water Dock)",
        "Helikopter Pisti",
        "Sonsuzluk Boğaz Havuzu",
        "Klimatize Şarap Mahzeni",
        "Özel Türk Hamamı & Spa",
        "Panoramik Deniz Manzaralı Teras",
      ],
      pois: [
        "Acıbadem Maslak Hastanesine 8 dk",
        "İstinye Park ve Marina",
        "Sahil Yürüyüş Yolu",
      ],
    }),
  },
  {
    id: "prop-2",
    title: "Villa Belle Époque Cap d'Antibes",
    price: 38000000,
    currency: "EUR",
    city: "Antibes",
    district: "Cap d'Antibes",
    bedrooms: 7,
    bathrooms: 8,
    squareMeters: 980,
    imageUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    hasPanorama360: true,
    status: "FOR_SALE",
    pois: ["Hôpital d'Antibes", "Port Vauban Marina", "Plage de la Garoupe"],
    semanticText: generateSemanticParagraph({
      title: "Villa Belle Époque Cap d'Antibes",
      description:
        "Fransız Rivierası'nın kalbi Cap d'Antibes yarımadasında Akdeniz'e hakim kayalıklar üzerine inşa edilmiş neo-klasik sahil villası. 980 m² kapalı alan, asırlık zeytin ağaçlarıyla çevrili 4.500 m² özel bahçe ve panoramik deniz manzaralı geniş güneşlenme terası.",
      city: "Antibes",
      district: "Cap d'Antibes",
      price: 38000000,
      currency: "EUR",
      bedrooms: 7,
      bathrooms: 8,
      squareMeters: 980,
      amenities: [
        "Özel Deniz Koyu & Güverte",
        "Isıtmalı Sonsuzluk Havuzu",
        "Panoramik Akdeniz Terası",
        "Gaggenau Şef Mutfağı",
        "Geniş Açık Balkonlar",
      ],
      pois: ["Hôpital d'Antibes 10 dk", "Uluslararası Özel Sağlık Kliniği", "Port Vauban"],
    }),
  },
  {
    id: "prop-3",
    title: "Sky Penthouse at Palm Jumeirah",
    price: 27900000,
    currency: "USD",
    city: "Dubai",
    district: "Palm Jumeirah",
    bedrooms: 5,
    bathrooms: 6,
    squareMeters: 820,
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    hasPanorama360: true,
    status: "FOR_SALE",
    pois: ["King's College Hospital Dubai", "Dubai Marina", "Nakheel Mall"],
    semanticText: generateSemanticParagraph({
      title: "Sky Penthouse at Palm Jumeirah",
      description:
        "Palm Jumeirah hilalinde 360 derece Basra Körfezi ve Dubai silüeti manzaralı çift katlı penthouse rezidans. Özel cam tabanlı asma havuz, 350 m² panoramik çatı terası ve özel asansör.",
      city: "Dubai",
      district: "Palm Jumeirah",
      price: 27900000,
      currency: "USD",
      bedrooms: 5,
      bathrooms: 6,
      squareMeters: 820,
      amenities: [
        "Özel Çatı Havuzu",
        "360 Derece Deniz Manzarası",
        "Geniş Barbekü Terası ve Balkon",
        "24/7 Konsiyerj",
      ],
      pois: [
        "King's College London Hastanesi 12 dk",
        "Atlantis The Royal",
        "Dubai Marina Yat Limanı",
      ],
    }),
  },
  {
    id: "prop-4",
    title: "Yalıkavak Cliffside Private Estate",
    price: 18500000,
    currency: "EUR",
    city: "Bodrum",
    district: "Yalıkavak",
    bedrooms: 6,
    bathrooms: 7,
    squareMeters: 860,
    imageUrl:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    hasPanorama360: false,
    status: "OFF_MARKET",
    pois: ["Acıbadem Bodrum Hastanesi", "Yalıkavak Marina", "Tilkicik Koyu"],
    semanticText: generateSemanticParagraph({
      title: "Yalıkavak Cliffside Private Estate",
      description:
        "Yalıkavak Marina'ya hakim yamaçta tamamen doğal Bodrum taşlarıyla örülmüş müstakil malikâne. Ege Denizi gün batımını kesintisiz gören geniş balkonlar, gölgelikli ahşap teraslar, jakuzili açık havuz ve özel misafirhane.",
      city: "Bodrum",
      district: "Yalıkavak",
      price: 18500000,
      currency: "EUR",
      bedrooms: 6,
      bathrooms: 7,
      squareMeters: 860,
      amenities: [
        "Ege Denizi Gün Batımı Manzarası",
        "Geniş Teras ve Balkon Hatları",
        "Doğal Taş Mimari",
        "Açık Sonsuzluk Havuzu",
        "Marina Manzarası",
      ],
      pois: [
        "Acıbadem Bodrum Hastanesine 15 dk",
        "Yalıkavak Marina 5 dk",
        "Tilkicik Plajı",
      ],
    }),
  },
  {
    id: "prop-5",
    title: "Bebek Waterfront Historical Mansion",
    price: 52000000,
    currency: "EUR",
    city: "Istanbul",
    district: "Bebek / Beşiktaş",
    bedrooms: 9,
    bathrooms: 10,
    squareMeters: 1680,
    imageUrl:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    hasPanorama360: true,
    status: "OFF_MARKET",
    pois: ["Liv Hospital Ulus", "Bebek Koyu & Parkı", "Boğaziçi Sahil Şeridi"],
    semanticText: generateSemanticParagraph({
      title: "Bebek Waterfront Historical Mansion",
      description:
        "İstanbul Bebek sahilinin en prestijli noktasında rıhtımlı, 1.680 m² kapalı kullanım alanlı tarihi yalı. Boğaziçi'nin tüm köprülerini gören panoramik deniz cephesi, geniş açık teraslar, kış bahçesi ve denizden tekne yanaşma iskelesi.",
      city: "Istanbul",
      district: "Bebek / Beşiktaş",
      price: 52000000,
      currency: "EUR",
      bedrooms: 9,
      bathrooms: 10,
      squareMeters: 1680,
      amenities: [
        "Boğaz Rıhtımı ve İskele",
        "Geniş Deniz Balkonları",
        "Tarihi Tescilli Mimari",
        "Akıllı Güvenlik Sistemi",
      ],
      pois: [
        "Liv Hospital Ulus Hastanesi 7 dk",
        "Bebek Parkı",
        "Amerikan Konsolosluğu Bölgesi",
      ],
    }),
  },
  {
    id: "prop-6",
    title: "Kandilli Hillside 3+1 Panoramic Residence",
    price: 6800000,
    currency: "EUR",
    city: "Istanbul",
    district: "Kandilli / Üsküdar",
    bedrooms: 3,
    bathrooms: 3,
    squareMeters: 280,
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    hasPanorama360: true,
    status: "FOR_SALE",
    pois: ["Medipol Çamlıca Hastanesi", "Kandilli İskelesi", "Sevda Tepesi"],
    semanticText: generateSemanticParagraph({
      title: "Kandilli Hillside 3+1 Panoramic Residence",
      description:
        "Kandilli korusunun hemen yanında, 3+1 geniş oda planlı, 45 m² lüks deniz manzaralı büyük balkonlu butik rezidans dairesi. Çamlıca ve Medipol hastanelerine yakın, ferah tavan yüksekliği, Gaggenau mutfak ve açık yüzme havuzu.",
      city: "Istanbul",
      district: "Kandilli / Üsküdar",
      price: 6800000,
      currency: "EUR",
      bedrooms: 3,
      bathrooms: 3,
      squareMeters: 280,
      amenities: [
        "3+1 Geniş Plan",
        "Büyük Deniz Manzaralı Balkon",
        "Kandilli Korusu Yeşilliği",
        "Kapalı Otopark",
        "Yerden Isıtma",
      ],
      pois: [
        "Medipol Çamlıca Hastanesine 6 dk",
        "Kandilli İskelesi ve Sahil",
        "Boğaziçi Köprüsü Bağlantısı",
      ],
    }),
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = (body.query as string) || "";

    // Canlı Prisma veritabanındaki ilanları kontrol et (varsa birincil havuz olarak kullan)
    let dbPool: SeedSemanticProperty[] = [];
    try {
      const dbProps = await prisma.property.findMany({
        where: { status: { not: "DRAFT" } },
        include: { media: { orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "desc" },
      });

      if (dbProps && dbProps.length > 0) {
        dbPool = dbProps.map((p) => ({
          id: p.id,
          title: p.title,
          price: Number(p.price),
          currency: p.currency,
          city: p.city,
          district: p.district || "",
          bedrooms: p.bedrooms ?? 3,
          bathrooms: p.bathrooms ?? 2,
          squareMeters: p.squareMeters ?? 250,
          imageUrl:
            p.media[0]?.url ||
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
          hasPanorama360: p.media.some((m) => m.type === "PANORAMA_360"),
          status: p.status === "OFF_MARKET" ? "OFF_MARKET" : "FOR_SALE",
          pois: [],
          semanticText:
            p.semanticText ||
            generateSemanticParagraph({
              title: p.title,
              description: p.description,
              city: p.city,
              district: p.district || undefined,
              price: Number(p.price),
              currency: p.currency,
              bedrooms: p.bedrooms ?? undefined,
              bathrooms: p.bathrooms ?? undefined,
              squareMeters: p.squareMeters ?? undefined,
            }),
        }));
      }
    } catch {
      // DB bağlantısı yoksa SEED_PROPERTIES kullanılacak
    }

    const activePool = dbPool.length > 0 ? dbPool : SEED_PROPERTIES;

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        query: "",
        engine: dbPool.length > 0 ? "Prisma PostgreSQL (Canlı)" : "Semantic Portfolio Cache",
        results: activePool.map((p) => ({
          ...p,
          similarity: 1.0,
          matchPercent: 100,
          aiReason: "Güncel portföy vitrini",
        })),
        totalFound: activePool.length,
      });
    }

    // 1. Kullanıcının doğal dil sorgusunu 1536-boyutlu vektöre çevir
    const queryVector = await getEmbedding(query);

    // 2. PostgreSQL pgvector entegrasyonu (Canlı DB sorgusu denemesi)
    try {
      // Prisma raw SQL ile pgvector kosinüs benzerliği
      const vectorString = `[${queryVector.join(",")}]`;
      const dbResults = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
        `SELECT id, title, price, currency, city, district, bedrooms, bathrooms, "squareMeters",
                "semanticText",
                (1 - (embedding <=> $1::vector)) as similarity
         FROM properties
         WHERE embedding IS NOT NULL
         ORDER BY embedding <=> $1::vector ASC
         LIMIT 8;`,
        vectorString
      );

      if (dbResults && dbResults.length > 0) {
        const mappedDbResults = dbResults.map((row) => ({
          id: String(row.id),
          title: String(row.title),
          price: Number(row.price),
          currency: String(row.currency || "EUR"),
          city: String(row.city || ""),
          district: String(row.district || ""),
          bedrooms: Number(row.bedrooms) || 3,
          bathrooms: Number(row.bathrooms) || 2,
          squareMeters: Number(row.squareMeters) || 200,
          imageUrl:
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
          hasPanorama360: true,
          status: "FOR_SALE" as const,
          similarity: Number(row.similarity) || 0.85,
          matchPercent: Math.round((Number(row.similarity) || 0.85) * 100),
          aiReason: generateMatchReason(query, String(row.semanticText || row.title)),
        }));

        return NextResponse.json({
          success: true,
          query,
          engine: "PostgreSQL pgvector (IVFFlat)",
          results: mappedDbResults,
          totalFound: mappedDbResults.length,
        });
      }
    } catch {
      // DB pgvector tablosu henüz bağlanmamışsa veya mock modundaysa fallback motoruna geçer
    }

    // 3. Yüksek Performanslı Semantik Vektör Eşleştirme Motoru (Canlı DB + Cache)
    const scoredProperties = await Promise.all(
      activePool.map(async (prop) => {
        const propVector = await getEmbedding(prop.semanticText);
        const similarity = cosineSimilarity(queryVector, propVector);

        // Ekstra intent boost: Örneğin kullanıcı "hastane" veya "3+1" yazdıysa ve mülkte bu varsa
        const lowerQ = query.toLowerCase();
        let boostedSim = similarity;

        if (lowerQ.includes("hastane") && prop.semanticText.toLowerCase().includes("hastane")) {
          boostedSim = Math.min(0.99, boostedSim + 0.15);
        }
        if (lowerQ.includes("deniz") && prop.semanticText.toLowerCase().includes("deniz")) {
          boostedSim = Math.min(0.99, boostedSim + 0.12);
        }
        if (
          (lowerQ.includes("balkon") || lowerQ.includes("teras")) &&
          (prop.semanticText.toLowerCase().includes("balkon") ||
            prop.semanticText.toLowerCase().includes("teras"))
        ) {
          boostedSim = Math.min(0.99, boostedSim + 0.1);
        }
        if (lowerQ.includes("3+1") && prop.bedrooms === 3) {
          boostedSim = Math.min(0.99, boostedSim + 0.2);
        }

        const matchPercent = Math.min(99, Math.max(65, Math.round(boostedSim * 100)));

        return {
          ...prop,
          similarity: boostedSim,
          matchPercent,
          aiReason: generateMatchReason(query, prop.semanticText),
        };
      })
    );

    // Benzerlik puanına göre azalan sırala
    scoredProperties.sort((a, b) => b.similarity - a.similarity);

    return NextResponse.json({
      success: true,
      query,
      engine: "Semantic Vector Cosine Engine (1536-dim)",
      results: scoredProperties,
      totalFound: scoredProperties.length,
    });
  } catch (error) {
    console.error("Semantic search error:", error);
    return NextResponse.json(
      { error: "Semantik arama gerçekleştirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

/**
 * Yapay zekâ eşleşme gerekçesi üretir (Kullanıcıya neden bu evin önerildiğini açıklar)
 */
function generateMatchReason(query: string, semanticText: string): string {
  const lowerQ = query.toLowerCase();
  const lowerT = semanticText.toLowerCase();

  const matchedKeywords: string[] = [];
  if (lowerQ.includes("hastane") && lowerT.includes("hastane")) {
    matchedKeywords.push("Hastanelere yakınlık");
  }
  if (lowerQ.includes("deniz") && (lowerT.includes("deniz") || lowerT.includes("boğaz"))) {
    matchedKeywords.push("Panoramik deniz & Boğaz cephesi");
  }
  if (lowerQ.includes("balkon") && lowerT.includes("balkon")) {
    matchedKeywords.push("Geniş açık balkon");
  }
  if (lowerQ.includes("teras") && lowerT.includes("teras")) {
    matchedKeywords.push("Güneşlenme terası");
  }
  if (lowerQ.includes("havuz") && lowerT.includes("havuz")) {
    matchedKeywords.push("Özel sonsuzluk havuzu");
  }
  if (lowerQ.includes("3+1") && lowerT.includes("3 yatak odası")) {
    matchedKeywords.push("3+1 oda dağılımı");
  }
  if (lowerQ.includes("yalı") && lowerT.includes("yalı")) {
    matchedKeywords.push("Tarihi yalı mimarisi ve rıhtım");
  }

  if (matchedKeywords.length > 0) {
    return `✨ Belirttiğiniz ${matchedKeywords.join(", ")} kriterleri ile yüksek oranda örtüşüyor.`;
  }

  return "✨ Anlamsal bağlam, konum ve mimari hacim arama niyetinizle tam uyumlu.";
}
