"use server";

import { headers } from "next/headers";
import { auth } from "./auth";

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
  return { ...session, organizationId: orgId };
}
