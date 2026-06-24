import { NextRequest, NextResponse } from "next/server";
import { withApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { getOrgPlanLimits, getSubscription } from "@/lib/subscription";

export async function GET(req: NextRequest) {
  return withApiKey(req, async ({ organizationId }) => {
    const [sub, { planId, limits }] = await Promise.all([
      getSubscription(organizationId),
      getOrgPlanLimits(organizationId),
    ]);

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, newThisWeek, converted, activeCampaigns, messagesThisMonth] = await Promise.all([
      prisma.prospect.count({ where: { organizationId } }),
      prisma.prospect.count({ where: { organizationId, createdAt: { gte: sevenDaysAgo } } }),
      prisma.prospect.count({ where: { organizationId, status: "CONVERTED" } }),
      prisma.campaign.count({ where: { organizationId, status: "ACTIVE" } }),
      prisma.campaignProspect.count({
        where: { campaign: { organizationId }, sentAt: { gte: monthStart }, status: { in: ["SENT", "DELIVERED", "READ", "REPLIED"] } },
      }),
    ]);

    return NextResponse.json({
      plan: planId,
      prospects: { total, newThisWeek, converted, conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0 },
      campaigns: { active: activeCampaigns },
      credits: { used: sub?.scrapingCreditsUsed ?? 0, total: limits.scrapingCredits + (sub?.extraCredits ?? 0) },
      messages: { used: messagesThisMonth, limit: limits.messagesPerMonth },
      limits,
    });
  }, 0);
}
