"use server";

import { prisma } from "@/lib/prisma";
import { requireOrg, requireRole } from "@/lib/org-context";
import { assertCampaignLimit } from "@/lib/limits";
import { generateWhatsAppLink, renderTemplate } from "@/lib/template";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { CampaignStatus } from "@/generated/prisma/client";

const createCampaignSchema = z.object({
  name: z.string().min(1),
  template: z.string().min(1),
  source: z.enum(["GOAFRICA_ONLINE", "REFERRAL", "DIRECT", "OTHER"]).default("GOAFRICA_ONLINE"),
});

export async function createCampaign(data: z.input<typeof createCampaignSchema>) {
  const { organizationId, user } = await requireOrg();
  const parsed = createCampaignSchema.parse(data);

  await assertCampaignLimit(organizationId);

  const campaign = await prisma.campaign.create({
    data: {
      ...parsed,
      organizationId,
      createdById: user.id,
    },
  });

  revalidatePath("/campaigns");
  return campaign;
}

export async function updateCampaignStatus(id: string, status: CampaignStatus) {
  const { organizationId } = await requireRole("owner", "admin");

  const campaign = await prisma.campaign.update({
    where: { id, organizationId },
    data: { status },
  });

  revalidatePath("/campaigns");
  return campaign;
}

export async function addProspectsToCampaign(campaignId: string, prospectIds: string[]) {
  const { organizationId } = await requireOrg();

  await prisma.campaign.findFirstOrThrow({
    where: { id: campaignId, organizationId },
  });

  await prisma.campaignProspect.createMany({
    data: prospectIds.map((prospectId) => ({
      campaignId,
      prospectId,
    })),
    skipDuplicates: true,
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function getCampaignWithProspects(campaignId: string) {
  const { organizationId } = await requireOrg();

  return prisma.campaign.findFirstOrThrow({
    where: { id: campaignId, organizationId },
    include: {
      prospects: {
        include: { prospect: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function generateWhatsAppLinks(campaignId: string) {
  const { organizationId } = await requireOrg();

  const campaign = await prisma.campaign.findFirstOrThrow({
    where: { id: campaignId, organizationId },
    include: {
      prospects: {
        where: { status: "PENDING" },
        include: { prospect: true },
      },
    },
  });

  return campaign.prospects.map((cp) => {
    const variables: Record<string, string> = {
      nom: cp.prospect.name,
      telephone: cp.prospect.phone,
    };
    if (cp.prospect.metadata && typeof cp.prospect.metadata === "object") {
      for (const [k, v] of Object.entries(cp.prospect.metadata as Record<string, unknown>)) {
        if (typeof v === "string") variables[k] = v;
      }
    }
    const message = renderTemplate(campaign.template, variables);
    return {
      prospectId: cp.prospectId,
      campaignProspectId: cp.id,
      name: cp.prospect.name,
      phone: cp.prospect.phone,
      message,
      link: generateWhatsAppLink(cp.prospect.phone, message),
    };
  });
}

export async function markAsSent(campaignProspectId: string) {
  await prisma.campaignProspect.update({
    where: { id: campaignProspectId },
    data: { status: "SENT", sentAt: new Date() },
  });
}
