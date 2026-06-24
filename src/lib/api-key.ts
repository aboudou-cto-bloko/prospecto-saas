import { prisma } from "./prisma";
import crypto from "node:crypto";

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const raw = crypto.randomBytes(32).toString("base64url");
  const key = `psk_${raw}`;
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const prefix = key.slice(0, 12);
  return { key, hash, prefix };
}

export async function validateApiKey(key: string) {
  if (!key.startsWith("psk_")) return null;
  const hash = crypto.createHash("sha256").update(key).digest("hex");

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    include: { organization: true },
  });

  if (!apiKey) return null;
  if (apiKey.expiresAt && new Date() > apiKey.expiresAt) return null;

  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});

  return {
    organizationId: apiKey.organizationId,
    organization: apiKey.organization,
    apiKeyId: apiKey.id,
    createdById: apiKey.createdById,
  };
}

export async function createApiKey(organizationId: string, name: string, createdById: string) {
  const { key, hash, prefix } = generateApiKey();
  await prisma.apiKey.create({
    data: {
      organizationId,
      name,
      keyHash: hash,
      keyPrefix: prefix,
      createdById,
    },
  });
  return key;
}

export async function listApiKeys(organizationId: string) {
  return prisma.apiKey.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeApiKey(id: string, organizationId: string) {
  await prisma.apiKey.delete({
    where: { id, organizationId },
  });
}
