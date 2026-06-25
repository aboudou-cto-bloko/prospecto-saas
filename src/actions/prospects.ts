"use server";

import { prisma } from "@/lib/prisma";
import { requireOrg, requireRole } from "@/lib/org-context";
import { assertProspectLimit } from "@/lib/limits";
import { consumeCredits } from "@/lib/credits";
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
  sort?: string;
  order?: "asc" | "desc";
}) {
  const { organizationId } = await requireOrg();
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 50;

  const sortField = filters?.sort ?? "createdAt";
  const sortOrder = filters?.order ?? "desc";
  const allowedSorts = ["name", "phone", "status", "createdAt", "category"];
  const safeSort = allowedSorts.includes(sortField) ? sortField : "createdAt";

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
      orderBy: { [safeSort]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.prospect.count({ where }),
  ]);

  return { prospects, total, page, totalPages: Math.ceil(total / limit) };
}

export async function bulkDeleteProspects(ids: string[]) {
  const { organizationId } = await requireRole("owner", "admin");

  await prisma.prospect.deleteMany({
    where: { id: { in: ids }, organizationId },
  });

  revalidatePath("/prospects");
}

export async function bulkUpdateStatus(ids: string[], status: ProspectStatus) {
  const { organizationId } = await requireOrg();

  await prisma.prospect.updateMany({
    where: { id: { in: ids }, organizationId },
    data: { status },
  });

  revalidatePath("/prospects");
}

export async function updateProspectTags(id: string, tags: string[]) {
  const { organizationId } = await requireOrg();

  await prisma.prospect.update({
    where: { id, organizationId },
    data: { tags },
  });

  revalidatePath("/prospects");
}

export async function updateProspect(
  id: string,
  data: {
    name?: string;
    phone?: string;
    website?: string;
    category?: string;
    notes?: string;
    metadata?: Record<string, string>;
  }
) {
  const { organizationId } = await requireOrg();

  await prisma.prospect.update({
    where: { id, organizationId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.website !== undefined && { website: data.website || null }),
      ...(data.category !== undefined && { category: data.category || null }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
      ...(data.metadata !== undefined && { metadata: data.metadata }),
    },
  });

  revalidatePath("/prospects");
}

export async function getProspect(id: string) {
  const { organizationId } = await requireOrg();
  return prisma.prospect.findFirstOrThrow({
    where: { id, organizationId },
  });
}

export async function importProspects(
  rows: { name: string; phone: string; metadata?: Record<string, string> }[]
) {
  const { organizationId, user } = await requireOrg();
  await consumeCredits(organizationId, "IMPORT_CSV_PER_ROW", rows.length);
  await assertProspectLimit(organizationId, rows.length);

  let added = 0;
  for (const row of rows) {
    try {
      await prisma.prospect.create({
        data: {
          name: row.name,
          phone: row.phone,
          source: "OTHER",
          organizationId,
          createdById: user.id,
          metadata: row.metadata ?? undefined,
        },
      });
      added++;
    } catch {
      // duplicate phone — skip
    }
  }

  revalidatePath("/prospects");
  return { added, total: rows.length, skipped: rows.length - added };
}
