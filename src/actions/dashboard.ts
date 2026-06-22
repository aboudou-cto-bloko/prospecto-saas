"use server";

import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/org-context";
import { getUsage } from "@/lib/limits";

export async function getDashboardStats() {
  const { organizationId } = await requireOrg();

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalProspects,
    newThisWeek,
    activeCampaigns,
    convertedCount,
    usage,
  ] = await Promise.all([
    prisma.prospect.count({ where: { organizationId } }),
    prisma.prospect.count({
      where: { organizationId, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.campaign.count({
      where: { organizationId, status: "ACTIVE" },
    }),
    prisma.prospect.count({
      where: { organizationId, status: "CONVERTED" },
    }),
    getUsage(organizationId),
  ]);

  const conversionRate =
    totalProspects > 0
      ? Math.round((convertedCount / totalProspects) * 100)
      : 0;

  return {
    totalProspects,
    newThisWeek,
    activeCampaigns,
    conversionRate,
    usage,
  };
}
