import { NextRequest, NextResponse } from "next/server";

export interface MarketingInsight {
  id: string;
  propertyId: string;
  propertyTitle: string;
  type: "TITLE_OPTIMIZATION" | "VIRTUAL_TOUR_MISSING" | "AI_STAGING" | "ROI_PROJECTION" | "PRICE_ADVICE";
  impact: "CRITICAL" | "HIGH" | "MEDIUM";
  potentialGain: string;
  title: string;
  recommendation: string;
  suggestedAction: string;
  actionLabel: string;
  actionUrl: string;
  badge: string;
}

const DEFAULT_INSIGHTS: MarketingInsight[] = [
  {
    id: "insight-1",
    propertyId: "prop-4",
    propertyTitle: "Yalıkavak Cliffside Private Estate",
    type: "TITLE_OPTIMIZATION",
    impact: "HIGH",
    potentialGain: "+%18 CTR",
    badge: "Arama Tıklama Mıknatısı",
    title: "Düşük Tıklama Oranı Tespit Edildi",
    recommendation:
      "Yalıkavak Cliffside ilanı son 7 günde aramalarda 1.420 kez gösterildi ancak tıklama oranı %2.1'de kaldı. Başlığı 'Bodrum Yalıkavak'ta Kapanmaz Deniz Manzaralı, Ultra Lüks 6+1 Villa' olarak güncellerseniz aramalarda %18 daha fazla doğrudan tıklama alabilirsiniz.",
    suggestedAction: "Başlığı Gemini SEO Başlığı ile güncelle",
    actionLabel: "Başlığı Optimize Et",
    actionUrl: "/admin/dashboard/seo-optimizer",
  },
  {
    id: "insight-2",
    propertyId: "prop-2",
    propertyTitle: "Villa Belle Époque - Cap d'Antibes",
    type: "VIRTUAL_TOUR_MISSING",
    impact: "CRITICAL",
    potentialGain: "+3.4x Etkileşim",
    badge: "360° VR Fırsatı",
    title: "360° Sanal Tur Eksikliği",
    recommendation:
      "Villa Belle Époque ilanında henüz 360° sanal tur bulunmuyor. İlana 360 panorama ve interaktif hotspotlar eklendiğinde yabancı aile ofislerinin sitede kalma süresi 3.4 kat artacak ve VIP randevu talepleri %35 yükselecektir.",
    suggestedAction: "360° Tour Builder ile panoramaları yükle",
    actionLabel: "Sanal Tur Oluştur",
    actionUrl: "/admin/dashboard/tour-builder",
  },
  {
    id: "insight-3",
    propertyId: "prop-3",
    propertyTitle: "Sky Penthouse at Palm Jumeirah",
    type: "AI_STAGING",
    impact: "HIGH",
    potentialGain: "+%40 İlgi Artışı",
    badge: "Virtual Staging",
    title: "Boş Salon Fotoğrafı Etkileşimi Düşürüyor",
    recommendation:
      "Dubai Penthouse'un 350 m² teras ve boş salon fotoğrafları yeterince sıcak bir izlenim vermiyor. AI Virtual Staging ile 'Modern Lüks' veya 'İskandinav' konseptinde sanal mobilyalandırma uygulayarak görsel dönüşümü %40 artırabilirsiniz.",
    suggestedAction: "AI Staging Studio ile salonu eşyalandır",
    actionLabel: "AI Staging Uygula",
    actionUrl: "/admin/dashboard/ai-staging",
  },
  {
    id: "insight-4",
    propertyId: "prop-1",
    propertyTitle: "The Bosphorus Waterfront Palace",
    type: "ROI_PROJECTION",
    impact: "MEDIUM",
    potentialGain: "+12 VIP Randevu",
    badge: "Yatırım Getirisi",
    title: "Körfez Yatırımcıları İçin ROI Vurgusu",
    recommendation:
      "Boğaz yalılarında amortisman süresi döviz bazında 22 yıl olarak hesaplanmaktadır. ROI Hesaplayıcı widget'ının detay sayfasında öne çıkarılması yabancı sermaye fonlarının ilgisini hızlandırmaktadır.",
    suggestedAction: "ROI ve Amortisman analizini öne çıkar",
    actionLabel: "İlan Detayını İncele",
    actionUrl: "/properties/prop-1",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");

  const geminiApiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_AI_KEY;

  if (geminiApiKey && propertyId) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

      const prompt = `
Sen lüks emlak ajansları için çalışan bir Kıdemli Büyüme ve Pazarlama Danışmanısın (AI Growth Advisor).
Aşağıdaki ilan için 2 adet somut, doğrudan aksiyon alınabilir pazarlama ve SEO tavsiyesi üret.
İlan ID: ${propertyId}

JSON formatında yanıt ver:
{
  "insights": [
    {
      "id": "gemini-1",
      "propertyId": "${propertyId}",
      "propertyTitle": "Seçilen İlan",
      "type": "TITLE_OPTIMIZATION",
      "impact": "HIGH",
      "potentialGain": "+%20 Tıklama",
      "badge": "AI Büyüme Önerisi",
      "title": "Arama Hacmi Yüksek Başlık Değişimi",
      "recommendation": "...",
      "suggestedAction": "...",
      "actionLabel": "Uygula",
      "actionUrl": "/admin/dashboard/seo-optimizer"
    }
  ]
}
`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed.insights && parsed.insights.length > 0) {
            return NextResponse.json({
              success: true,
              engine: "Google Gemini 1.5 Flash",
              insights: parsed.insights,
            });
          }
        }
      }
    } catch (err) {
      console.warn("Gemini marketing insights API fallback:", err);
    }
  }

  // Filter by property if requested
  const filtered = propertyId
    ? DEFAULT_INSIGHTS.filter((i) => i.propertyId === propertyId)
    : DEFAULT_INSIGHTS;

  return NextResponse.json({
    success: true,
    engine: "Lumière Real Estate Growth AI",
    insights: filtered.length > 0 ? filtered : DEFAULT_INSIGHTS,
  });
}

