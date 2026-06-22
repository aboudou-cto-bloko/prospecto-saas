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
  let orgId = session.session.activeOrganizationId;

  if (!orgId) {
    const membership = await prisma.member.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });
    if (!membership) {
      throw new Error("Aucune organisation active");
    }
    orgId = membership.organizationId;
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
