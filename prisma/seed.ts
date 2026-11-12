import {
  PrismaClient,
  Role,
  PropertyStatus,
  MediaType,
  AppointmentStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Lumière Estates Prisma Seed işlemi başlatılıyor...");

  // 1. Çakışmaları önlemek için mevcut verileri bağımlılık sırasına göre temizle
  await prisma.appointment.deleteMany();
  await prisma.media.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();

  console.log("🧹 Mevcut veritabanı kayıtları temizlendi.");

  // 2. Ajans Oluştur (Tenant)
  const agency = await prisma.agency.create({
    data: {
      name: "Lumière Estates",
      slug: "lumiere",
      themeColor: "#D4AF37",
      logoUrl:
        "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80",
      isActive: true,
    },
  });

  console.log(`✅ Ajans oluşturuldu: ${agency.name} (slug: ${agency.slug})`);

  // 3. Kullanıcıları Oluştur (Tüm şifreler bcrypt ile '123456')
  const passwordHash = await bcrypt.hash("123456", 12);

  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@lumiere.com",
      passwordHash,
      fullName: "Kaan Demir (Super Admin)",
      role: Role.SUPERADMIN,
      language: "tr",
      themePref: "dark",
      agencyId: agency.id,
    },
  });

  const agencyOwner = await prisma.user.create({
    data: {
      email: "owner@lumiere.com",
      passwordHash,
      fullName: "Selin Aksoy (Ajans Sahibi)",
      role: Role.AGENCY_OWNER,
      language: "tr",
      themePref: "dark",
      agencyId: agency.id,
    },
  });

  const agent = await prisma.user.create({
    data: {
      email: "agent@lumiere.com",
      passwordHash,
      fullName: "Derin Soydan (Portföy Direktörü)",
      role: Role.AGENT,
      language: "tr",
      themePref: "dark",
      agencyId: agency.id,
    },
  });

  console.log(
    `✅ Kullanıcılar oluşturuldu: ${superAdmin.email}, ${agencyOwner.email}, ${agent.email}`
  );

  // 4. İlanları ve İlişkili Medyaları Oluştur (Agent & Agency'ye bağlı)

  // a) İstanbul Boğazı'nda Yalı (Bebek)
  const yaliPanorama1 =
    "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-4.jpg";
  const yaliPanorama2 =
    "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-1.jpg";

  const yali = await prisma.property.create({
    data: {
      title: "İstanbul Boğazı'nda Tarihi Yalı",
      description:
        "Bebek sahil şeridinde birinci derece tarihi eser statüsünde, 6+2 planlı, 950 m² kapalı kullanım alanlı, özel yat yanaşma iskelesi, tam donanımlı Türk hamamı, iklimlendirilmiş şarap mahzeni ve panoramik Boğaz terasına sahip prestij yalısı.",
      price: 150000000,
      currency: "TRY",
      status: PropertyStatus.FOR_SALE,
      bedrooms: 6,
      bathrooms: 5,
      squareMeters: 950,
      isFurnished: true,
      latitude: 41.0766,
      longitude: 29.0434,
      address: "Cevdet Paşa Caddesi No: 42, Bebek Sahili",
      city: "İstanbul",
      district: "Bebek / Beşiktaş",
      semanticText:
        "İstanbul Boğazı satılık yalı Bebek sahili 6+2 150.000.000 TL özel yat iskelesi boğaz manzaralı tarihi ahşap yalı akıllı ev otomasyonu şarap mahzeni Türk hamamı spa ultra lüks gayrimenkul",
      seoTitle: "Bebek Boğaz Yalısı Satılık | 6+2 Tarihi Sahil Yalısı",
      seoDesc:
        "İstanbul Bebek sahilinde özel yat iskelesi ve panoramik Boğaz manzaralı 6+2 ultra lüks satılık tarihi yalı.",
      schemaJson: {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: "İstanbul Boğazı'nda Tarihi Yalı",
        price: "150000000",
        priceCurrency: "TRY",
        virtualTour: {
          updatedAt: new Date().toISOString(),
          roomCount: 2,
          rooms: [
            {
              id: "yali-salon",
              roomLabel: "Boğaz Salonu",
              customTitle: "Panoramik Ana Boğaz Salonu",
              captureMode: "equirectangular",
              panoramaUrl: yaliPanorama1,
              sortOrder: 0,
              hotspots: [
                {
                  id: "hs-yali-somine",
                  x: 1.2,
                  y: -2.1,
                  z: -9.7,
                  yaw: 0.12,
                  pitch: -0.22,
                  category: "MİMARİ DETAY",
                  title: "İtalyan Mermer Şömine & İskele Cephesi",
                  description:
                    "Bebek koyuna sıfır 24 metre rıhtım cepheli yüksek tavanlı ana yaşam alanı.",
                  spec: "Calacatta Bookmatch",
                },
              ],
              links: [
                {
                  id: "lk-yali-to-suit",
                  targetRoomId: "yali-suit",
                  x: -1.5,
                  y: -1.0,
                  z: 9.8,
                  yaw: -0.15,
                  pitch: -0.1,
                  label: "Master Süite Geçiş →",
                },
              ],
            },
            {
              id: "yali-suit",
              roomLabel: "Master Süit",
              customTitle: "Boğaz Teraslı Master Süit",
              captureMode: "equirectangular",
              panoramaUrl: yaliPanorama2,
              sortOrder: 1,
              hotspots: [],
              links: [
                {
                  id: "lk-suit-to-yali",
                  targetRoomId: "yali-salon",
                  x: 0.5,
                  y: -1.4,
                  z: -9.8,
                  yaw: 3.05,
                  pitch: -0.15,
                  label: "Ana Salona Dön ←",
                },
              ],
            },
          ],
        },
      },
      agencyId: agency.id,
      agentId: agent.id,
    },
  });

  await prisma.media.createMany({
    data: [
      {
        propertyId: yali.id,
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
        type: MediaType.IMAGE,
        roomLabel: "Boğaz Cephesi & Özel İskele",
        isStaged: false,
        sortOrder: 1,
      },
      {
        propertyId: yali.id,
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
        type: MediaType.IMAGE,
        roomLabel: "Yalı Ana Salonu",
        isStaged: true,
        sortOrder: 2,
      },
      {
        propertyId: yali.id,
        url: yaliPanorama1,
        type: MediaType.PANORAMA_360,
        roomLabel: "Boğaz Salonu",
        isStaged: false,
        sortOrder: 0,
      },
      {
        propertyId: yali.id,
        url: yaliPanorama2,
        type: MediaType.PANORAMA_360,
        roomLabel: "Master Süit",
        isStaged: false,
        sortOrder: 1,
      },
    ],
  });

  // b) Bodrum Yalıkavak'ta Lüks Villa
  const bodrumPanorama =
    "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-3.jpg";

  const bodrumVilla = await prisma.property.create({
    data: {
      title: "Bodrum Yalıkavak'ta Lüks Villa",
      description:
        "Yalıkavak Tilkiçik Koyu'na hakim 2.400 m² müstakil arsa içerisinde, kesintisiz Ege Denizi ve gün batımı manzaralı sonsuzluk havuzu, 5+1 taş-cam mimari tasarım, açık hava şef mutfağı ve müstakil misafir süitine sahip modern malikane.",
      price: 75000000,
      currency: "TRY",
      status: PropertyStatus.FOR_SALE,
      bedrooms: 5,
      bathrooms: 5,
      squareMeters: 620,
      isFurnished: true,
      latitude: 37.1086,
      longitude: 27.2917,
      address: "Tilkiçik Koyu Mevkii No: 18, Yalıkavak",
      city: "Bodrum",
      district: "Yalıkavak",
      semanticText:
        "Bodrum Yalıkavak satılık lüks villa 5+1 75.000.000 TL sonsuzluk havuzlu infinity pool Tilkiçik Koyu Ege deniz manzaralı Palmarina yakın taş mimari müstakil havuzlu yazlık malikane",
      seoTitle: "Yalıkavak Sonsuzluk Havuzlu Lüks Villa | Bodrum",
      seoDesc:
        "Bodrum Yalıkavak'ta panoramik deniz manzaralı ve ısıtmalı sonsuzluk havuzlu 5+1 satılık modern taş villa.",
      schemaJson: {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: "Bodrum Yalıkavak'ta Lüks Villa",
        price: "75000000",
        priceCurrency: "TRY",
        virtualTour: {
          updatedAt: new Date().toISOString(),
          roomCount: 1,
          rooms: [
            {
              id: "bodrum-teras",
              roomLabel: "Sonsuzluk Havuzu & Salon",
              customTitle: "Ege Manzaralı Yaşam Alanı & Havuz Terası",
              captureMode: "equirectangular",
              panoramaUrl: bodrumPanorama,
              sortOrder: 0,
              hotspots: [
                {
                  id: "hs-bodrum-havuz",
                  x: 3.6,
                  y: -0.9,
                  z: -9.2,
                  yaw: 0.37,
                  pitch: -0.09,
                  category: "DIŞ MEKÂN & HAVUZ",
                  title: "Isıtmalı Sonsuzluk Havuzu",
                  description:
                    "Tuzlu su filtrasyonlu, gün batımı koy manzarasına bakan 22 metrelik infinity pool.",
                  spec: "22m x 5.5m / Otomatik Örtü",
                },
              ],
              links: [],
            },
          ],
        },
      },
      agencyId: agency.id,
      agentId: agent.id,
    },
  });

  await prisma.media.createMany({
    data: [
      {
        propertyId: bodrumVilla.id,
        url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85",
        type: MediaType.IMAGE,
        roomLabel: "Sonsuzluk Havuzu & Dış Cephe",
        isStaged: false,
        sortOrder: 1,
      },
      {
        propertyId: bodrumVilla.id,
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
        type: MediaType.IMAGE,
        roomLabel: "Ege Gün Batımı Terası",
        isStaged: false,
        sortOrder: 2,
      },
      {
        propertyId: bodrumVilla.id,
        url: bodrumPanorama,
        type: MediaType.PANORAMA_360,
        roomLabel: "Sonsuzluk Havuzu & Salon",
        isStaged: false,
        sortOrder: 0,
      },
    ],
  });

  // c) Nişantaşı Penthouse
  const nisantasiPanorama =
    "https://photo-sphere-viewer-data.netlify.app/assets/tour/key-biscayne-2.jpg";

  const nisantasiPenthouse = await prisma.property.create({
    data: {
      title: "Nişantaşı Penthouse",
      description:
        "Nişantaşı Abdi İpekçi Caddesi üzerinde prestijli butik rezidansın en üst iki katını kaplayan, doğrudan daire içine çıkan özel asansörlü, 4+1 ferah planlı, 120 m² peyzajlı şehir manzaralı çatı terasına sahip modern penthouse.",
      price: 45000000,
      currency: "TRY",
      status: PropertyStatus.FOR_SALE,
      bedrooms: 4,
      bathrooms: 4,
      squareMeters: 410,
      isFurnished: false,
      latitude: 41.0493,
      longitude: 28.9942,
      address: "Abdi İpekçi Caddesi No: 65, Nişantaşı",
      city: "İstanbul",
      district: "Şişli / Nişantaşı",
      semanticText:
        "Nişantaşı Şişli satılık penthouse 4+1 45.000.000 TL Abdi İpekçi caddesi özel asansörlü dubleks çatı katı geniş teraslı şehir manzaralı lüks rezidans",
      seoTitle: "Nişantaşı Abdi İpekçi 4+1 Penthouse | Şişli, İstanbul",
      seoDesc:
        "Nişantaşı kalbinde özel asansörlü ve panoramik teraslı 4+1 satılık lüks dubleks penthouse.",
      schemaJson: {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: "Nişantaşı Penthouse",
        price: "45000000",
        priceCurrency: "TRY",
        virtualTour: {
          updatedAt: new Date().toISOString(),
          roomCount: 1,
          rooms: [
            {
              id: "nisantasi-galeri",
              roomLabel: "Penthouse Galeri & Salon",
              customTitle: "4+1 Yüksek Tavanlı Penthouse Yaşam Alanı",
              captureMode: "equirectangular",
              panoramaUrl: nisantasiPanorama,
              sortOrder: 0,
              hotspots: [
                {
                  id: "hs-nisantasi-teras",
                  x: 0.4,
                  y: -1.1,
                  z: -9.9,
                  yaw: 0.04,
                  pitch: -0.11,
                  category: "MİMARİ & KONUM",
                  title: "Abdi İpekçi Panoramik Teras Cephesi",
                  description:
                    "Akustik üçlü ısıcamlı motorize doğramalar ile Nişantaşı silüetine açılan yaşam katı.",
                  spec: "Schüco Akustik 44dB",
                },
              ],
              links: [],
            },
          ],
        },
      },
      agencyId: agency.id,
      agentId: agent.id,
    },
  });

  await prisma.media.createMany({
    data: [
      {
        propertyId: nisantasiPenthouse.id,
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85",
        type: MediaType.IMAGE,
        roomLabel: "Penthouse Ana Salon",
        isStaged: false,
        sortOrder: 1,
      },
      {
        propertyId: nisantasiPenthouse.id,
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
        type: MediaType.IMAGE,
        roomLabel: "Galeri & Mutfak Hattı",
        isStaged: false,
        sortOrder: 2,
      },
      {
        propertyId: nisantasiPenthouse.id,
        url: nisantasiPanorama,
        type: MediaType.PANORAMA_360,
        roomLabel: "Penthouse Galeri & Salon",
        isStaged: false,
        sortOrder: 0,
      },
    ],
  });

  // 5. Örnek VIP Randevu Talebi
  await prisma.appointment.create({
    data: {
      guestName: "Lord Julian Sterling",
      guestPhone: "+44 7700 900555",
      guestEmail: "sterling@familyoffice.co.uk",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: AppointmentStatus.CONFIRMED,
      propertyId: yali.id,
      agentId: agent.id,
    },
  });

  console.log(
    `✅ 3 lüks ilan ve medya bağlantıları oluşturuldu:\n  1. ${yali.title}\n  2. ${bodrumVilla.title}\n  3. ${nisantasiPenthouse.title}`
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
