"use client";

import Link from "next/link";
import { Plus, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-surface-3 text-ink-subtle",
  ACTIVE: "bg-primary/20 text-primary-hover",
  PAUSED: "bg-yellow-500/20 text-yellow-400",
  COMPLETED: "bg-emerald-500/20 text-emerald-400",
};

type CampaignWithCount = {
  id: string;
  name: string;
  status: string;
  template: string;
  createdAt: Date;
  _count: { prospects: number };
};

export function CampaignsList({ campaigns }: { campaigns: CampaignWithCount[] }) {
  return (
    <div className="mt-6">
      <div className="flex justify-end">
        <Link
          href="/campaigns/new"
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Nouvelle campagne
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((c) => (
          <Link
            key={c.id}
            href={`/campaigns/${c.id}`}
            className="group rounded-lg border border-hairline bg-surface-1 p-5 transition-colors hover:border-hairline-strong hover:bg-surface-2/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-surface-3 p-2">
                  <Megaphone className="h-4 w-4 text-ink-subtle" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-ink group-hover:text-primary-hover">
                    {c.name}
                  </h3>
                  <p className="text-xs text-ink-subtle">
                    {c._count.prospects} prospect{c._count.prospects !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  STATUS_STYLES[c.status] ?? STATUS_STYLES.DRAFT
                )}
              >
                {c.status}
              </span>
            </div>
            <p className="mt-3 line-clamp-2 text-xs text-ink-tertiary">
              {c.template}
            </p>
          </Link>
        ))}
        {campaigns.length === 0 && (
          <div className="col-span-full rounded-lg border border-dashed border-hairline py-12 text-center text-sm text-ink-subtle">
            Aucune campagne — crée ta première campagne WhatsApp
          </div>
        )}
      </div>
    </div>
  );
}
