"use client";

import { useState, useTransition } from "react";
import { useActiveOrganization } from "@/lib/auth-client";
import { PLANS, CREDIT_PACKS, EXTRA_MEMBER_PRICE, type PlanId } from "@/lib/plans";
import { Check, Zap, Star, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const { data: org } = useActiveOrganization();
  const [isPending, startTransition] = useTransition();
  const [currentPlan] = useState<PlanId>("starter");

  function handleBuyCredits(credits: number) {
    if (!org?.id) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/billing/credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credits }),
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

  function handleUpgrade(planId: PlanId) {
    if (!org?.id || planId === "enterprise") return;
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
        Gère ton plan, tes crédits et tes limites
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-4">
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
                  "relative flex flex-col rounded-lg border p-6",
                  plan.popular
                    ? "border-primary bg-surface-2"
                    : isCurrent
                      ? "border-primary/50 bg-surface-1"
                      : "border-hairline bg-surface-1"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold text-white">
                    <Star className="h-3 w-3" /> POPULAIRE
                  </span>
                )}

                <h3 className="text-lg font-semibold tracking-card-title text-ink">
                  {plan.name}
                </h3>
                <p className="mt-1 text-xs text-ink-subtle">
                  {plan.description}
                </p>
                <p className="mt-4 text-2xl font-semibold tracking-headline text-ink">
                  {plan.price === 0
                    ? "Sur devis"
                    : `${plan.price.toLocaleString("fr-FR")} F`}
                  {plan.price > 0 && (
                    <span className="text-sm font-normal text-ink-subtle">
                      /mois
                    </span>
                  )}
                </p>

                <ul className="mt-5 flex-1 space-y-2">
                  {[
                    `${isFinite(plan.limits.scrapingCredits) ? plan.limits.scrapingCredits.toLocaleString("fr-FR") : "Illimité"} crédits scraping`,
                    `${isFinite(plan.limits.prospects) ? plan.limits.prospects.toLocaleString("fr-FR") : "Illimité"} prospects`,
                    `${isFinite(plan.limits.campaigns) ? plan.limits.campaigns : "Illimité"} campagnes`,
                    `${isFinite(plan.limits.messagesPerMonth) ? plan.limits.messagesPerMonth.toLocaleString("fr-FR") : "Illimité"} messages/mois`,
                    `${isFinite(plan.limits.members) ? plan.limits.members : "Illimité"} membre${plan.limits.members > 1 ? "s" : ""}`,
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-xs text-ink-muted"
                    >
                      <Check className="h-3.5 w-3.5 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  {isCurrent ? (
                    <div className="rounded-md bg-surface-3 px-4 py-2 text-center text-sm text-ink-subtle">
                      Plan actuel
                    </div>
                  ) : id === "enterprise" ? (
                    <a
                      href={`https://wa.me/2290167266360?text=${encodeURIComponent("Bonjour, je souhaite en savoir plus sur le plan Enterprise de Prospecto.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Nous contacter
                    </a>
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

      <div className="mt-10 rounded-lg border border-hairline bg-surface-1 p-6">
        <h2 className="text-lg font-semibold tracking-card-title text-ink">
          Packs de crédits supplémentaires
        </h2>
        <p className="mt-1 text-sm text-ink-subtle">
          Besoin de plus de scraping ? Achetez des crédits en supplément.
          {EXTRA_MEMBER_PRICE > 0 && (
            <span>
              {" "}Membre supplémentaire : {EXTRA_MEMBER_PRICE.toLocaleString("fr-FR")} F/mois.
            </span>
          )}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.credits}
              className="flex items-center justify-between rounded-md border border-hairline bg-canvas p-4"
            >
              <div>
                <p className="text-sm font-medium text-ink">
                  {pack.credits.toLocaleString("fr-FR")} crédits
                </p>
                <p className="text-xs text-ink-subtle">
                  {(pack.price / pack.credits).toFixed(1)} F/crédit
                </p>
              </div>
              <button
                onClick={() => handleBuyCredits(pack.credits)}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-md bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                {pack.price.toLocaleString("fr-FR")} F
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
