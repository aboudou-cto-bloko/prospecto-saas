import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "moneroo";
import { activateSubscription } from "@/lib/subscription";

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

  if (event.event === "payment.success" && metadata?.organizationId && metadata?.plan) {
    await activateSubscription(
      metadata.organizationId,
      metadata.plan as "freelance" | "pro" | "enterprise",
      String(data.id ?? "")
    );
  }

  return NextResponse.json({ received: true, event: event.event });
}
