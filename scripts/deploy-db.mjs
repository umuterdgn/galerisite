#!/usr/bin/env node

/**
 * LUMIÈRE LUXURY REAL ESTATE - PRODUCTION DATABASE MIGRATION SCRIPT
 * Canlı PostgreSQL veritabanında pgvector eklentisini doğrular,
 * Prisma migrate deploy komutunu çalıştırır ve istemciyi üretir.
 */

import { execSync } from "child_process";

console.log("===============================================================");
console.log("🚀 LUMIÈRE SAAS - PRODUCTION VERİTABANI DAĞITIM VE MİGRASYONU");
console.log("===============================================================");

// 1. DATABASE_URL Kontrolü
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.warn("⚠️  UYARI: DATABASE_URL çevre değişkeni tanımlı değil!");
  console.warn("   Lütfen .env dosyanızı veya hosting platformunuzdaki ortam değişkenlerini kontrol edin.");
} else {
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");
  console.log(`📍 Hedef Veritabanı: ${maskedUrl}`);
}

// 2. Prisma İstemcisini Üret (Generate)
console.log("\n📦 Adım 1: Prisma Client üretiliyor (npx prisma generate)...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("✅ Prisma Client başarıyla güncellendi.");
} catch (error) {
  console.error("❌ Prisma Client üretilirken hata oluştu:", error.message);
  process.exit(1);
}

// 3. Canlı Migrasyonları Uygula (Migrate Deploy)
console.log("\n🔄 Adım 2: Canlı migrasyonlar uygulanıyor (npx prisma migrate deploy)...");
console.log("   - 20261110000000_init_multi_tenant");
console.log("   - 20261110020000_add_pgvector_semantic_search (IVFFlat & vector_cosine_ops)");

try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("✅ Tüm migrasyonlar canlı veritabanına başarıyla uygulandı.");
} catch (error) {
  console.error("❌ Migrasyon uygulanırken hata oluştu.");
  console.error("   NOT: PostgreSQL sunucunuzda 'vector' (pgvector) eklentisinin desteklendiğinden emin olun.");
  console.error("   Hata detayı:", error.message);
  process.exit(1);
}

console.log("\n✨ Veritabanı canlıya geçiş için %100 hazır!");
console.log("===============================================================\n");

