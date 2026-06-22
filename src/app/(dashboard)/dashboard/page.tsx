import { getDashboardStats } from "@/actions/dashboard";
import { Users, Megaphone, TrendingUp, UserPlus } from "lucide-react";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Total prospects",
      value: stats.totalProspects,
      icon: Users,
    },
    {
      label: "Nouveaux (7j)",
      value: stats.newThisWeek,
      icon: UserPlus,
    },
    {
      label: "Campagnes actives",
      value: stats.activeCampaigns,
      icon: Megaphone,
    },
    {
      label: "Taux de conversion",
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-headline text-ink">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-ink-subtle">
        Vue d&apos;ensemble de ton activité
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-hairline bg-surface-1 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-subtle">{card.label}</span>
              <card.icon className="h-4 w-4 text-ink-tertiary" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-headline text-ink">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-hairline bg-surface-1 p-6">
        <h2 className="text-lg font-semibold tracking-card-title text-ink">
          Utilisation du plan
        </h2>
        <p className="mt-1 text-sm text-ink-subtle">
          Plan actuel : <span className="capitalize text-ink">{stats.usage.plan}</span>
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: "Prospects", used: stats.usage.usage.prospects, max: stats.usage.limits.prospects },
            { label: "Campagnes", used: stats.usage.usage.campaigns, max: stats.usage.limits.campaigns },
            { label: "Messages/mois", used: stats.usage.usage.messagesThisMonth, max: stats.usage.limits.messagesPerMonth },
            { label: "Champs perso", used: stats.usage.usage.customFields, max: stats.usage.limits.customFields },
            { label: "Tags", used: stats.usage.usage.tags, max: stats.usage.limits.tags },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-ink-subtle">{item.label}</p>
              <p className="mt-1 text-sm font-medium text-ink">
                {item.used} / {isFinite(item.max) ? item.max : "∞"}
              </p>
              {isFinite(item.max) && (
                <div className="mt-1.5 h-1.5 rounded-full bg-surface-3">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min((item.used / item.max) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
