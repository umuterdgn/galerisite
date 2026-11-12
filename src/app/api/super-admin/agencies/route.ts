import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireSuperAdminSession } from "@/lib/super-admin-auth";

/**
 * GET /api/super-admin/agencies
 * Tüm kayıtlı emlak ajanslarını personel ve ilan sayılarıyla birlikte listeler.
 */
export async function GET() {
  const { errorResponse } = await requireSuperAdminSession();
  if (errorResponse) return errorResponse;

  try {
    const agencies = await prisma.agency.findMany({
      include: {
        _count: {
          select: {
            users: true,
            properties: true,
          },
        },
        users: {
          where: { role: Role.AGENCY_OWNER },
          select: {
            id: true,
            fullName: true,
            email: true,
          },
          orderBy: { createdAt: "asc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const summary = agencies.reduce(
      (acc, item) => {
        acc.totalAgencies += 1;
        if (item.isActive) {
          acc.activeAgencies += 1;
        } else {
          acc.suspendedAgencies += 1;
        }
        acc.totalUsers += item._count.users;
        acc.totalProperties += item._count.properties;
        return acc;
      },
      {
        totalAgencies: 0,
        activeAgencies: 0,
        suspendedAgencies: 0,
        totalUsers: 0,
        totalProperties: 0,
      }
    );

    return NextResponse.json({
      agencies: agencies.map((agency) => ({
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        logoUrl: agency.logoUrl,
        themeColor: agency.themeColor,
        isActive: agency.isActive,
        suspendedAt: agency.suspendedAt?.toISOString() ?? null,
        createdAt: agency.createdAt.toISOString(),
        updatedAt: agency.updatedAt.toISOString(),
        _count: agency._count,
        users: agency.users,
      })),
      summary,
    });
  } catch (error) {
    console.error("GET /api/super-admin/agencies error:", error);
    return NextResponse.json(
      { error: "Ajans listesi PostgreSQL üzerinden alınamadı." },
      { status: 500 }
    );
  }
}

