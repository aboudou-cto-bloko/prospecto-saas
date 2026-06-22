export type PlanLimits = {
  prospects: number;
  campaigns: number;
  messagesPerMonth: number;
  customFields: number;
  tags: number;
  members: number;
};

export type PlanId = "free" | "freelance" | "pro" | "enterprise";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  price: number;
  limits: PlanLimits;
  description: string;
};

export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Gratuit",
    price: 0,
    description: "Pour découvrir Prospecto",
    limits: {
      prospects: 50,
      campaigns: 2,
      messagesPerMonth: 30,
      customFields: 1,
      tags: 5,
      members: 1,
    },
  },
  freelance: {
    id: "freelance",
    name: "Freelance",
    price: 5000,
    description: "Pour les indépendants et petites équipes",
    limits: {
      prospects: 300,
      campaigns: 5,
      messagesPerMonth: 200,
      customFields: 3,
      tags: 10,
      members: 2,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 15000,
    description: "Pour les équipes commerciales",
    limits: {
      prospects: 2000,
      campaigns: 20,
      messagesPerMonth: 1500,
      customFields: 10,
      tags: 50,
      members: 5,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 40000,
    description: "Pour les grandes équipes",
    limits: {
      prospects: Infinity,
      campaigns: Infinity,
      messagesPerMonth: Infinity,
      customFields: Infinity,
      tags: Infinity,
      members: 20,
    },
  },
} as const;

export function getPlanLimits(planId: string): PlanLimits {
  const plan = PLANS[planId as PlanId];
  if (!plan) return PLANS.free.limits;
  return plan.limits;
}
