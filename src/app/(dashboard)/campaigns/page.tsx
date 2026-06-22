import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/org-context";
import { getOrgPlanLimits } from "@/lib/subscription";
import { CampaignsList } from "./campaigns-list";
import { CampaignsLocked } from "./campaigns-locked";

export default async function CampaignsPage() {
  const { organizationId } = await requireOrg();
  const { planId, limits } = await getOrgPlanLimits(organizationId);

  if (limits.campaigns === 0) {
    return <CampaignsLocked planId={planId} />;
  }

  const campaigns = await prisma.campaign.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { prospects: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-headline text-ink">
        Campagnes
      </h1>
      <p className="mt-1 text-sm text-ink-subtle">
        Gère tes campagnes WhatsApp
      </p>
      <CampaignsList campaigns={campaigns} />
    </div>
  );
}
