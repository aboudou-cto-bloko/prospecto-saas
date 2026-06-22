import { NextRequest, NextResponse } from "next/server";
import { requireOrg } from "@/lib/org-context";
import { PLANS, type PlanId } from "@/lib/plans";
import { Moneroo } from "moneroo";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["freelance", "pro", "enterprise"]),
});

export async function POST(req: NextRequest) {
  try {
    const { organizationId, user } = await requireOrg();
    const body = checkoutSchema.parse(await req.json());
    const plan = PLANS[body.plan as PlanId];

    const moneroo = new Moneroo({
      secretKey: process.env.MONEROO_SECRET_KEY!,
    });

    const result = await moneroo.payments.initialize({
      amount: plan.price,
      currency: "XOF",
      description: `Prospecto ${plan.name} — Abonnement mensuel`,
      return_url: `${process.env.BETTER_AUTH_URL}/settings/billing?success=true`,
      customer: {
        email: user.email,
        first_name: user.name.split(" ")[0] ?? user.name,
        last_name: user.name.split(" ").slice(1).join(" ") || user.name,
      },
      metadata: {
        organizationId,
        plan: body.plan,
      },
    });

    const data = result as unknown as { data?: { checkout_url?: string } };
    if (!data.data?.checkout_url) {
      return NextResponse.json(
        { error: "Échec de la création du paiement" },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: data.data.checkout_url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
