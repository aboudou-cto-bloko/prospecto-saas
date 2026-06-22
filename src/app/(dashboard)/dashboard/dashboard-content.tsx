"use client";

import { motion } from "framer-motion";
import { Users, Megaphone, TrendingUp, UserPlus, Zap } from "lucide-react";
import { UsageBar } from "@/components/upgrade-prompt";
import { getNextPlan } from "@/lib/plans";
import Link from "next/link";

type Stats = {
  totalProspects: number;
  newThisWeek: number;
  activeCampaigns: number;
  conversionRate: number;
  usage: {
    plan: string;
    limits: {
      scrapingCredits: number;
      prospects: number;
      campaigns: number;
      messagesPerMonth: number;
      members: number;
    };
    usage: {
      scrapingCreditsUsed: number;
      scrapingCreditsTotal: number;
      prospects: number;
      campaigns: number;
      messagesThisMonth: number;
      members: number;
    };
  };
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 } as const,
  visible: { opacity: 1, y: 0 } as const,
};

export function DashboardContent({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total prospects", value: stats.totalProspects, icon: Users },
    { label: "Nouveaux (7j)", value: stats.newThisWeek, icon: UserPlus },
    { label: "Campagnes actives", value: stats.activeCampaigns, icon: Megaphone },
    { label: "Taux de conversion", value: `${stats.conversionRate}%`, icon: TrendingUp },
  ];

  const plan = stats.usage.plan;
  const nextPlan = getNextPlan(plan);
  const creditsMax = stats.usage.usage.scrapingCreditsTotal || stats.usage.limits.scrapingCredits;
  const creditsUsed = stats.usage.usage.scrapingCreditsUsed;
  const creditsPercent = creditsMax > 0 ? (creditsUsed / creditsMax) * 100 : 0;

  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="text-2xl font-semibold tracking-headline text-ink"
      >
        Dashboard
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mt-1 text-sm text-ink-subtle"
      >
        Vue d&apos;ensemble de ton activité
      </motion.p>

      {/* Plan banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-6 flex items-center justify-between rounded-lg border border-hairline bg-surface-1 px-5 py-3"
      >
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold uppercase text-primary">
            {plan}
          </span>
          <span className="text-sm text-ink-subtle">
            {isFinite(creditsMax) ? (
              <>
                <span className={creditsPercent > 80 ? "font-medium text-warning" : "text-ink"}>
                  {creditsUsed}
                </span>
                {" / "}{creditsMax} crédits
              </>
            ) : (
              "Crédits illimités"
            )}
          </span>
        </div>
        {nextPlan && nextPlan.price > 0 && (
          <Link
            href="/settings/billing"
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-primary-hover hover:scale-[1.02]"
          >
            <Zap className="h-3 w-3" />
            Upgrade → {nextPlan.name}
          </Link>
        )}
      </motion.div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="rounded-lg border border-hairline bg-surface-1 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-subtle">{card.label}</span>
              <card.icon className="h-4 w-4 text-ink-tertiary" />
            </div>
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 200 }}
              className="mt-2 text-2xl font-semibold tracking-headline text-ink"
            >
              {card.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Usage section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-6 rounded-lg border border-hairline bg-surface-1 p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-card-title text-ink">
            Utilisation
          </h2>
          <span className="text-xs text-ink-tertiary">
            Se réinitialise chaque mois
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 lg:grid-cols-3">
          <UsageBar
            label="Crédits scraping"
            used={creditsUsed}
            max={creditsMax}
            showUpgrade
          />
          <UsageBar
            label="Prospects"
            used={stats.usage.usage.prospects}
            max={stats.usage.limits.prospects}
            showUpgrade
          />
          <UsageBar
            label="Campagnes"
            used={stats.usage.usage.campaigns}
            max={stats.usage.limits.campaigns}
            showUpgrade
          />
          <UsageBar
            label="Messages / mois"
            used={stats.usage.usage.messagesThisMonth}
            max={stats.usage.limits.messagesPerMonth}
            showUpgrade
          />
          <UsageBar
            label="Membres"
            used={stats.usage.usage.members}
            max={stats.usage.limits.members}
            showUpgrade
          />
          <UsageBar
            label="Tags"
            used={0}
            max={stats.usage.limits.prospects > 25 ? 100 : 2}
          />
        </div>
      </motion.div>

      {/* Nudge for free/starter */}
      {(plan === "free" || plan === "starter") && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-5"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/20 p-3">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-ink">
                {plan === "free"
                  ? "Tu es limité à 25 prospects et 50 crédits"
                  : "Tes crédits s'épuisent vite ?"}
              </h3>
              <p className="mt-0.5 text-xs text-ink-subtle">
                {plan === "free"
                  ? "Passe au Starter pour débloquer les campagnes WhatsApp et 200 crédits de scraping."
                  : "Le plan Pro te donne 3 000 crédits, 10 campagnes et les actions groupées."}
              </p>
            </div>
            <Link
              href="/settings/billing"
              className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-primary-hover hover:scale-[1.02]"
            >
              {plan === "free" ? "Passer au Starter — 5 000 F" : "Passer au Pro — 15 000 F"}
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
