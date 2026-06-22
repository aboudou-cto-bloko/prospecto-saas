"use server";

import { prisma } from "@/lib/prisma";
import { requireOrg, requireRole } from "@/lib/org-context";
import { assertProspectLimit } from "@/lib/limits";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ProspectStatus, Source } from "@/generated/prisma/client";

const createProspectSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(5),
  website: z.string().url().optional().or(z.literal("")),
  source: z.enum(["GOAFRICA_ONLINE", "REFERRAL", "DIRECT", "OTHER"]).default("DIRECT"),
  category: z.string().optional(),
  notes: z.string().optional(),
});

export async function createProspect(data: z.input<typeof createProspectSchema>) {
  const { organizationId, user } = await requireOrg();
  const parsed = createProspectSchema.parse(data);

  await assertProspectLimit(organizationId);

  const prospect = await prisma.prospect.create({
    data: {
      ...parsed,
      website: parsed.website || null,
      organizationId,
      createdById: user.id,
    },
  });

  revalidatePath("/prospects");
  return prospect;
}

export async function updateProspectStatus(id: string, status: ProspectStatus) {
  const { organizationId } = await requireOrg();

  const prospect = await prisma.prospect.update({
    where: { id, organizationId },
    data: { status },
  });

  revalidatePath("/prospects");
  return prospect;
}

export async function deleteProspect(id: string) {
  const { organizationId } = await requireRole("owner", "admin");

  await prisma.prospect.delete({
    where: { id, organizationId },
  });

  revalidatePath("/prospects");
}

export async function getProspects(filters?: {
  status?: ProspectStatus;
  source?: Source;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { organizationId } = await requireOrg();
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 50;

  const where = {
    organizationId,
    ...(filters?.status && { status: filters.status }),
    ...(filters?.source && { source: filters.source }),
    ...(filters?.search && {
      OR: [
        { name: { contains: filters.search, mode: "insensitive" as const } },
        { phone: { contains: filters.search } },
        { category: { contains: filters.search, mode: "insensitive" as const } },
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

  return { prospects, total, page, totalPages: Math.ceil(total / limit) };
}
