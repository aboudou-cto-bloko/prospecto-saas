"use client";

import { useTransition } from "react";
import { markAsSent, updateCampaignStatus } from "@/actions/campaigns";
import { MessageCircle, ExternalLink, Check, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type WhatsAppLink = {
  prospectId: string;
  campaignProspectId: string;
  name: string;
  phone: string;
  message: string;
  link: string;
};

type CampaignWithProspects = {
  id: string;
  name: string;
  status: string;
  template: string;
  prospects: {
    id: string;
    status: string;
    sentAt: Date | null;
    prospect: { id: string; name: string; phone: string };
  }[];
};

export function CampaignDetail({
  campaign,
  links,
}: {
  campaign: CampaignWithProspects;
  links: WhatsAppLink[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleMarkSent(campaignProspectId: string) {
    startTransition(async () => {
      await markAsSent(campaignProspectId);
      toast.success("Marqué comme envoyé");
    });
  }

  function handleToggleStatus() {
    const newStatus = campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    startTransition(async () => {
      await updateCampaignStatus(
        campaign.id,
        newStatus as "ACTIVE" | "PAUSED"
      );
      toast.success(
        newStatus === "ACTIVE" ? "Campagne activée" : "Campagne en pause"
      );
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-headline text-ink">
            {campaign.name}
          </h1>
          <p className="mt-1 text-sm text-ink-subtle">
            {campaign.prospects.length} prospect
            {campaign.prospects.length !== 1 ? "s" : ""} ·{" "}
            {campaign.prospects.filter((p) => p.status === "SENT").length} envoyé
            {campaign.prospects.filter((p) => p.status === "SENT").length !== 1
              ? "s"
              : ""}
          </p>
        </div>
        <button
          onClick={handleToggleStatus}
          disabled={isPending}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            campaign.status === "ACTIVE"
              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
              : "bg-primary px-4 text-white hover:bg-primary-hover"
          )}
        >
          {campaign.status === "ACTIVE" ? (
            <>
              <Pause className="h-4 w-4" /> Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Activer
            </>
          )}
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-hairline bg-surface-1 p-5">
        <h2 className="text-sm font-medium text-ink-muted">Template</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink">
          {campaign.template}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <h2 className="text-lg font-semibold tracking-card-title text-ink">
          Liens WhatsApp
        </h2>
        {links.length === 0 && (
          <p className="text-sm text-ink-subtle">
            Aucun prospect en attente d&apos;envoi
          </p>
        )}
        {links.map((link) => (
          <div
            key={link.campaignProspectId}
            className="flex items-center justify-between rounded-lg border border-hairline bg-surface-1 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-ink">{link.name}</p>
              <p className="font-mono text-xs text-ink-subtle">{link.phone}</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-md bg-success/20 px-3 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/30"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Ouvrir WhatsApp
                <ExternalLink className="h-3 w-3" />
              </a>
              <button
                onClick={() => handleMarkSent(link.campaignProspectId)}
                disabled={isPending}
                className="rounded-md border border-hairline p-1.5 text-ink-subtle transition-colors hover:bg-surface-2"
                title="Marquer comme envoyé"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
