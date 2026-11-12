import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AUTH_SECRET } from "@/lib/auth-constants";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Gün
  },
  secret: AUTH_SECRET,
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Lumière B2B Credentials",
      credentials: {
        email: { label: "E-Posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Lütfen e-posta ve şifrenizi giriniz.");
        }

        const email = credentials.email.toLowerCase().trim();

        // 1. Prisma Veritabanında Kullanıcı Arama
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            include: { agency: true },
          });

          if (dbUser) {
            if (
              dbUser.agency &&
              dbUser.agency.isActive === false &&
              dbUser.role !== Role.SUPERADMIN
            ) {
              throw new Error(
                "Ajansınızın sistem erişimi geçici olarak askıya alınmıştır. Lütfen platform yöneticisiyle iletişime geçin."
              );
            }

            const isValid = await bcrypt.compare(
              credentials.password,
              dbUser.passwordHash
            );

            // Plain text fallback (seed/demo kolaylığı için)
            if (isValid || credentials.password === dbUser.passwordHash) {
              return {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.fullName,
                role: dbUser.role,
                agencyId: dbUser.agencyId,
                agencyName: dbUser.agency?.name || "Lumière Prime Estates",
                agencySlug: dbUser.agency?.slug || "lumiere-prime",
              };
            } else {
              throw new Error("Girdiğiniz şifre hatalı.");
            }
          }
        } catch (dbErr) {
          console.warn("DB user lookup offline/error, falling back to seed roles:", dbErr);
        }

        // 2. Demo ve Hızlı Test Hesapları (Out-of-the-Box Instant RBAC Login)
        // A) Süper Yönetici (SaaS Platform Sahibi)
        if (
          email === "superadmin@lumiere.luxury" &&
          (credentials.password === "Lumiere2026!" || credentials.password === "admin123")
        ) {
          return {
            id: "user-superadmin-01",
            email: "superadmin@lumiere.luxury",
            name: "Alexander Vance",
            role: "SUPERADMIN" as Role,
            agencyId: null,
            agencyName: "Lumière Global Master HQ",
            agencySlug: "global-hq",
          };
        }

        // B) Emlak Ajansı Sahibi (AGENCY_OWNER - Multi-Tenant Kiracı)
        if (
          (email === "owner@lumiere.luxury" || email === "bodrum@lumiere.luxury") &&
          (credentials.password === "Lumiere2026!" || credentials.password === "admin123")
        ) {
          return {
            id: "user-owner-01",
            email,
            name: "Derin Soydan",
            role: "AGENCY_OWNER" as Role,
            agencyId: "agency-prime-01",
            agencyName: "Lumière Prime Estates Bodrum",
            agencySlug: "bodrum-prime",
          };
        }

        // C) Emlak Danışmanı / Broker (AGENT)
        if (
          email === "agent@lumiere.luxury" &&
          (credentials.password === "Lumiere2026!" || credentials.password === "agent123")
        ) {
          return {
            id: "user-agent-01",
            email: "agent@lumiere.luxury",
            name: "Can Demir",
            role: "AGENT" as Role,
            agencyId: "agency-prime-01",
            agencyName: "Lumière Prime Estates Bodrum",
            agencySlug: "bodrum-prime",
          };
        }

        throw new Error("Geçersiz e-posta veya şifre girdiniz.");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.agencyId = user.agencyId;
        token.agencyName = user.agencyName;
        token.agencySlug = user.agencySlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.agencyId = token.agencyId;
        session.user.agencyName = token.agencyName;
        session.user.agencySlug = token.agencySlug;
      }
      return session;
    },
  },
};

