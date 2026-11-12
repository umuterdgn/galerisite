import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login?callbackUrl=/super-admin/agencies");
  }

  if (session.user.role !== Role.SUPERADMIN) {
    redirect("/admin/dashboard?error=superadmin_only");
  }

  return <>{children}</>;
}

