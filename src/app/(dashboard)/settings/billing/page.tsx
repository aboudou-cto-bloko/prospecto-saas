"use client";

import { useState, useTransition } from "react";
import { useActiveOrganization } from "@/lib/auth-client";
import { PLANS, CREDIT_PACKS, EXTRA_MEMBER_PRICE, PLAN_ORDER, type PlanId } from "@/lib/plans";
import { Check, Zap, Star, MessageSquare, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const { data: org } = useActiveOrganization();
  const [isPending, startTransition] = useTransition();
  const [currentPlan] = useState<PlanId>("free");

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
    if (!org?.id || planId === "enterprise" || planId === "free") return;
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
        Choisis le plan qui correspond à ton activité
      </p>

      {/* Plans grid */}
      <div className="mt-8 grid gap-4 lg:grid-cols-5">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const isCurrent = id === currentPlan;
          const currentIdx = PLAN_ORDER.indexOf(currentPlan);
          const planIdx = PLAN_ORDER.indexOf(id);
          const isUpgrade = planIdx > currentIdx;
          const isDowngrade = planIdx < currentIdx;

          return (
            <div
              key={id}
              className={cn(
                "relative flex flex-col rounded-lg border p-5",
                plan.popular
                  ? "border-primary bg-surface-2"
                  : isCurrent
                    ? "border-primary/50 bg-surface-1"
                    : "border-hairline bg-surface-1"
              )}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 whitespace-nowrap rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  <Star className="h-3 w-3" /> POPULAIRE
                </span>
              )}

              <h3 className="text-base font-semibold tracking-card-title text-ink">
                {plan.name}
              </h3>
              <p className="mt-0.5 text-[11px] text-ink-subtle">
                {plan.description}
              </p>
              <p className="mt-3 text-xl font-semibold tracking-headline text-ink">
                {plan.price === 0 && id === "free"
                  ? "Gratuit"
                  : plan.price === 0
                    ? "Sur devis"
                    : `${plan.price.toLocaleString("fr-FR")} F`}
                {plan.price > 0 && (
                  <span className="text-xs font-normal text-ink-subtle">
                    /mois
                  </span>
                )}
              </p>

              <ul className="mt-4 flex-1 space-y-1.5">
                {[
                  `${isFinite(plan.limits.scrapingCredits) ? plan.limits.scrapingCredits : "∞"} crédits`,
                  `${isFinite(plan.limits.prospects) ? plan.limits.prospects : "∞"} prospects`,
                  plan.limits.campaigns === 0
                    ? "Pas de campagnes"
                    : `${isFinite(plan.limits.campaigns) ? plan.limits.campaigns : "∞"} campagne${plan.limits.campaigns > 1 ? "s" : ""}`,
                  plan.limits.messagesPerMonth === 0
                    ? "Pas d'envoi WhatsApp"
                    : `${isFinite(plan.limits.messagesPerMonth) ? plan.limits.messagesPerMonth : "∞"} msg/mois`,
                  `${isFinite(plan.limits.members) ? plan.limits.members : "∞"} membre${plan.limits.members > 1 ? "s" : ""}`,
                ].map((feature) => {
                  const blocked = feature.startsWith("Pas de");
                  return (
                    <li
                      key={feature}
                      className={cn(
                        "flex items-center gap-1.5 text-[11px]",
                        blocked ? "text-ink-tertiary" : "text-ink-muted"
                      )}
                    >
                      {blocked ? (
                        <X className="h-3 w-3 shrink-0 text-ink-tertiary" />
                      ) : (
                        <Check className="h-3 w-3 shrink-0 text-success" />
                      )}
                      {feature}
                    </li>
                  );
                })}
                {plan.limits.canBulkActions && (
                  <li className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                    <Check className="h-3 w-3 shrink-0 text-success" />
                    Actions groupées
                  </li>
                )}
                {plan.limits.canExportCsv && (
                  <li className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                    <Check className="h-3 w-3 shrink-0 text-success" />
                    Export CSV
                  </li>
                )}
              </ul>

              <div className="mt-4">
                {isCurrent ? (
                  <div className="rounded-md bg-surface-3 px-3 py-1.5 text-center text-xs text-ink-subtle">
                    Plan actuel
                  </div>
                ) : id === "enterprise" ? (
                  <a
                    href={`https://wa.me/2290167266360?text=${encodeURIComponent("Bonjour, je souhaite en savoir plus sur le plan Enterprise de Prospecto.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-1.5 rounded-md border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    <MessageSquare className="h-3 w-3" /> Contacter
                  </a>
                ) : id === "free" ? null : isUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(id)}
                    disabled={isPending}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-primary-hover hover:scale-[1.01] disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                    Passer au {plan.name}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Credit packs */}
      <div className="mt-10 rounded-lg border border-hairline bg-surface-1 p-6">
        <h2 className="text-lg font-semibold tracking-card-title text-ink">
          Packs de crédits supplémentaires
        </h2>
        <p className="mt-1 text-sm text-ink-subtle">
          Tes crédits sont épuisés ? Achète un pack pour continuer à scraper.
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
                className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
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
