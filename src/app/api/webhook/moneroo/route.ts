import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "moneroo";
import { activateSubscription } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import type { PlanId } from "@/lib/plans";
import { PLANS } from "@/lib/plans";
import React from "react";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-moneroo-signature") ?? "";
  const secret = process.env.MONEROO_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: ReturnType<typeof constructWebhookEvent>;
  try {
    event = constructWebhookEvent(raw, signature, secret);
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  const data = event.data as Record<string, unknown>;
  const metadata = data.metadata as
    | { organizationId?: string; plan?: string }
    | undefined;

  if (
    event.event === "payment.success" &&
    metadata?.organizationId &&
    metadata?.plan
  ) {
    const sub = await activateSubscription(
      metadata.organizationId,
      metadata.plan as PlanId,
      String(data.id ?? "")
    );

    // Envoyer email de confirmation
    try {
      const org = await prisma.organization.findUnique({
        where: { id: metadata.organizationId },
        include: { members: { where: { role: "owner" }, include: { user: true } } },
      });
      const owner = org?.members[0]?.user;
      if (owner) {
        const { sendMail } = await import("@/lib/mailer");
        const { SubscriptionActivatedEmail } = await import(
          "@/emails/subscription-activated"
        );
        const plan = PLANS[metadata.plan as PlanId];
        await sendMail(
          owner.email,
          `Abonnement ${plan?.name ?? metadata.plan} activé`,
          React.createElement(SubscriptionActivatedEmail, {
            orgName: org.name,
            planName: plan?.name ?? metadata.plan,
            expiresAt: sub.currentPeriodEnd.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          })
        );
      }
    } catch {
      // Never block webhook response
    }
  }

  return NextResponse.json({ received: true, event: event.event });
}
