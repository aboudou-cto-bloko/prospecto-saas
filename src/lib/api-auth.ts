import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "./api-key";
import { prisma } from "./prisma";

export type ApiContext = {
  organizationId: string;
  userId: string;
};

export async function withApiKey(
  req: NextRequest,
  handler: (ctx: ApiContext) => Promise<NextResponse>,
  creditCost = 1
): Promise<NextResponse> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "API key manquante. Utilisez Authorization: Bearer psk_..." },
      { status: 401 }
    );
  }

  const key = authHeader.slice(7);
  const result = await validateApiKey(key);
  if (!result) {
    return NextResponse.json(
      { error: "API key invalide ou expirée" },
      { status: 401 }
    );
  }

  const sub = await prisma.subscription.findUnique({
    where: { organizationId: result.organizationId },
  });
  if (!sub || sub.status === "canceled") {
    return NextResponse.json(
      { error: "Abonnement inactif" },
      { status: 403 }
    );
  }

  if (creditCost > 0) {
    await prisma.subscription.update({
      where: { organizationId: result.organizationId },
      data: { scrapingCreditsUsed: { increment: creditCost } },
    });
  }

  return handler({
    organizationId: result.organizationId,
    userId: result.createdById,
  });
}
