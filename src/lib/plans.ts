export type PlanLimits = {
  prospects: number;
  campaigns: number;
  messagesPerMonth: number;
  scrapingCredits: number;
  customFields: number;
  tags: number;
  members: number;
  canExportCsv: boolean;
  canBulkActions: boolean;
  canInviteMembers: boolean;
};

export type PlanId = "free" | "starter" | "pro" | "business" | "enterprise";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  price: number;
  limits: PlanLimits;
  description: string;
  popular?: boolean;
};

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    description: "Découvre Prospecto",
    limits: {
      prospects: 25,
      campaigns: 0,
      messagesPerMonth: 0,
      scrapingCredits: 50,
      customFields: 0,
      tags: 2,
      members: 1,
      canExportCsv: false,
      canBulkActions: false,
      canInviteMembers: false,
    },
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 5000,
    description: "Pour démarrer la prospection",
    limits: {
      prospects: 100,
      campaigns: 1,
      messagesPerMonth: 50,
      scrapingCredits: 200,
      customFields: 1,
      tags: 3,
      members: 1,
      canExportCsv: false,
      canBulkActions: false,
      canInviteMembers: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 15000,
    description: "Pour les commerciaux sérieux",
    popular: true,
    limits: {
      prospects: 1500,
      campaigns: 10,
      messagesPerMonth: 800,
      scrapingCredits: 3000,
      customFields: 5,
      tags: 20,
      members: 3,
      canExportCsv: true,
      canBulkActions: true,
      canInviteMembers: true,
    },
  },
  business: {
    id: "business",
    name: "Business",
    price: 35000,
    description: "Pour les équipes structurées",
    limits: {
      prospects: 10000,
      campaigns: 40,
      messagesPerMonth: 5000,
      scrapingCredits: 15000,
      customFields: 20,
      tags: 100,
      members: 10,
      canExportCsv: true,
      canBulkActions: true,
      canInviteMembers: true,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 0,
    description: "Déploiement personnalisé",
    limits: {
      prospects: Infinity,
      campaigns: Infinity,
      messagesPerMonth: Infinity,
      scrapingCredits: Infinity,
      customFields: Infinity,
      tags: Infinity,
      members: Infinity,
      canExportCsv: true,
      canBulkActions: true,
      canInviteMembers: true,
    },
  },
} as const;

export const EXTRA_MEMBER_PRICE = 3000;

export const CREDIT_PACKS = [
  { credits: 500, price: 2000 },
  { credits: 2000, price: 6000 },
  { credits: 10000, price: 20000 },
] as const;

export function getPlanLimits(planId: string): PlanLimits {
  const plan = PLANS[planId as PlanId];
  if (!plan) return PLANS.free.limits;
  return plan.limits;
}

export const PLAN_ORDER: PlanId[] = ["free", "starter", "pro", "business", "enterprise"];

export function getNextPlan(currentPlan: string): PlanDefinition | null {
  const idx = PLAN_ORDER.indexOf(currentPlan as PlanId);
  if (idx === -1 || idx >= PLAN_ORDER.length - 1) return null;
  return PLANS[PLAN_ORDER[idx + 1]];
}
