import { NextRequest, NextResponse } from "next/server";
import { withApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withApiKey(req, async ({ organizationId }) => {
    const prospect = await prisma.prospect.findFirst({
      where: { id, organizationId },
    });
    if (!prospect) return NextResponse.json({ error: "Prospect non trouvé" }, { status: 404 });
    return NextResponse.json({ prospect });
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withApiKey(req, async ({ organizationId }) => {
    const body = await req.json();
    const { name, phone, status, category, notes, tags, metadata } = body as Record<string, unknown>;

    const prospect = await prisma.prospect.update({
      where: { id, organizationId },
      data: {
        ...(name !== undefined && { name: String(name) }),
        ...(phone !== undefined && { phone: String(phone) }),
        ...(status !== undefined && { status: String(status) as "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST" }),
        ...(category !== undefined && { category: category ? String(category) : null }),
        ...(notes !== undefined && { notes: notes ? String(notes) : null }),
        ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : undefined }),
        ...(metadata !== undefined && { metadata: (metadata && typeof metadata === "object") ? metadata : undefined }),
      },
    });

    return NextResponse.json({ prospect });
  }, "MCP_WRITE");
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withApiKey(req, async ({ organizationId }) => {
    await prisma.prospect.delete({ where: { id, organizationId } });
    return NextResponse.json({ deleted: true });
  });
}
