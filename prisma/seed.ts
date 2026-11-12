import { PrismaClient, Role, PropertyStatus, MediaType, AppointmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Veritabanı seed işlemi başlatılıyor...");

  // 1. Örnek Ajans (Tenant) Oluştur
  const agency = await prisma.agency.upsert({
    where: { slug: "lumiere-prime" },
    update: {},
    create: {
      name: "Lumière Prime Estates",
      slug: "lumiere-prime",
      logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80",
      themeColor: "#D4AF37",
    },
  });

  console.log(`✅ Ajans oluşturuldu: ${agency.name} (Slug: ${agency.slug})`);

  // 2. Personel & Kullanıcılar (Superadmin, Owner, Agent)
  const superadmin = await prisma.user.upsert({
    where: { email: "superadmin@lumiere-platform.com" },
    update: {},
    create: {
      email: "superadmin@lumiere-platform.com",
      passwordHash: "$2a$12$e80/Kk0L0V3WbJm8B3W4ze9g9p2WcQj8e3N.B7K2P7e7t6A6G.X4O", // Hash örneği
      fullName: "Sistem Yöneticisi",
      role: Role.SUPERADMIN,
      language: "tr",
      themePref: "dark",
    },
  });

  const agencyOwner = await prisma.user.upsert({
    where: { email: "owner@lumiere-prime.com" },
    update: {},
    create: {
      email: "owner@lumiere-prime.com",
      passwordHash: "$2a$12$e80/Kk0L0V3WbJm8B3W4ze9g9p2WcQj8e3N.B7K2P7e7t6A6G.X4O",
      fullName: "Alexander Vance",
      role: Role.AGENCY_OWNER,
      language: "tr",
      themePref: "dark",
      agencyId: agency.id,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "derin.soydan@lumiere-prime.com" },
    update: {},
    create: {
      email: "derin.soydan@lumiere-prime.com",
      passwordHash: "$2a$12$e80/Kk0L0V3WbJm8B3W4ze9g9p2WcQj8e3N.B7K2P7e7t6A6G.X4O",
      fullName: "Derin Soydan",
      role: Role.AGENT,
      language: "tr",
      themePref: "dark",
      agencyId: agency.id,
    },
  });

  console.log(`✅ Kullanıcılar oluşturuldu: ${superadmin.email}, ${agencyOwner.email}, ${agent.email}`);

  // 3. Lüks İlanlar (Property)
  const yali = await prisma.property.create({
    data: {
      title: "The Bosphorus Waterfront Palace",
      description:
        "Tarihi Yeniköy sahil hattında tescilli, 1.450 m² kapalı kullanım alanlı, helikopter pisti ve özel yat iskelesi bulunan ultra-lüks Boğaz yalısı.",
      price: 42500000,
      currency: "EUR",
      status: PropertyStatus.FOR_SALE,
      bedrooms: 8,
      bathrooms: 9,
      squareMeters: 1450,
      isFurnished: true,
      latitude: 41.1218,
      longitude: 29.0712,
      address: "Köybaşı Caddesi No: 84",
      city: "Istanbul",
      district: "Yeniköy / Sarıyer",
      semanticText:
        "Boğaz manzaralı tarihi yalı, özel yat iskelesi, helikopter pisti, yeniköy lüks yalı, akıllı ev otomasyonu, şarap mahzeni, sauna ve spa.",
      seoTitle: "Yeniköy Boğaz Yalısı Satılık | Ultra-Lüks Tarihi Yalı",
      seoDesc:
        "İstanbul Yeniköy'de özel yat iskelesi ve helikopter pistine sahip 1.450 m² tescilli satılık Boğaz yalısı.",
      schemaJson: {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": "The Bosphorus Waterfront Palace",
        "price": "42500000",
        "priceCurrency": "EUR",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Istanbul",
          "addressRegion": "Yeniköy",
          "addressCountry": "TR"
        }
      },
      agencyId: agency.id,
      agentId: agent.id,
      media: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
            type: MediaType.IMAGE,
            roomLabel: "Ön Cephe & İskele",
            isStaged: false,
            sortOrder: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
            type: MediaType.IMAGE,
            roomLabel: "Ana Salon",
            isStaged: true, // Virtual staging
            sortOrder: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
            type: MediaType.PANORAMA_360,
            roomLabel: "360 Sanal Tur - Master Süit",
            isStaged: false,
            sortOrder: 3,
          },
          {
            url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85",
            type: MediaType.DRONE,
            roomLabel: "Boğaz Hava Çekimi",
            isStaged: false,
            sortOrder: 4,
          },
        ],
      },
      appointments: {
        create: [
          {
            guestName: "Lord Julian Sterling",
            guestPhone: "+44 7700 900555",
            guestEmail: "sterling@familyoffice.co.uk",
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: AppointmentStatus.CONFIRMED,
            agentId: agent.id,
          },
        ],
      },
    },
  });

  console.log(`✅ Lüks mülk eklendi: ${yali.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

