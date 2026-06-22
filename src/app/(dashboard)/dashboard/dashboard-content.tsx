"use client";

import { motion } from "framer-motion";
import { Users, Megaphone, TrendingUp, UserPlus } from "lucide-react";

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

  const usageItems = [
    { label: "Crédits scraping", used: stats.usage.usage.scrapingCreditsUsed, max: stats.usage.usage.scrapingCreditsTotal || stats.usage.limits.scrapingCredits },
    { label: "Prospects", used: stats.usage.usage.prospects, max: stats.usage.limits.prospects },
    { label: "Campagnes", used: stats.usage.usage.campaigns, max: stats.usage.limits.campaigns },
    { label: "Messages/mois", used: stats.usage.usage.messagesThisMonth, max: stats.usage.limits.messagesPerMonth },
    { label: "Membres", used: stats.usage.usage.members, max: stats.usage.limits.members },
  ];

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

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ delay: i * 0.08, duration: 0.4 }}
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
              transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 200 }}
              className="mt-2 text-2xl font-semibold tracking-headline text-ink"
            >
              {card.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="mt-8 rounded-lg border border-hairline bg-surface-1 p-6"
      >
        <h2 className="text-lg font-semibold tracking-card-title text-ink">
          Utilisation du plan
        </h2>
        <p className="mt-1 text-sm text-ink-subtle">
          Plan actuel : <span className="capitalize text-ink">{stats.usage.plan}</span>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {usageItems.map((item, i) => {
            const percent = isFinite(item.max) && item.max > 0
              ? Math.min((item.used / item.max) * 100, 100)
              : 0;
            const isWarning = percent > 80;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.06 }}
              >
                <p className="text-xs text-ink-subtle">{item.label}</p>
                <p className="mt-1 text-sm font-medium text-ink">
                  {item.used} / {isFinite(item.max) ? item.max : "∞"}
                </p>
                {isFinite(item.max) && (
                  <div className="mt-1.5 h-1.5 rounded-full bg-surface-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                      className={`h-1.5 rounded-full ${isWarning ? "bg-warning" : "bg-primary"}`}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
