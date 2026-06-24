import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "./api-key";
import { prisma } from "./prisma";
import { consumeCredits, InsufficientCreditsError, type CreditAction } from "./credits";

export type ApiContext = {
  organizationId: string;
  userId: string;
};

export async function withApiKey(
  req: NextRequest,
  handler: (ctx: ApiContext) => Promise<NextResponse>,
  creditAction?: CreditAction,
  quantity = 1
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

  if (creditAction) {
    try {
      await consumeCredits(result.organizationId, creditAction, quantity);
    } catch (err) {
      if (err instanceof InsufficientCreditsError) {
        return NextResponse.json(
          { error: err.message, remaining: err.remaining, needed: err.needed },
          { status: 402 }
        );
      }
      throw err;
    }
  }

  return handler({
    organizationId: result.organizationId,
    userId: result.createdById,
  });
}
