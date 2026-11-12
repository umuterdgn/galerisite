import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireSuperAdminSession } from "@/lib/super-admin-auth";

const updateAgencyStatusSchema = z.object({
  isActive: z.boolean(),
});

/**
 * PATCH /api/super-admin/agencies/[id]
 * Seçili ajansın sistem erişimini askıya alır (isActive: false) veya yeniden aktifleştirir.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { errorResponse } = await requireSuperAdminSession();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const parsed = updateAgencyStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz durum parametresi." },
        { status: 400 }
      );
    }

    const existing = await prisma.agency.findUnique({
      where: { id: params.id },
      select: { id: true, name: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ajans bulunamadı." }, { status: 404 });
    }

    const updated = await prisma.agency.update({
      where: { id: params.id },
      data: {
        isActive: parsed.data.isActive,
        suspendedAt: parsed.data.isActive ? null : new Date(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        suspendedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      agency: {
        ...updated,
        suspendedAt: updated.suspendedAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("PATCH /api/super-admin/agencies/[id] error:", error);
    return NextResponse.json(
      { error: "Ajans erişim durumu güncellenemedi." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/super-admin/agencies/[id]
 * Ajansı ve ajansa bağlı kullanıcı/ilan kayıtlarını kalıcı olarak siler.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { session, errorResponse } = await requireSuperAdminSession();
  if (errorResponse) return errorResponse;

  try {
    if (session.user.agencyId && session.user.agencyId === params.id) {
      return NextResponse.json(
        { error: "Aktif oturumunuzun bağlı olduğu ajansı silemezsiniz." },
        { status: 400 }
      );
    }

    const existing = await prisma.agency.findUnique({
      where: { id: params.id },
      select: { id: true, name: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ajans bulunamadı." }, { status: 404 });
    }

    await prisma.agency.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      deletedId: params.id,
      deletedName: existing.name,
    });
  } catch (error) {
    console.error("DELETE /api/super-admin/agencies/[id] error:", error);
    return NextResponse.json(
      { error: "Ajans silme işlemi başarısız oldu." },
      { status: 500 }
    );
  }
}

