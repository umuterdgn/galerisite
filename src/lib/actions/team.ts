"use server";

import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export interface TeamMemberItem {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  agencyId: string | null;
  agencyName?: string;
  activeListingsCount: number;
  closedDealsCount: number;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
  specialty?: string;
  createdAt?: string;
}

// In-Memory Seed / Demo Fallback Team Pool
let SEED_TEAM: TeamMemberItem[] = [
  {
    id: "user-owner-01",
    fullName: "Derin Soydan",
    email: "owner@lumiere.luxury",
    role: "AGENCY_OWNER",
    agencyId: "agency-prime-01",
    agencyName: "Lumière Prime Estates Bodrum",
    activeListingsCount: 18,
    closedDealsCount: 12,
    status: "ACTIVE",
    specialty: "Yalılar & Ultra Lüks Sahil Malikâneleri",
    createdAt: "2024-01-15",
  },
  {
    id: "user-agent-01",
    fullName: "Can Demir",
    email: "agent@lumiere.luxury",
    role: "AGENT",
    agencyId: "agency-prime-01",
    agencyName: "Lumière Prime Estates Bodrum",
    activeListingsCount: 5,
    closedDealsCount: 4,
    status: "ACTIVE",
    specialty: "Bodrum Yalıkavak Villaları & Marinalar",
    createdAt: "2024-06-10",
  },
  {
    id: "user-agent-02",
    fullName: "Melis Kaya",
    email: "melis.kaya@lumiere.luxury",
    role: "AGENT",
    agencyId: "agency-prime-01",
    agencyName: "Lumière Prime Estates Bodrum",
    activeListingsCount: 4,
    closedDealsCount: 6,
    status: "ACTIVE",
    specialty: "Boğaziçi Tarihi Eser & Penthouse Portföyü",
    createdAt: "2024-08-01",
  },
  {
    id: "user-agent-03",
    fullName: "Kerem Arslan",
    email: "kerem.arslan@lumiere.luxury",
    role: "AGENT",
    agencyId: "agency-prime-01",
    agencyName: "Lumière Prime Estates Bodrum",
    activeListingsCount: 3,
    closedDealsCount: 2,
    status: "ACTIVE",
    specialty: "French Riviera & Uluslararası Alıcılar",
    createdAt: "2025-02-14",
  },
];

/**
 * Ajansa bağlı emlakçı ve broker kadrosunu getirir.
 */
