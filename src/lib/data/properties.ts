export interface LuxuryProperty {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  price: number;
  currency: string;
  formattedPrice: string;
  propertyType: "MANSION" | "VILLA" | "PENTHOUSE" | "CHATEAU" | "ESTATE" | "PRIVATE_ISLAND";
  status: "AVAILABLE" | "OFF_MARKET" | "RESERVED";
  isExclusive: boolean;
  featured: boolean;
  
  // GEO & Location Data (Crucial for GEO / SEO)
  location: {
    address: string;
    neighborhood: string;
    city: string;
    country: string;
    countryCode: string;
    latitude: number;
    longitude: number;
    geoTag: string;
  };

  // Specifications
  specs: {
    bedrooms: number;
    bathrooms: number;
    livingArea: number; // m²
    plotSize: number;   // m²
    yearBuilt: number;
    parkingSpaces: number;
  };

  // Luxury Amenities
  amenities: string[];

  // Media
  images: string[];
  videoUrl?: string;
  virtualTourUrl?: string;

  // Agency & Broker (B2B Multi-tenancy)
  agency: {
    name: string;
    slug: string;
    logo: string;
    verified: boolean;
    phone: string;
    email: string;
  };
  agent: {
    name: string;
    title: string;
    avatar: string;
    phone: string;
    email: string;
  };
}

