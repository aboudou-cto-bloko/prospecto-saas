"use server";

import { prisma } from "./prisma";
import { getPlanLimits, getNextPlan, type PlanId } from "./plans";

export const CREDIT_COSTS = {
  SCRAPE_PER_PROSPECT: 2,
  IMPORT_CSV_PER_ROW: 1,
  WHATSAPP_LINK: 1,
  CAMPAIGN_CREATE: 3,
  CAMPAIGN_ADD_PROSPECT: 1,
  EXPORT_CSV: 10,
  MCP_WRITE: 1,
  MCP_SCRAPE: 5,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

export class InsufficientCreditsError extends Error {
  remaining: number;
  needed: number;
  nextPlan: string | null;

  constructor(remaining: number, needed: number, currentPlan: string) {
    const next = getNextPlan(currentPlan);
    const msg = next
      ? `Crédits insuffisants (${remaining} restants, ${needed} requis). Passe au plan ${next.name} pour ${next.price.toLocaleString("fr-FR")} F/mois.`
      : `Crédits insuffisants (${remaining} restants, ${needed} requis). Achète un pack de crédits.`;
    super(msg);
    this.name = "InsufficientCreditsError";
    this.remaining = remaining;
    this.needed = needed;
    this.nextPlan = next?.name ?? null;
  }
}

export async function getCreditsRemaining(organizationId: string): Promise<{
  used: number;
  total: number;
  remaining: number;
  plan: string;
}> {
  const sub = await prisma.subscription.findUnique({
    where: { organizationId },
  });
  if (!sub) return { used: 0, total: 0, remaining: 0, plan: "free" };

  const limits = getPlanLimits(sub.plan);
  const total = limits.scrapingCredits + sub.extraCredits;
  const used = sub.scrapingCreditsUsed;

  return {
    used,
    total: isFinite(total) ? total : Infinity,
    remaining: isFinite(total) ? total - used : Infinity,
    plan: sub.plan,
  };
}

export async function consumeCredits(
  organizationId: string,
  action: CreditAction,
  quantity = 1
): Promise<{ consumed: number; remaining: number }> {
  const cost = CREDIT_COSTS[action] * quantity;
  if (cost === 0) return { consumed: 0, remaining: Infinity };

  const { remaining, plan } = await getCreditsRemaining(organizationId);

  if (isFinite(remaining) && remaining < cost) {
    throw new InsufficientCreditsError(remaining, cost, plan);
  }

  await prisma.subscription.update({
    where: { organizationId },
    data: { scrapingCreditsUsed: { increment: cost } },
  });

  return { consumed: cost, remaining: isFinite(remaining) ? remaining - cost : Infinity };
}

export async function checkCredits(
  organizationId: string,
  action: CreditAction,
  quantity = 1
): Promise<boolean> {
  const cost = CREDIT_COSTS[action] * quantity;
  if (cost === 0) return true;

  const { remaining } = await getCreditsRemaining(organizationId);
  return !isFinite(remaining) || remaining >= cost;
}
