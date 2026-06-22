"use server";

import { prisma } from "@/lib/prisma";
import { getOrgPlanLimits } from "@/lib/subscription";

export class LimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LimitError";
  }
}

export async function assertProspectLimit(organizationId: string, adding = 1) {
  const { limits } = await getOrgPlanLimits(organizationId);
  if (!isFinite(limits.prospects)) return;
  const count = await prisma.prospect.count({ where: { organizationId } });
  if (count + adding > limits.prospects) {
    throw new LimitError(
      `Limite atteinte : ${limits.prospects} prospects maximum sur votre plan`
    );
  }
}

export async function assertCampaignLimit(organizationId: string) {
  const { limits } = await getOrgPlanLimits(organizationId);
  if (!isFinite(limits.campaigns)) return;
  const count = await prisma.campaign.count({ where: { organizationId } });
  if (count >= limits.campaigns) {
    throw new LimitError(
      `Limite atteinte : ${limits.campaigns} campagnes maximum sur votre plan`
    );
  }
}

export async function assertMonthlyMessageLimit(organizationId: string) {
  const { limits } = await getOrgPlanLimits(organizationId);
  if (!isFinite(limits.messagesPerMonth)) return;
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const count = await prisma.campaignProspect.count({
    where: {
      campaign: { organizationId },
      sentAt: { gte: start },
      status: { in: ["SENT", "DELIVERED", "READ", "REPLIED"] },
    },
  });
  if (count >= limits.messagesPerMonth) {
    throw new LimitError(
      `Limite atteinte : ${limits.messagesPerMonth} messages/mois sur votre plan`
    );
  }
}

export async function assertCustomFieldLimit(organizationId: string) {
  const { limits } = await getOrgPlanLimits(organizationId);
  if (!isFinite(limits.customFields)) return;
  const count = await prisma.customField.count({ where: { organizationId } });
  if (count >= limits.customFields) {
    throw new LimitError(
      `Limite atteinte : ${limits.customFields} champs personnalisés sur votre plan`
    );
  }
}

export async function assertTagLimit(organizationId: string) {
  const { limits } = await getOrgPlanLimits(organizationId);
  if (!isFinite(limits.tags)) return;
  const count = await prisma.tag.count({ where: { organizationId } });
  if (count >= limits.tags) {
    throw new LimitError(
      `Limite atteinte : ${limits.tags} tags maximum sur votre plan`
    );
  }
}

export async function getUsage(organizationId: string) {
  const { planId, limits } = await getOrgPlanLimits(organizationId);
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const [prospects, campaigns, messagesThisMonth, customFields, tags] =
    await Promise.all([
      prisma.prospect.count({ where: { organizationId } }),
      prisma.campaign.count({ where: { organizationId } }),
      prisma.campaignProspect.count({
        where: {
          campaign: { organizationId },
          sentAt: { gte: start },
          status: { in: ["SENT", "DELIVERED", "READ", "REPLIED"] },
        },
      }),
      prisma.customField.count({ where: { organizationId } }),
      prisma.tag.count({ where: { organizationId } }),
    ]);

  return {
    plan: planId,
    limits,
    usage: { prospects, campaigns, messagesThisMonth, customFields, tags },
  };
}
