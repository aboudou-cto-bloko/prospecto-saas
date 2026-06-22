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
    description: "Pour découvrir Prospecto",
    limits: {
      prospects: 100,
      campaigns: 1,
      messagesPerMonth: 50,
      scrapingCredits: 200,
      customFields: 1,
      tags: 3,
      members: 1,
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
  { credits: 500, price: 2000 },
  { credits: 2000, price: 6000 },
  { credits: 10000, price: 20000 },
] as const;

export function getPlanLimits(planId: string): PlanLimits {
  const plan = PLANS[planId as PlanId];
  if (!plan) return PLANS.starter.limits;
  return plan.limits;
}
