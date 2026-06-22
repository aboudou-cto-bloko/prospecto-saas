import { prisma } from "@/lib/prisma";
import { requireOrg } from "@/lib/org-context";
import { CampaignsList } from "./campaigns-list";

export default async function CampaignsPage() {
  const { organizationId } = await requireOrg();

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
