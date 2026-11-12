import { PrismaClient } from "@prisma/client";

const DEFAULT_FALLBACK_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/galerisite_db?schema=public";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || DEFAULT_FALLBACK_DATABASE_URL;

  return new PrismaClient({
    datasourceUrl: databaseUrl,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Veritabanı erişilebilirliğini uygulama çökmeden güvenli şekilde kontrol eder.
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PostgreSQL bağlantısı kurulamadı.";
    return { connected: false, error: message };
  }
}

/**
 * Veritabanı erişilemediğinde uygulamanın çökmesini önleyip fallback değer döner.
 */
export async function withDatabaseFallback<T>(
  queryFn: () => Promise<T>,
  fallbackValue: T | (() => T | Promise<T>)
): Promise<{ data: T; fromFallback: boolean }> {
  try {
    const data = await queryFn();
    return { data, fromFallback: false };
  } catch (error) {
    console.warn("Prisma bağlantı hatası, güvenli fallback kullanılıyor:", error);
    const data =
      typeof fallbackValue === "function"
        ? await (fallbackValue as () => T | Promise<T>)()
        : fallbackValue;
    return { data, fromFallback: true };
  }
}

export default prisma;

