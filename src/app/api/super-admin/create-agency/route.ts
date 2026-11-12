import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma, Role } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireSuperAdminSession } from "@/lib/super-admin-auth";

const createAgencySchema = z.object({
  agencyName: z
    .string()
    .trim()
    .min(2, "Ajans adı en az 2 karakter olmalıdır.")
    .max(120, "Ajans adı 120 karakteri geçemez."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Alt alan adı (slug) en az 2 karakter olmalıdır.")
    .max(60, "Slug 60 karakteri geçemez.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug yalnızca küçük harf, rakam ve tire (-) içerebilir."
    ),
  ownerName: z
    .string()
    .trim()
    .min(2, "Ajans sahibinin adı soyadı en az 2 karakter olmalıdır.")
    .max(120),
  ownerEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Geçerli bir ajans sahibi e-posta adresi giriniz."),
  tempPassword: z
    .string()
    .min(6, "Geçici şifre en az 6 karakter olmalıdır.")
    .max(100),
  themeColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Tema rengi geçerli bir HEX kod olmalıdır.")
    .optional(),
});

/**
 * POST /api/super-admin/create-agency
 * Prisma Transaction ile eşzamanlı olarak yeni Agency (Tenant) ve bağlı AGENCY_OWNER kullanıcısını oluşturur.
 */
export async function POST(req: NextRequest) {
  const { errorResponse } = await requireSuperAdminSession();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const parsed = createAgencySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ||
            "Form alanlarını kontrol edip tekrar deneyiniz.",
        },
        { status: 400 }
      );
    }

    const { agencyName, slug, ownerName, ownerEmail, tempPassword, themeColor } =
      parsed.data;

    // Çakışan slug veya e-posta ön kontrolü
    const [existingAgency, existingUser] = await Promise.all([
      prisma.agency.findUnique({ where: { slug }, select: { id: true } }),
      prisma.user.findUnique({ where: { email: ownerEmail }, select: { id: true } }),
    ]);

    if (existingAgency) {
      return NextResponse.json(
        { error: `"${slug}" alt alan adı (slug) sistemde zaten kullanılıyor.` },
        { status: 409 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: `"${ownerEmail}" e-posta adresiyle kayıtlı bir kullanıcı zaten mevcut.` },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Atomik Prisma Transaction: Önce Agency, hemen ardından bağlı AGENCY_OWNER User oluşturulur
    const created = await prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: {
          name: agencyName,
          slug,
          themeColor: themeColor || "#D4AF37",
          isActive: true,
        },
      });

      const owner = await tx.user.create({
        data: {
          fullName: ownerName,
          email: ownerEmail,
          passwordHash,
          role: Role.AGENCY_OWNER,
          agencyId: agency.id,
          language: "tr",
          themePref: "dark",
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          agencyId: true,
          createdAt: true,
        },
      });

      return { agency, owner };
    });

    return NextResponse.json(
      {
        success: true,
        agency: {
          ...created.agency,
          createdAt: created.agency.createdAt.toISOString(),
          updatedAt: created.agency.updatedAt.toISOString(),
          suspendedAt: created.agency.suspendedAt?.toISOString() ?? null,
          _count: { users: 1, properties: 0 },
          users: [
            {
              id: created.owner.id,
              fullName: created.owner.fullName,
              email: created.owner.email,
            },
          ],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Bu slug veya yönetici e-posta adresi zaten sistemde kayıtlı." },
        { status: 409 }
      );
    }

    console.error("POST /api/super-admin/create-agency error:", error);
    return NextResponse.json(
      {
        error:
          "Ajans ve yönetici hesabı transaction sırasında oluşturulamadı. Veritabanı bağlantısını kontrol ediniz.",
      },
      { status: 500 }
    );
  }
}

