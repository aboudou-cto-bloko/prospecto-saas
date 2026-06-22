import { NextRequest, NextResponse } from "next/server";
import { activateSubscription } from "@/lib/subscription";
import { z } from "zod";
import crypto from "node:crypto";

const monerooEventSchema = z.object({
  event: z.string(),
  data: z.object({
    id: z.string(),
    status: z.string(),
    metadata: z
      .object({
        organizationId: z.string(),
        plan: z.string(),
      })
      .optional(),
  }),
});

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.MONEROO_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-moneroo-signature") ?? "";

  if (!verifySignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const parsed = monerooEventSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { event, data } = parsed.data;

  if (event === "payment.success" && data.metadata) {
    const { organizationId, plan } = data.metadata;
    await activateSubscription(
      organizationId,
      plan as "freelance" | "pro" | "enterprise",
      data.id
    );
  }

  return NextResponse.json({ received: true });
}
