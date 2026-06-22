"use server";

import { prisma } from "@/lib/prisma";
import { requireOrg, requireRole } from "@/lib/org-context";
import { assertCustomFieldLimit } from "@/lib/limits";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createFieldSchema = z.object({
  name: z.string().min(1).regex(/^[a-z_]+$/, "Slug en minuscules avec underscores"),
  label: z.string().min(1),
});

export async function getCustomFields() {
  const { organizationId } = await requireOrg();
  return prisma.customField.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
  });
}

export async function createCustomField(data: z.input<typeof createFieldSchema>) {
  const { organizationId } = await requireRole("owner", "admin");
  const parsed = createFieldSchema.parse(data);
  await assertCustomFieldLimit(organizationId);

  const field = await prisma.customField.create({
    data: { ...parsed, organizationId },
  });

  revalidatePath("/prospects");
  revalidatePath("/campaigns");
  return field;
}

export async function deleteCustomField(id: string) {
  const { organizationId } = await requireRole("owner", "admin");

  await prisma.customField.delete({
    where: { id, organizationId },
  });

  revalidatePath("/prospects");
  revalidatePath("/campaigns");
}
