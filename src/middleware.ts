import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { routing } from "./i18n/routing";
import { AUTH_SECRET } from "./lib/auth-constants";

const intlMiddleware = createMiddleware(routing);

// Korumalı yönetim rotaları: /admin, /[locale]/admin/*, /dashboard/* ve /super-admin/*
const ADMIN_ROUTE_REGEX =
  /^(\/(tr|en))?\/admin(\/.*)?$|^\/(dashboard|super-admin)(\/.*)?$/;
// Yalnızca SUPERADMIN rolüne açık rotalar
const SUPERADMIN_ROUTE_REGEX = /^(\/(tr|en))?(\/admin)?\/super-admin(\/.*)?$/;
// Giriş rotaları yönlendirme döngüsünden muaf tutulur
const LOGIN_ROUTE_REGEX = /^(\/(tr|en))?(\/admin)?\/login\/?$/;
// (admin) route group altındaki lokalsiz doğrudan yollar (/dashboard/*, /super-admin/* ve /login)
const DIRECT_GROUP_ROUTE_REGEX =
  /^\/(dashboard(\/.*)?|super-admin(\/.*)?|login\/?)$/;

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginRoute = LOGIN_ROUTE_REGEX.test(pathname);
  const isProtectedAdminRoute =
    ADMIN_ROUTE_REGEX.test(pathname) && !isLoginRoute;

  // Yetkisiz erişim kontrolü: Aktif NextAuth JWT oturumu yoksa /admin/login'e yönlendir
  if (isProtectedAdminRoute) {
    const token = await getToken({
      req,
      secret: AUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // SUPERADMIN rolü gerektiren rotalarda diğer rolleri engelle
    if (SUPERADMIN_ROUTE_REGEX.test(pathname) && token.role !== "SUPERADMIN") {
      return NextResponse.redirect(
        new URL("/admin/dashboard?error=superadmin_only", req.url)
      );
    }
  }

  // (admin) route group altındaki doğrudan yolları next-intl yeniden yazımından geçir
  if (DIRECT_GROUP_ROUTE_REGEX.test(pathname)) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  // API rotaları, statik dosyalar ve görseller hariç tüm rotaları yakalar
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
