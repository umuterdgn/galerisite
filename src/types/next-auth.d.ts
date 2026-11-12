import { Role } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: Role;
    agencyId?: string | null;
    agencyName?: string | null;
    agencySlug?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      agencyId?: string | null;
      agencyName?: string | null;
      agencySlug?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    agencyId?: string | null;
    agencyName?: string | null;
    agencySlug?: string | null;
  }
}

