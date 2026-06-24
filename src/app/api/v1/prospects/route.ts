import { NextRequest, NextResponse } from "next/server";
import { withApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  return withApiKey(req, async ({ organizationId }) => {
    const url = new URL(req.url);
    const status = (url.searchParams.get("status") ?? undefined) as "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST" | undefined;
    const search = url.searchParams.get("search") ?? undefined;
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 100);
    const page = parseInt(url.searchParams.get("page") ?? "1");

    const where = {
      organizationId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
        ],
      }),
    };

    const [prospects, total] = await Promise.all([
      prisma.prospect.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.prospect.count({ where }),
    ]);

    return NextResponse.json({ prospects, total, page, totalPages: Math.ceil(total / limit) });
  });
}

export async function POST(req: NextRequest) {
  return withApiKey(req, async ({ organizationId, userId }) => {
    const body = await req.json();
    const { name, phone, category, notes, tags, metadata } = body as Record<string, unknown>;

    if (!name || !phone) {
      return NextResponse.json({ error: "name et phone requis" }, { status: 400 });
    }

    const prospect = await prisma.prospect.create({
      data: {
        name: String(name),
        phone: String(phone),
        category: category ? String(category) : null,
        notes: notes ? String(notes) : null,
        tags: Array.isArray(tags) ? tags : [],
        metadata: (metadata && typeof metadata === "object") ? metadata : undefined,
        source: "OTHER",
        organizationId,
        createdById: userId,
      },
    });

    return NextResponse.json({ prospect }, { status: 201 });
  }, "MCP_WRITE");
}
