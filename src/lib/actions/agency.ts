"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export interface AgencySettingsData {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  themeColor: string;
  defaultLocale: "tr" | "en";
  defaultTheme: "dark" | "light";
  storage: "prisma" | "memory";
}

let MEMORY_AGENCY_SETTINGS: AgencySettingsData = {
  id: "agency-prime-01",
  name: "Lumière Prime Estates",
  slug: "lumiere-prime",
  logoUrl:
    "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80",
  themeColor: "#D4AF37",
  defaultLocale: "tr",
  defaultTheme: "dark",
  storage: "memory",
};

export async function getAgencySettings(): Promise<AgencySettingsData> {
  const session = await getServerSession(authOptions);
  const agencyId = session?.user?.agencyId;

  try {
    const agency = agencyId
      ? await prisma.agency.findUnique({ where: { id: agencyId } })
      : await prisma.agency.findFirst({ orderBy: { createdAt: "asc" } });

    if (agency) {
      return {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        logoUrl:
          agency.logoUrl ||
          "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80",
        themeColor: agency.themeColor || "#D4AF37",
        defaultLocale: "tr",
        defaultTheme: "dark",
        storage: "prisma",
      };
    }
  } catch (err) {
    console.warn("Prisma getAgencySettings fallback:", err);
  }

  return MEMORY_AGENCY_SETTINGS;
}

export async function updateAgencySettings(
  input: Omit<AgencySettingsData, "id" | "storage">
) {
  const session = await getServerSession(authOptions);
  const agencyId = session?.user?.agencyId;

  try {
    const existing = agencyId
      ? await prisma.agency.findUnique({ where: { id: agencyId } })
      : await prisma.agency.findFirst();

    const updated = existing
      ? await prisma.agency.update({
          where: { id: existing.id },
          data: {
            name: input.name,
            slug: input.slug,
            logoUrl: input.logoUrl || null,
            themeColor: input.themeColor,
          },
        })
      : await prisma.agency.create({
          data: {
            name: input.name,
            slug: input.slug,
            logoUrl: input.logoUrl || null,
            themeColor: input.themeColor,
          },
        });

    revalidatePath("/admin/dashboard/settings");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      storage: "prisma" as const,
      agency: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        logoUrl: updated.logoUrl || "",
        themeColor: updated.themeColor,
      },
    };
  } catch (err) {
    console.warn("Prisma updateAgencySettings fallback:", err);
    MEMORY_AGENCY_SETTINGS = {
      ...MEMORY_AGENCY_SETTINGS,
      ...input,
      storage: "memory",
    };
    return {
      success: true,
      storage: "memory" as const,
      agency: MEMORY_AGENCY_SETTINGS,
    };
  }
}