export const LUXURY_PROPERTIES: LuxuryProperty[] = [
  {
    id: "prop-bosphorus-palace",
    slug: "the-bosphorus-waterfront-palace",
    title: "The Bosphorus Waterfront Palace",
    tagline: "Tarihi Yeniköy Sahil Hattında Eşsiz Boğaz Yalısı",
    description:
      "İstanbul Boğazı'nın en prestijli sahil şeridi Yeniköy'de yer alan bu tarihi tescilli yalı, 1.450 m² kapalı kullanım alanı, özel yat iskelesi ve helikopter iniş sahası ile ayrıcalıklı bir yaşam sunuyor. Osmanlı mimarisinin zarafetini modern akıllı bina otomasyonu ile buluşturan mülk, 8 suit yatak odası, şarap mahzeni ve özel spa alanı ile donatılmıştır.",
    price: 42500000,
    currency: "EUR",
    formattedPrice: "€ 42.500.000",
    propertyType: "MANSION",
    status: "AVAILABLE",
    isExclusive: true,
    featured: true,
    location: {
      address: "Köybaşı Caddesi No: 84",
      neighborhood: "Yeniköy",
      city: "Istanbul",
      country: "Turkey",
      countryCode: "TR",
      latitude: 41.1218,
      longitude: 29.0712,
      geoTag: "Istanbul, Bosphorus, Turkey",
    },
    specs: {
      bedrooms: 8,
      bathrooms: 9,
      livingArea: 1450,
      plotSize: 2200,
      yearBuilt: 2021,
      parkingSpaces: 6,
    },
    amenities: [
      "Özel Yat İskelesi (Deep-water Dock)",
      "Helikopter Pisti (Helipad)",
      "Sonsuzluk Boğaz Havuzu",
      "Klimatize Şarap Kavı (1.500 Şişe)",
      "Özel Türk Hamamı & Spa",
      "24/7 Güvenlik & Çevre Sensörleri",
      "Müstakil Personel & Güvenlik Lojmanı",
      "Biyometrik Parmak İzi Erişim",
    ],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85",
    ],
    agency: {
      name: "Lumière Private Clients Istanbul",
      slug: "lumiere-istanbul",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80",
      verified: true,
      phone: "+90 212 999 0010",
      email: "private@lumiere-realty.com",
    },
    agent: {
      name: "Derin Soydan",
      title: "Senior Partner, Ultra-Luxury Portfolio",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80",
      phone: "+90 532 999 8877",
      email: "derin.soydan@lumiere-realty.com",
    },
  },
  {
    id: "prop-french-riviera",
    slug: "villa-belle-epoque-cap-dantibes",
    title: "Villa Belle Époque",
    tagline: "Panoramic Mediterranean Haven on Cap d'Antibes",
    description:
      "Fransız Rivierası'nın kalbi Cap d'Antibes yarımadasında, Akdeniz'e hakim kayalıklar üzerine inşa edilmiş neo-klasik sahil villası. 980 m² kapalı alan, asırlık zeytin ağaçlarıyla çevrili 4.500 m² özel peyzajlı bahçe, ısıtmalı tuzlu su sonsuzluk havuzu ve Cote d'Azur'un turkuaz sularına özel merdiven erişimi sunmaktadır.",
    price: 38000000,
    currency: "EUR",
    formattedPrice: "€ 38.000.000",
    propertyType: "VILLA",
    status: "AVAILABLE",
    isExclusive: true,
    featured: true,
    location: {
      address: "Boulevard de la Garoupe",
      neighborhood: "Cap d'Antibes",
      city: "Antibes",
      country: "France",
      countryCode: "FR",
      latitude: 43.5528,
      longitude: 7.1265,
      geoTag: "Cap d'Antibes, French Riviera, France",
    },
    specs: {
      bedrooms: 7,
      bathrooms: 8,
      livingArea: 980,
      plotSize: 4500,
      yearBuilt: 2019,
      parkingSpaces: 5,
    },
    amenities: [
      "Özel Deniz Koyu & Güverte",
      "Isıtmalı Sonsuzluk Havuzu",
      "Panoramik Akdeniz Terası",
      "Açık Hava Sineması & Şömine",
      "Özel Şef Mutfağı (Gaggenau Donanımlı)",
      "Kapalı Spor Salonu & Sauna",
      "Gelişmiş Alarm & Kamera Sistemi",
    ],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85",
    ],
    agency: {
      name: "Monaco & Riviera Prime Estates",
      slug: "riviera-prime",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80",
      verified: true,
      phone: "+33 4 93 00 11 22",
      email: "contact@rivieraprime.com",
    },
    agent: {
      name: "Jean-Philippe Moreau",
      title: "Managing Director Riviera",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80",
      phone: "+33 6 12 34 56 78",
      email: "jpmoreau@rivieraprime.com",
    },
  },
  {
    id: "prop-palm-jumeirah",
    slug: "sky-penthouse-palm-jumeirah",
    title: "Sky Penthouse at Palm Jumeirah",
    tagline: "Dubai Körfezi ve Siluet Manzaralı Üç Katlı Çatı Sarayı",
    description:
      "Dubai Palm Jumeirah'da yer alan bu tripleks penthouse, 820 m² kapalı alan ve 350 m² özel çatı terası ile lüksün sınırlarını zorluyor. Özel asansör, tavandan tabana 6 metrelik cam cepheler, terasta özel infinity havuz ve Burj Al Arab ile Dubai Marina'ya kesintisiz 360 derece bakış açısı sunmaktadır.",
    price: 27900000,
    currency: "USD",
    formattedPrice: "$ 27.900.000",
    propertyType: "PENTHOUSE",
    status: "AVAILABLE",
    isExclusive: true,
    featured: true,
    location: {
      address: "Crescent West, The Palm Jumeirah",
      neighborhood: "Palm Jumeirah",
      city: "Dubai",
      country: "United Arab Emirates",
      countryCode: "AE",
      latitude: 25.1124,
      longitude: 55.139,
      geoTag: "Palm Jumeirah, Dubai, UAE",
    },
    specs: {
      bedrooms: 5,
      bathrooms: 6,
      livingArea: 820,
      plotSize: 1170,
      yearBuilt: 2023,
      parkingSpaces: 4,
    },
    amenities: [
      "Özel Çatı Sonsuzluk Havuzu",
      "Doğrudan Daireye Çıkan Özel Asansör",
      "360 Derece Marina & Körfez Manzarası",
      "Özel İtalyan Mermer Kaplamalar",
      "Bang & Olufsen Akustik Sistemi",
      "Valet & Özel Konsiyerj Hizmeti (24/7)",
      "Özel Plaj ve Marina Kulübü Üyeliği",
    ],
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85",
    ],
    agency: {
      name: "Emirates Sovereign Realty",
      slug: "emirates-sovereign",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80",
      verified: true,
      phone: "+971 4 456 7890",
      email: "sovereign@emiratesrealty.ae",
    },
    agent: {
      name: "Tariq Al-Mansoor",
      title: "Senior VP Global Acquisitions",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
      phone: "+971 50 123 4567",
      email: "tariq@emiratesrealty.ae",
    },
  },
  {
    id: "prop-bodrum-yalikavak",
    slug: "yalikavak-cliffside-estate",
    title: "Yalıkavak Cliffside Private Estate",
    tagline: "Ege Denizi ve Yalıkavak Marina Manzaralı Modern Malikâne",
    description:
      "Bodrum Yalıkavak tepelerinde 3.800 m² müstakil arsa üzerinde konumlanan, ödüllü mimari imzalı malikâne. Ege'nin büyüleyici gün batımını karşılayan 65 metrelik özel sonsuzluk havuzu, misafir evi ve helikopter pisti ile tam bir mahremiyet sığınağıdır.",
    price: 18500000,
    currency: "EUR",
    formattedPrice: "€ 18.500.000",
    propertyType: "ESTATE",
    status: "OFF_MARKET",
    isExclusive: true,
    featured: false,
    location: {
      address: "Geriş Mevkii, Yalıkavak",
      neighborhood: "Yalıkavak",
      city: "Bodrum",
      country: "Turkey",
      countryCode: "TR",
      latitude: 37.1032,
      longitude: 27.2917,
      geoTag: "Bodrum, Mugla, Turkey",
    },
    specs: {
      bedrooms: 6,
      bathrooms: 7,
      livingArea: 860,
      plotSize: 3800,
      yearBuilt: 2022,
      parkingSpaces: 5,
    },
    amenities: [
      "65 Metre Doğal Taş Sonsuzluk Havuzu",
      "Tam Mahremiyet (Off-Market İlan)",
      "Müstakil 2 Yatak Odalı Misafir Evi",
      "Güneş Enerjisi & Su Arıtma Altyapısı",
      "Açık Hava Heykel Bahçesi",
      "Özel Taş Şömine & Şarap Mahzeni",
    ],
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1600&q=85",
    ],
    agency: {
      name: "Lumière Private Clients Istanbul",
      slug: "lumiere-istanbul",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80",
      verified: true,
      phone: "+90 212 999 0010",
      email: "private@lumiere-realty.com",
    },
    agent: {
      name: "Derin Soydan",
      title: "Senior Partner, Ultra-Luxury Portfolio",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80",
      phone: "+90 532 999 8877",
      email: "derin.soydan@lumiere-realty.com",
    },
  },
  {
    id: "prop-london-mayfair",
    slug: "the-grosvenor-townhouse-mayfair",
    title: "The Grosvenor Townhouse",
    tagline: "Grade II Listed Mayfair Heritage Residence",
    description:
      "Londra'nın en elit semti Mayfair'de Hyde Park'a adımlar uzaklıkta, 18. yüzyıldan günümüze özenle restore edilmiş 6 katlı tarihi konak. Özel mermer şömineler, hidrolik yolcu asansörü, alt katta kapalı yüzme havuzu ve çatı katı özel kış bahçesi ile Londra'nın kalbinde aristokratik bir ihtişam.",
    price: 32000000,
    currency: "GBP",
    formattedPrice: "£ 32.000.000",
    propertyType: "MANSION",
    status: "AVAILABLE",
    isExclusive: true,
    featured: true,
    location: {
      address: "Upper Grosvenor Street",
      neighborhood: "Mayfair",
      city: "London",
      country: "United Kingdom",
      countryCode: "GB",
      latitude: 51.5115,
      longitude: -0.1528,
      geoTag: "Mayfair, London, United Kingdom",
    },
    specs: {
      bedrooms: 6,
      bathrooms: 7,
      livingArea: 750,
      plotSize: 420,
      yearBuilt: 2020,
      parkingSpaces: 2,
    },
    amenities: [
      "Grade II Tarihi Miras Tescili",
      "Kapalı Isıtmalı Yüzme Havuzu & Spa",
      "Tüm Katlara Hizmet Veren Asansör",
      "Özel Çatı Terası & Kış Bahçesi",
      "Yeraltı Güvenli Garajı",
      "Akıllı Ev & Lutron Aydınlatma",
    ],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85",
    ],
    agency: {
      name: "Mayfair & Kensington Private Brokerage",
      slug: "mayfair-private",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80",
      verified: true,
      phone: "+44 20 7946 0990",
      email: "inquiries@mayfairprivate.co.uk",
    },
    agent: {
      name: "Arthur Pendelton",
      title: "Senior Partner London",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=240&q=80",
      phone: "+44 7700 900123",
      email: "arthur@mayfairprivate.co.uk",
    },
  },
];

