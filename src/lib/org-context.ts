"use server";

import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./prisma";

export type OrgRole = "owner" | "admin" | "member";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.session || !session?.user) {
    throw new Error("Non authentifié");
  }
  return session;
}

export async function requireOrg() {
  const session = await requireSession();
  const orgId = session.session.activeOrganizationId;
  if (!orgId) {
    throw new Error("Aucune organisation active");
  }

  const member = await prisma.member.findUnique({
    where: {
      organizationId_userId: {
        organizationId: orgId,
        userId: session.user.id,
      },
    },
  });
  if (!member) {
    throw new Error("Accès refusé à cette organisation");
  }

  return {
    ...session,
    organizationId: orgId,
    role: member.role as OrgRole,
  };
}

export async function requireRole(...allowed: OrgRole[]) {
  const ctx = await requireOrg();
  if (!allowed.includes(ctx.role)) {
    throw new Error(
      `Permission refusée. Rôle requis : ${allowed.join(" ou ")}. Votre rôle : ${ctx.role}`
    );
  }
  return ctx;
}
