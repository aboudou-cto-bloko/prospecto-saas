"use server";

import { prisma } from "@/lib/prisma";
import { requireOrg, requireRole } from "@/lib/org-context";
import { assertTagLimit } from "@/lib/limits";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createTagSchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export async function createTag(data: z.infer<typeof createTagSchema>) {
  const { organizationId } = await requireOrg();
  const parsed = createTagSchema.parse(data);

  await assertTagLimit(organizationId);

  const tag = await prisma.tag.create({
    data: { ...parsed, organizationId },
  });

  revalidatePath("/prospects");
  return tag;
}

export async function getTags() {
  const { organizationId } = await requireOrg();

  return prisma.tag.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function deleteTag(id: string) {
  const { organizationId } = await requireRole("owner", "admin");

  await prisma.tag.delete({
    where: { id, organizationId },
  });

  revalidatePath("/prospects");
}
