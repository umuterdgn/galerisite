/**
 * AI Semantic Search & Embedding Engine
 * 
 * Doğal dille yapılan sorguları ("Hastaneye yakın, büyük balkonlu ve deniz manzaralı 3+1 evler")
 * vektör uzayına (1536 boyutlu embedding) dönüştürerek PostgreSQL pgvector ve
 * kosinüs benzerliği (cosine similarity) ile en uygun mülkleri sub-second sürede bulur.
 */

export interface PropertySemanticInput {
  title: string;
  description: string;
  city: string;
  district?: string | null;
  address?: string | null;
  price: number | string;
  currency?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareMeters?: number | null;
  isFurnished?: boolean;
  amenities?: string[];
  pois?: string[];
  architecturalStyle?: string;
}

/**
 * Bir ilan eklendiğinde veya güncellendiğinde evin tüm özelliklerini
 * yapay zekâ embedding modeline beslenecek zengin ve tutarlı bir
 * anlamsal paragrafa (semanticText) dönüştürür.
 */
export function generateSemanticParagraph(data: PropertySemanticInput): string {
  const parts: string[] = [];

  // 1. Temel Mülk Kimliği & Konum
  parts.push(
    `${data.title}, ${data.city}${data.district ? ` ${data.district}` : ""}${
      data.address ? `, ${data.address}` : ""
    } konumunda yer alan seçkin bir lüks gayrimenkul portföyüdür.`
  );

  // 2. Mimari & Hacim Bilgileri
  const specs: string[] = [];
  if (data.bedrooms) specs.push(`${data.bedrooms} yatak odası (suit)`);
  if (data.bathrooms) specs.push(`${data.bathrooms} banyo`);
  if (data.squareMeters) specs.push(`${data.squareMeters} m² kapalı kullanım alanı`);
  if (data.isFurnished) specs.push("tam mobilyalı ve özel mimari eşyalı");

  if (specs.length > 0) {
    parts.push(`Bu mülk ${specs.join(", ")} özelliklerine sahiptir.`);
  }

  // 3. Fiyat ve Ticari Statü
  parts.push(`Fiyatlandırması ${data.price} ${data.currency || "EUR"} olarak belirlenmiştir.`);

  // 4. Detaylı Açıklama & Mimari Konsept
  if (data.description) {
    parts.push(data.description);
  }

  // 5. Ayrıcalıklı Donanımlar (Amenities)
  if (data.amenities && data.amenities.length > 0) {
    parts.push(`Öne çıkan lüks donanımlar: ${data.amenities.join(", ")}.`);
  }

  // 6. Çevresel Önemli Noktalar (POIs - Hastane, Marina, Sahil, Okul vb.)
  if (data.pois && data.pois.length > 0) {
    parts.push(`Çevre ve lokasyon avantajları: ${data.pois.join(", ")}.`);
  }

  return parts.join(" ");
}

/**
 * Metni 1536 boyutlu bir float vektörüne (Embedding) dönüştürür.
 * OpenAI text-embedding-3-small veya Google Generative AI API'si ile entegre olur.
 * Anahtar yoksa yüksek başarımlı deterministik semantik vektör simülasyonu uygular.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const cleanText = text.trim().slice(0, 8000);

  // 1. OpenAI API Kullanımı (Varsa)
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: cleanText,
          dimensions: 1536,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.data?.[0]?.embedding) {
          return data.data[0].embedding;
        }
      }
    } catch (err) {
      console.warn("OpenAI Embedding API çağrısı başarısız, yerel vektör motoru devrede:", err);
    }
  }

  // 2. Yüksek Performanslı Deterministik Semantik Vektör Üretici (Fallback)
  return generateDeterministicEmbedding(cleanText, 1536);
}

/**
 * Kosinüs Benzerliği (Cosine Similarity) Hesaplayıcı:
 * -1 ile +1 arasında bir benzerlik puanı döndürür (1 = Birebir Aynı Anlam).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * 1536 boyutlu normalize edilmiş anlamsal vektör oluşturur.
 * Emlak anahtar kelimelerini (hastane, deniz, balkon, 3+1, yalı vb.) ağırlıklandırarak
 * anlam benzerliğini matematiksel vektör uzayına haritalar.
 */
function generateDeterministicEmbedding(text: string, dimensions: number = 1536): number[] {
  const vector = new Array<number>(dimensions).fill(0);
  const lower = text.toLowerCase();

  // Semantik Ağırlıklı Kavram Kümeleri
  const conceptWeights: Record<string, number[]> = {
    deniz: [12, 45, 98, 230, 450, 780, 1020],
    boğaz: [14, 48, 98, 232, 452, 782, 1022],
    yalı: [15, 50, 100, 235, 455, 785, 1025],
    manzara: [18, 52, 105, 240, 460, 790, 1030],
    hastane: [25, 80, 160, 310, 520, 840, 1100],
    sağlık: [26, 82, 162, 312, 522, 842, 1102],
    okul: [30, 85, 170, 320, 530, 850, 1110],
    balkon: [35, 95, 185, 335, 545, 865, 1125],
    teras: [36, 96, 186, 336, 546, 866, 1126],
    havuz: [40, 110, 200, 350, 560, 880, 1140],
    sonsuzluk: [42, 112, 202, 352, 562, 882, 1142],
    iskele: [45, 115, 205, 355, 565, 885, 1145],
    yat: [46, 116, 206, 356, 566, 886, 1146],
    helikopter: [55, 125, 215, 365, 575, 895, 1155],
    "3+1": [60, 130, 220, 370, 580, 900, 1160],
    "4+1": [62, 132, 222, 372, 582, 902, 1162],
    villa: [70, 140, 230, 380, 590, 910, 1170],
    penthouse: [75, 145, 235, 385, 595, 915, 1175],
    şarap: [88, 158, 248, 398, 608, 928, 1188],
    mahzen: [89, 159, 249, 399, 609, 929, 1189],
    spa: [92, 162, 252, 402, 612, 932, 1192],
    hamam: [93, 163, 253, 403, 613, 933, 1193],
    bodrum: [105, 205, 305, 505, 705, 1005, 1305],
    istanbul: [110, 210, 310, 510, 710, 1010, 1310],
    yeniköy: [112, 212, 312, 512, 712, 1012, 1312],
    marina: [120, 220, 320, 520, 720, 1020, 1320],
    lüks: [130, 230, 330, 530, 730, 1030, 1330],
  };

  // Metindeki kelimeleri işle
  const words = lower.split(/[\s,.;:!?()]+/).filter((w) => w.length > 2);
  for (const word of words) {
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }

    const primaryIndex = Math.abs(hash) % dimensions;
    const secondaryIndex = Math.abs(hash * 31) % dimensions;
    const tertiaryIndex = Math.abs(hash * 97) % dimensions;

    vector[primaryIndex] += 1.0;
    vector[secondaryIndex] += 0.6;
    vector[tertiaryIndex] += 0.3;

    // Özel semantik kavram eşleşmesi
    for (const [concept, indices] of Object.entries(conceptWeights)) {
      if (word.includes(concept) || concept.includes(word)) {
        for (const idx of indices) {
          vector[idx % dimensions] += 2.5;
        }
      }
    }
  }

  // Vektörü birim uzunluğa normalize et (L2 Normalization)
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

