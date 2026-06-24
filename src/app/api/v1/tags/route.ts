import { NextRequest, NextResponse } from "next/server";
import { withApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  return withApiKey(req, async ({ organizationId }) => {
    const tags = await prisma.tag.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ tags });
  }, 0);
}