export async function getAgencyTeam(agencyId = "agency-prime-01"): Promise<TeamMemberItem[]> {
  try {
    const users = await prisma.user.findMany({
      where: { agencyId },
      include: {
        agency: true,
        _count: {
          select: { properties: true, appointments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (users && users.length > 0) {
      return users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        agencyId: u.agencyId,
        agencyName: u.agency?.name || "Lumière Prime Estates",
        activeListingsCount: u._count.properties,
        closedDealsCount: u._count.appointments,
        status: "ACTIVE",
        specialty: u.role === "AGENCY_OWNER" ? "Ajans Yönetimi & Broker" : "Lüks Portföy Temsilcisi",
        createdAt: u.createdAt.toISOString().split("T")[0],
      }));
    }
  } catch (error) {
    console.warn("Prisma getAgencyTeam offline or empty, using seed team:", error);
  }

  return SEED_TEAM.filter((m) => !agencyId || m.agencyId === agencyId);
}

/**
 * Ajans sahibi tarafından yeni emlak danışmanı (AGENT) ekleme
 */
export async function addTeamMember(data: {
  fullName: string;
  email: string;
  password?: string;
  role?: Role;
  agencyId?: string;
  specialty?: string;
}) {
  try {
    const agencyId = data.agencyId || "agency-prime-01";
    const role = data.role || Role.AGENT;
    const rawPass = data.password || "Lumiere2026!";
    const passwordHash = await bcrypt.hash(rawPass, 10);

    // Prisma'ya eklemeyi dene
    try {
      const created = await prisma.user.create({
        data: {
          fullName: data.fullName,
          email: data.email.toLowerCase().trim(),
          passwordHash,
          role,
          agencyId,
        },
      });

      return {
        success: true,
        user: {
          id: created.id,
          fullName: created.fullName,
          email: created.email,
          role: created.role,
        },
      };
    } catch {
      // Prisma offline ise in-memory seed havuzuna ekle
      const newMember: TeamMemberItem = {
        id: `user-agent-${Date.now()}`,
        fullName: data.fullName,
        email: data.email.toLowerCase().trim(),
        role,
        agencyId,
        agencyName: "Lumière Prime Estates Bodrum",
        activeListingsCount: 0,
        closedDealsCount: 0,
        status: "ACTIVE",
        specialty: data.specialty || "Lüks Portföy Uzmanı",
        createdAt: new Date().toISOString().split("T")[0],
      };
      SEED_TEAM = [newMember, ...SEED_TEAM];

      return { success: true, user: newMember };
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Personel eklenemedi.",
    };
  }
}

/**
 * Personel bilgilerini güncelleme
 */
export async function updateTeamMember(data: {
  id: string;
  fullName?: string;
  role?: Role;
  status?: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
  specialty?: string;
}) {
  try {
    try {
      await prisma.user.update({
        where: { id: data.id },
        data: {
          ...(data.fullName ? { fullName: data.fullName } : {}),
          ...(data.role ? { role: data.role } : {}),
        },
      });
    } catch {
      // In-memory update
      SEED_TEAM = SEED_TEAM.map((m) =>
        m.id === data.id
          ? {
              ...m,
              ...(data.fullName ? { fullName: data.fullName } : {}),
              ...(data.role ? { role: data.role } : {}),
              ...(data.status ? { status: data.status } : {}),
              ...(data.specialty ? { specialty: data.specialty } : {}),
            }
          : m
      );
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Personel güncellenemedi.",
    };
  }
}

/**
 * Personel silme
 */
export async function deleteTeamMember(id: string) {
  try {
    try {
      await prisma.user.delete({ where: { id } });
    } catch {
      // In-memory delete
      SEED_TEAM = SEED_TEAM.filter((m) => m.id !== id);
    }
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Personel silinemedi.",
    };
  }
}

/**
 * Rol Tabanlı İlan Erişim Kontrolü (RBAC Scoped Property Retrieval):
 * - SUPERADMIN: Tüm platformdaki ilanları görür.
 * - AGENCY_OWNER: Ajansın tüm ilanlarını görür.
 * - AGENT: Yalnızca kendi eklediği (agentId == user.id) ilanları görür.
 */
export async function getScopedProperties(user: {
  id: string;
  role: Role;
  agencyId?: string | null;
}) {
  const allPropertiesMock = [
    {
      id: "prop-1",
      title: "The Bosphorus Waterfront Palace",
      price: "€ 42.500.000",
      city: "İstanbul",
      district: "Yeniköy",
      agentId: "user-agent-02",
      agentName: "Melis Kaya",
      agencyId: "agency-prime-01",
      status: "FOR_SALE",
    },
    {
      id: "prop-2",
      title: "Villa Belle Époque",
      price: "€ 38.000.000",
      city: "Antibes",
      district: "Cap d'Antibes",
      agentId: "user-agent-03",
      agentName: "Kerem Arslan",
      agencyId: "agency-prime-01",
      status: "FOR_SALE",
    },
    {
      id: "prop-3",
      title: "Sky Penthouse at Palm Jumeirah",
      price: "$ 27.900.000",
      city: "Dubai",
      district: "Palm Jumeirah",
      agentId: "user-owner-01",
      agentName: "Derin Soydan",
      agencyId: "agency-prime-01",
      status: "FOR_SALE",
    },
    {
      id: "prop-4",
      title: "Yalıkavak Cliffside Private Estate",
      price: "€ 18.500.000",
      city: "Bodrum",
      district: "Yalıkavak",
      agentId: "user-agent-01", // Can Demir'in ilanı
      agentName: "Can Demir",
      agencyId: "agency-prime-01",
      status: "OFF_MARKET",
    },
    {
      id: "prop-5",
      title: "Bebek Waterfront Historical Mansion",
      price: "€ 52.000.000",
      city: "İstanbul",
      district: "Bebek",
      agentId: "user-agent-01", // Can Demir'in ilanı
      agentName: "Can Demir",
      agencyId: "agency-prime-01",
      status: "OFF_MARKET",
    },
  ];

  if (user.role === "SUPERADMIN") {
    return {
      scope: "SUPERADMIN_GLOBAL",
      description: "Platformdaki tüm ajansların ve brokerların portföyü",
      properties: allPropertiesMock,
    };
  }

  if (user.role === "AGENCY_OWNER") {
    const agencyProperties = allPropertiesMock.filter(
      (p) => p.agencyId === user.agencyId
    );
    return {
      scope: "AGENCY_WIDE",
      description: "Ajansınız bünyesindeki tüm brokerların ortak portföyü",
      properties: agencyProperties,
    };
  }

  // AGENT rolü: Sadece kendi ilanları!
  const agentProperties = allPropertiesMock.filter(
    (p) => p.agentId === user.id
  );
  return {
    scope: "AGENT_PERSONAL",
    description: "Yalnızca şahsınıza ait ve sizin yönettiğiniz ilanlar",
    properties: agentProperties,
  };
}

