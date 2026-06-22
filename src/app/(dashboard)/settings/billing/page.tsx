"use client";

import { useState, useTransition } from "react";
import { useActiveOrganization } from "@/lib/auth-client";
import { PLANS, type PlanId } from "@/lib/plans";
import { Check, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const { data: org } = useActiveOrganization();
  const [isPending, startTransition] = useTransition();
  const [currentPlan] = useState<PlanId>("free");

  function handleUpgrade(planId: PlanId) {
    if (!org?.id) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planId }),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (data.url) {
          window.location.href = data.url;
        } else {
          toast.error(data.error ?? "Erreur lors du paiement");
        }
      } catch {
        toast.error("Erreur de connexion");
      }
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-headline text-ink">
        Abonnement
      </h1>
      <p className="mt-1 text-sm text-ink-subtle">
        Gère ton plan et tes limites
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-4">
        {(Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]).map(
          ([id, plan]) => {
            const isCurrent = id === currentPlan;
            const isUpgrade =
              Object.keys(PLANS).indexOf(id) >
              Object.keys(PLANS).indexOf(currentPlan);

            return (
              <div
                key={id}
                className={cn(
                  "flex flex-col rounded-lg border p-6",
                  isCurrent
                    ? "border-primary bg-surface-2"
                    : "border-hairline bg-surface-1"
                )}
              >
                <h3 className="text-lg font-semibold tracking-card-title text-ink">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-ink-subtle">
                  {plan.description}
                </p>
                <p className="mt-4 text-3xl font-semibold tracking-headline text-ink">
                  {plan.price === 0 ? "Gratuit" : `${plan.price.toLocaleString("fr-FR")} XOF`}
                  {plan.price > 0 && (
                    <span className="text-base font-normal text-ink-subtle">
                      /mois
                    </span>
                  )}
                </p>

                <ul className="mt-6 flex-1 space-y-2">
                  {[
                    `${isFinite(plan.limits.prospects) ? plan.limits.prospects : "∞"} prospects`,
                    `${isFinite(plan.limits.campaigns) ? plan.limits.campaigns : "∞"} campagnes`,
                    `${isFinite(plan.limits.messagesPerMonth) ? plan.limits.messagesPerMonth : "∞"} messages/mois`,
                    `${plan.limits.members} membre${plan.limits.members > 1 ? "s" : ""}`,
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-ink-muted"
                    >
                      <Check className="h-4 w-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {isCurrent ? (
                    <div className="rounded-md bg-surface-3 px-4 py-2 text-center text-sm text-ink-subtle">
                      Plan actuel
                    </div>
                  ) : isUpgrade ? (
                    <button
                      onClick={() => handleUpgrade(id)}
                      disabled={isPending}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
                    >
                      <Zap className="h-4 w-4" />
                      Passer au {plan.name}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
