import { NextRequest, NextResponse } from "next/server";
import { withApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  return withApiKey(req, async ({ organizationId }) => {
    const campaigns = await prisma.campaign.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { prospects: true } } },
    });
    return NextResponse.json({ campaigns });
  });
}

export async function POST(req: NextRequest) {
  return withApiKey(req, async ({ organizationId, userId }) => {
    const { name, template } = (await req.json()) as { name?: string; template?: string };
    if (!name || !template) {
      return NextResponse.json({ error: "name et template requis" }, { status: 400 });
    }
    const campaign = await prisma.campaign.create({
      data: { name, template, organizationId, createdById: userId },
    });
    return NextResponse.json({ campaign }, { status: 201 });
  }, "MCP_WRITE");
}
