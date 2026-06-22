import { getCampaignWithProspects, generateWhatsAppLinks } from "@/actions/campaigns";
import { CampaignDetail } from "./campaign-detail";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await getCampaignWithProspects(id);
  const links = await generateWhatsAppLinks(id);

  return <CampaignDetail campaign={campaign} links={links} />;
}
