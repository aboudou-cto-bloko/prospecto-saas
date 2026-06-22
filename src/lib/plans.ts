export type PlanLimits = {
  prospects: number;
  campaigns: number;
  messagesPerMonth: number;
  scrapingCredits: number;
  customFields: number;
  tags: number;
  members: number;
};

export type PlanId = "starter" | "pro" | "business" | "enterprise";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  price: number;
  limits: PlanLimits;
  description: string;
  popular?: boolean;
};

export const PLANS: Record<PlanId, PlanDefinition> = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 5000,
    description: "Pour démarrer la prospection",
    limits: {
      prospects: 500,
      campaigns: 3,
      messagesPerMonth: 200,
      scrapingCredits: 1000,
      customFields: 3,
      tags: 10,
      members: 1,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 15000,
    description: "Pour les équipes commerciales",
    popular: true,
    limits: {
      prospects: 3000,
      campaigns: 15,
      messagesPerMonth: 1500,
      scrapingCredits: 5000,
      customFields: 10,
      tags: 50,
      members: 5,
    },
  },
  business: {
    id: "business",
    name: "Business",
    price: 35000,
    description: "Pour les équipes structurées",
    limits: {
      prospects: 15000,
      campaigns: 50,
      messagesPerMonth: 5000,
      scrapingCredits: 20000,
      customFields: 30,
      tags: 200,
      members: 15,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 0,
    description: "Déploiement personnalisé, sur devis",
    limits: {
      prospects: Infinity,
      campaigns: Infinity,
      messagesPerMonth: Infinity,
      scrapingCredits: Infinity,
      customFields: Infinity,
      tags: Infinity,
      members: Infinity,
    },
  },
} as const;

export const EXTRA_MEMBER_PRICE = 3000;

export const CREDIT_PACKS = [
  { credits: 1000, price: 2000 },
  { credits: 5000, price: 8000 },
  { credits: 20000, price: 25000 },
] as const;

export function getPlanLimits(planId: string): PlanLimits {
  const plan = PLANS[planId as PlanId];
  if (!plan) return PLANS.starter.limits;
  return plan.limits;
}
