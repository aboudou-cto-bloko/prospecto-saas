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
        Gère tes campagnes WhatsApp — envoi via liens wa.me/ (gratuit, sans crédits)
      </p>
      <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-[13px] text-ink-subtle">
        <span className="mr-1.5 font-medium text-primary">Bientôt</span>
        L&apos;envoi automatisé directement depuis WhatsApp arrive prochainement. En attendant, chaque lien wa.me/ ouvre la conversation pré-remplie dans WhatsApp.
      </div>
      <CampaignsList campaigns={campaigns} />
    </div>
  );
}
