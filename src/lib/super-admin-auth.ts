import { NextResponse } from "next/server";
import { getServerSession, type Session } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";

export async function requireSuperAdminSession(): Promise<
  | { session: Session; errorResponse: null }
  | { session: null; errorResponse: NextResponse }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "Oturum bulunamadı. Lütfen Super Admin olarak giriş yapın." },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== Role.SUPERADMIN) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "Bu işlem için SUPERADMIN yetkisi zorunludur." },
        { status: 403 }
      ),
    };
  }

  return { session, errorResponse: null };
}

