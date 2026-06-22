"use server";

import { prisma } from "./prisma";
import { getPlanLimits, type PlanId } from "./plans";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export async function getSubscription(organizationId: string) {
  return prisma.subscription.findUnique({
    where: { organizationId },
  });
}

export async function createSubscription(organizationId: string, plan: PlanId = "free") {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + (plan === "free" ? 365 * 10 : 31));

  return prisma.subscription.create({
    data: {
      organizationId,
      plan,
      status: plan === "free" ? "active" : "trialing",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });
}

export async function activateSubscription(
  organizationId: string,
  plan: PlanId,
  monerooTransactionId: string
) {
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 31);

  return prisma.subscription.upsert({
    where: { organizationId },
    update: {
      plan,
      status: "active",
      monerooTransactionId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      canceledAt: null,
    },
    create: {
      organizationId,
      plan,
      status: "active",
      monerooTransactionId,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });
}

export async function cancelSubscription(organizationId: string) {
  return prisma.subscription.update({
    where: { organizationId },
    data: {
      status: "canceled",
      canceledAt: new Date(),
    },
  });
}

export async function isSubscriptionActive(organizationId: string): Promise<boolean> {
  const sub = await getSubscription(organizationId);
  if (!sub) return false;
  if (sub.status === "canceled") return false;
  if (new Date() > sub.currentPeriodEnd) return false;
  return true;
}

export async function getOrgPlanLimits(organizationId: string) {
  const sub = await getSubscription(organizationId);
  const planId = (sub?.plan ?? "free") as PlanId;
  return { planId, limits: getPlanLimits(planId) };
}