export async function getProperties(filter?: {
  city?: string;
  country?: string;
  propertyType?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
}): Promise<LuxuryProperty[]> {
  let results = [...LUXURY_PROPERTIES];

  if (!filter) return results;

  if (filter.city) {
    results = results.filter(
      (p) => p.location.city.toLowerCase() === filter.city?.toLowerCase()
    );
  }
  if (filter.country) {
    results = results.filter(
      (p) => p.location.country.toLowerCase() === filter.country?.toLowerCase()
    );
  }
  if (filter.propertyType && filter.propertyType !== "ALL") {
    results = results.filter((p) => p.propertyType === filter.propertyType);
  }
  if (filter.status && filter.status !== "ALL") {
    results = results.filter((p) => p.status === filter.status);
  }
  if (filter.minPrice) {
    results = results.filter((p) => p.price >= (filter.minPrice || 0));
  }
  if (filter.maxPrice) {
    results = results.filter((p) => p.price <= (filter.maxPrice || Infinity));
  }
  if (filter.featuredOnly) {
    results = results.filter((p) => p.featured);
  }

  return results;
}

export async function getPropertyBySlug(
  slug: string
): Promise<LuxuryProperty | null> {
  return LUXURY_PROPERTIES.find((p) => p.slug === slug) ?? null;
}

export async function getUniqueCities(): Promise<string[]> {
  return Array.from(new Set(LUXURY_PROPERTIES.map((p) => p.location.city)));
}

