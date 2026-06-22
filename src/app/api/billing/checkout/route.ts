import { NextRequest, NextResponse } from "next/server";
import { requireOrg } from "@/lib/org-context";
import { PLANS, type PlanId } from "@/lib/plans";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["freelance", "pro", "enterprise"]),
});

export async function POST(req: NextRequest) {
  try {
    const { organizationId } = await requireOrg();
    const body = checkoutSchema.parse(await req.json());
    const plan = PLANS[body.plan as PlanId];

    const res = await fetch("https://api.moneroo.io/v1/payments/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MONEROO_SECRET_KEY}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount: plan.price,
        currency: "XOF",
        description: `Prospecto ${plan.name} — Abonnement mensuel`,
        customer: { email: "billing@prospecto.app" },
        return_url: `${process.env.BETTER_AUTH_URL}/settings/billing?success=true`,
        metadata: {
          organizationId,
          plan: body.plan,
        },
      }),
    });

    const data = (await res.json()) as { data?: { checkout_url?: string } };
    if (!res.ok || !data.data?.checkout_url) {
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
