import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/org-context";
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/api-key";

export async function GET() {
  try {
    const { organizationId } = await requireRole("owner", "admin");
    const keys = await listApiKeys(organizationId);
    return NextResponse.json({ keys });
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId, user } = await requireRole("owner");
    const { name } = (await req.json()) as { name?: string };
    if (!name) return NextResponse.json({ error: "name requis" }, { status: 400 });

    const key = await createApiKey(organizationId, name, user.id);
    return NextResponse.json({ key, message: "Conserve cette clé — elle ne sera plus affichée." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { organizationId } = await requireRole("owner");
    const { id } = (await req.json()) as { id?: string };
    if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

    await revokeApiKey(id, organizationId);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
