import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/org-context";
import { CREDIT_PACKS } from "@/lib/plans";
import { Moneroo } from "moneroo";
import { z } from "zod";

const creditsSchema = z.object({
  credits: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const { organizationId, user } = await requireRole("owner");
    const body = creditsSchema.parse(await req.json());

    const pack = CREDIT_PACKS.find((p) => p.credits === body.credits);
    if (!pack) {
      return NextResponse.json({ error: "Pack invalide" }, { status: 400 });
    }

    const moneroo = new Moneroo({
      secretKey: process.env.MONEROO_SECRET_KEY!,
    });

    const result = await moneroo.payments.initialize({
      amount: pack.price,
      currency: "XOF",
      description: `Prospecto — ${pack.credits.toLocaleString("fr-FR")} crédits scraping`,
      return_url: `${process.env.BETTER_AUTH_URL}/settings/billing?credits=success`,
      customer: {
        email: user.email,
        first_name: user.name.split(" ")[0] ?? user.name,
        last_name: user.name.split(" ").slice(1).join(" ") || user.name,
      },
      metadata: {
        organizationId,
        type: "credits",
        credits: String(pack.credits),
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
      return NextResponse.json({ error: "Pack invalide" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
