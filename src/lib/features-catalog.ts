export type PlatformFeatureSlug =
  | "virtual-tour"
  | "geo-explore"
  | "ai-staging"
  | "off-market"
  | "multi-tenant";

export interface PlatformFeatureSpec {
  slug: PlatformFeatureSlug;
  href: `/features/${PlatformFeatureSlug}`;
  iconName: "compass" | "map" | "sparkles" | "shield" | "layers";
  title: string;
  shortDesc: string;
  badge: string;
  heroTitle: string;
  heroDescription: string;
  highlights: {
    title: string;
    detail: string;
  }[];
  metrics: {
    label: string;
    value: string;
  }[];
  adminHref: string;
  adminCtaLabel: string;
}

export const PLATFORM_FEATURES: PlatformFeatureSpec[] = [
  {
    slug: "virtual-tour",
    href: "/features/virtual-tour",
    iconName: "compass",
    title: "360° Sanal Tur & VR",
    shortDesc: "2:1 Equirectangular & 6 yönlü Cubemap sanal mekân deneyimi",
    badge: "İnteraktif VR & Tour Builder",
    heroTitle: "Fotorealistik 360° Sanal Tur Deneyimi",
    heroDescription:
      "Tek çekim 360° küresel kameralardan veya 6 yönlü sabit çekimlerden (Cubemap) tarayıcı içinde akıcı, hotspot bilgi noktalarıyla zenginleştirilmiş sanal mülk turları oluşturun.",
    highlights: [
      {
        title: "Çift Motor Desteği (Equirectangular & Cubemap)",
        detail:
          "Cloudinary 2:1 panoramik çekimlerin yanı sıra Three.js CubeTextureLoader ile 6 ayrı cepheden sanal oda inşa eder.",
      },
      {
        title: "X, Y, Z Koordinatlı Hotspot & Oda Geçişleri",
        detail:
          "Mülk içindeki özel mermer, manzara veya teknik detaylara tıklanabilir bilgi pencereleri ve odalar arası geçiş okları ekler.",
      },
      {
        title: "Jiroskop & VR Gözlük Uyumluluğu",
        detail:
          "Masaüstü, mobil jiroskop ve stereoskopik VR modlarıyla uluslararası yatırımcılara yerinde keşif hissi sunar.",
      },
    ],
    metrics: [
      { label: "Görüntüleme Desteği", value: "360° & 6-Yön Cubemap" },
      { label: "Ortalama Etkileşim", value: "+340% İnceleme Süresi" },
      { label: "Vitrinde Yayınlama", value: "Tek Tık Canlı Senkron" },
    ],
    adminHref: "/admin/dashboard/tour-builder",
    adminCtaLabel: "360° Tour Builder'ı Aç",
  },
  {
    slug: "geo-explore",
    href: "/features/geo-explore",
    iconName: "map",
    title: "GEO Keşif & Harita",
    shortDesc: "Küresel Mapbox portföy haritası & VIP lokasyon zekâsı",
    badge: "Küresel Lokasyon Zekâsı",
    heroTitle: "Harita Üzerinden Akıllı GEO Portföy Keşfi",
    heroDescription:
      "Boğaz hattından Akdeniz kıyılarına ve Dubai Palm Jumeirah'a kadar tüm portföyü yüksek kontrastlı Mapbox katmanları, marina ve özel havacılık noktalarıyla analiz edin.",
    highlights: [
      {
        title: "İnteraktif Altın & Gece Mavisi Harita Pinleri",
        detail:
          "Fiyat önizlemesi, 360° tur rozeti ve zengin vitrin kartı popuplarıyla portföyü lokasyon bazında hızla süzün.",
      },
      {
        title: "AI GEO & Yerel Otorite Optimizasyonu",
        detail:
          "Bölge mikrolokasyon verilerini JSON-LD Schema.org formatıyla yapılandırarak semantik ve yapay zeka arama motorlarında öne çıkın.",
      },
      {
        title: "Dinamik Destinasyon Odağı",
        detail:
          "İstanbul, Bodrum, Cap d'Antibes veya Dubai arasında tek tıkla akıcı harita kamera geçişleri gerçekleştirin.",
      },
    ],
    metrics: [
      { label: "Harita Motoru", value: "Mapbox GL Vector" },
      { label: "Destinasyon Kapsamı", value: "Küresel Çoklu Bölge" },
      { label: "Veri Kaynağı", value: "Canlı Prisma PostgreSQL" },
    ],
    adminHref: "/admin/dashboard/seo-optimizer",
    adminCtaLabel: "GEO & SEO Optimize Ediciyi Aç",
  },
  {
    slug: "ai-staging",
    href: "/features/ai-staging",
    iconName: "sparkles",
    title: "AI Virtual Staging",
    shortDesc: "Boş mekânları yapay zekâ ile anında lüks iç tasarıma dönüştürün",
    badge: "Yapay Zekâ İç Mimari Stüdyosu",
    heroTitle: "AI Destekli Sanal Sahneleme & Öncesi/Sonrası",
    heroDescription:
      "İnşaat halindeki veya boş mülklerin fotoğraflarını İtalyan minimalist, neoklasik veya penthouse konseptleriyle saniyeler içinde fotorealistik vitrin görsellerine dönüştürün.",
    highlights: [
      {
        title: "Çoklu Lüks Konsept Profilleri",
        detail:
          "Modern Minimalist, Lüks Neoklasik ve Boğaz / Riviera esintili özel mobilya, aydınlatma ve doku paletleri seçin.",
      },
      {
        title: "İnteraktif Öncesi / Sonrası Karşılaştırma Slider'ı",
        detail:
          "Müşterilerin mekânın çıplak mimarisini ve AI tasarlanmış halini gerçek zamanlı sürgü ile kıyaslamasını sağlayın.",
      },
      {
        title: "Yüksek Satış & Kiralama Dönüşümü",
        detail:
          "Fiziksel dekorasyon maliyeti ve haftalar süren kurulum beklemeden ilanı ilk günden en yüksek estetikle yayınlayın.",
      },
    ],
    metrics: [
      { label: "Sahneleme Hızı", value: "< 15 Saniye" },
      { label: "Maliyet Tasarrufu", value: "%95 Fiziksel Tasarruf" },
      { label: "Çözünürlük", value: "4K Vitrin Kalitesi" },
    ],
    adminHref: "/admin/dashboard/ai-staging",
    adminCtaLabel: "AI Staging Studio'yu Aç",
  },
  {
    slug: "off-market",
    href: "/features/off-market",
    iconName: "shield",
    title: "Off-Market Mahremiyet",
    shortDesc: "NDA korumalı kapalı portföy & aile ofisi dağıtım ağı",
    badge: "VIP Gizlilik & Akredite Erişim",
    heroTitle: "Gizli (Off-Market) Dağıtım ve Mahremiyet Altyapısı",
    heroDescription:
      "Halka açık mecralarda listelenmek istenmeyen tarihi yalıları, özel adaları ve malikâneleri yalnızca akredite brokerlar ile doğrulanmış Family Office portföylerine sunun.",
    highlights: [
      {
        title: "Rol Bazlı Yetkilendirme & Oturum Denetimi",
        detail:
          "SUPERADMIN, AGENCY_OWNER ve AGENT rolleriyle her tenant ve danışmanın yalnızca yetkili olduğu portföye erişmesini garanti eder.",
      },
      {
        title: "Şifreli Randevu ve Fiziksel/Online Tur Onayı",
        detail:
          "Müşteri talepleri PENDING statüsünde ajans takvimine düşer; broker onayıyla SMS/E-posta bildirim akışı tetiklenir.",
      },
      {
        title: "Seçici Vitrin Yayın Kontrolü",
        detail:
          "Mülkleri DRAFT, OFF_MARKET, FOR_SALE veya FOR_RENT statüleriyle anında yönetip Next.js önbelleğini tek tuşla güncelleyin.",
      },
    ],
    metrics: [
      { label: "Erişim Modeli", value: "NDA & Doğrulanmış RBAC" },
      { label: "Randevu Akışı", value: "Canlı Takvim Onaylı" },
      { label: "Statü Kontrolü", value: "OFF_MARKET / VIP" },
    ],
    adminHref: "/admin/dashboard/appointments",
    adminCtaLabel: "VIP Randevu Takvimini Aç",
  },
  {
    slug: "multi-tenant",
    href: "/features/multi-tenant",
    iconName: "layers",
    title: "Multi-Tenant Mimari",
    shortDesc: "Ajansa özel subdomain, kurumsal tema & ekip yönetimi",
    badge: "Kurumsal B2B SaaS Ekosistemi",
    heroTitle: "Multi-Tenant Ajans & Beyaz Etiket Mimarisi",
    heroDescription:
      "Tek bir merkezî altyapı üzerinde her lüks emlak ajansına izole edilmiş veritabanı ilişkileri, özel alt alan adı (slug), ekip yetkilendirmesi ve özelleştirilebilir marka kimliği sunun.",
    highlights: [
      {
        title: "Super Admin Tenant Provisioning",
        detail:
          "Prisma Transaction altyapısıyla yeni ajans kaydı ve ajans sahibi hesabı tek atomik işlemde otomatik olarak oluşturulur.",
      },
      {
        title: "Kişiselleştirilebilir Ajans Tema ve Logosu",
        detail:
          "Her tenant kendi kurumsal gold/obsidian renk vurgusunu, logosunu ve broker kadrosunu bağımsız olarak yönetir.",
      },
      {
        title: "PostgreSQL + pgvector Semantik Altyapı",
        detail:
          "Doğal dil emlak sorgularını vektör benzerliği ve canlı veritabanı filtreleriyle birleştirerek saniyeler içinde eşleştirir.",
      },
    ],
    metrics: [
      { label: "Veri İzolasyonu", value: "Tenant ID Bazlı RBAC" },
      { label: "Onboarding", value: "Atomik Prisma Transaction" },
      { label: "Arama Motoru", value: "pgvector Semantik AI" },
    ],
    adminHref: "/admin/dashboard/settings",
    adminCtaLabel: "Ajans Ayarlarını Aç",
  },
];

export function getFeatureBySlug(
  slug: string
): PlatformFeatureSpec | undefined {
  return PLATFORM_FEATURES.find((item) => item.slug === slug);
}

