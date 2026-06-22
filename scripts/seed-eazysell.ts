import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { scrypt, randomBytes } from "node:crypto";
import crypto from "crypto";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const SCRYPT_CONFIG = { N: 16384, r: 16, p: 1, dkLen: 64 };

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(
      password.normalize("NFKC"),
      salt,
      SCRYPT_CONFIG.dkLen,
      { N: SCRYPT_CONFIG.N, r: SCRYPT_CONFIG.r, p: SCRYPT_CONFIG.p, maxmem: 128 * SCRYPT_CONFIG.N * SCRYPT_CONFIG.r * 2 },
      (err, key) => {
        if (err) reject(err);
        else resolve(`${salt}:${key.toString("hex")}`);
      }
    );
  });
}

async function main() {
  const userId = crypto.randomUUID();
  const orgId = crypto.randomUUID();
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setDate(periodEnd.getDate() + 30);

  // 1. User
  await prisma.user.create({
    data: {
      id: userId,
      name: "François Aboudou Zinsou",
      email: "aboudouzinsou@yahoo.com",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  });
  console.log("✓ User: aboudouzinsou@yahoo.com");

  // 2. Account
  const hash = await hashPassword("Eazysell2026!");
  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: hash,
      createdAt: now,
      updatedAt: now,
    },
  });
  console.log("✓ Account credential");

  // 3. Organization
  await prisma.organization.create({
    data: {
      id: orgId,
      name: "Eazysell",
      slug: "eazysell",
      createdAt: now,
    },
  });
  console.log("✓ Org: Eazysell");

  // 4. Membership
  await prisma.member.create({
    data: {
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId,
      role: "owner",
      createdAt: now,
    },
  });
  console.log("✓ Member: owner");

  // 5. Subscription Pro
  await prisma.subscription.create({
    data: {
      organizationId: orgId,
      plan: "pro",
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });
  console.log("✓ Subscription: Pro (30j)");

  // 6. Tags
  const tags = [
    { name: "chaud", color: "#ef4444" },
    { name: "à relancer", color: "#f59e0b" },
    { name: "carte laissée", color: "#3b82f6" },
    { name: "rdv à fixer", color: "#8b5cf6" },
    { name: "intéressé", color: "#10b981" },
  ];
  for (const t of tags) {
    await prisma.tag.create({ data: { ...t, organizationId: orgId } });
  }
  console.log("✓ Tags:", tags.length);

  // 7. Prospects
  const prospects = [
    {
      name: "Dénicheur 229",
      phone: "+22900000001",
      status: "CONTACTED" as const,
      tags: ["à relancer"],
      notes: "Doit repasser carte",
    },
    {
      name: "Pretty Shop",
      phone: "+22900000002",
      status: "CONTACTED" as const,
      tags: ["à relancer"],
      notes: "Doit repasser carte",
    },
    {
      name: "Dr Nappy",
      phone: "+22900000003",
      status: "CONTACTED" as const,
      tags: ["chaud"],
      notes: "J'ai pris le numéro à contacter, j'ai rencontré le gérant",
    },
    {
      name: "Taha Entreprises",
      phone: "+22900000004",
      status: "QUALIFIED" as const,
      tags: ["carte laissée", "rdv à fixer"],
      notes: "J'ai laissé ma carte, attente RDV",
    },
    {
      name: "Maison des Montres et Lunettes",
      phone: "+22900000005",
      status: "QUALIFIED" as const,
      tags: ["carte laissée", "rdv à fixer"],
      notes: "J'ai laissé ma carte aussi",
    },
    {
      name: "Choco Coiffeur",
      phone: "+22900000006",
      status: "QUALIFIED" as const,
      tags: ["chaud", "intéressé"],
      notes: "On m'a donné le numéro du gérant, il a répondu rapidement et manifesté de l'intérêt. Première offre Google Business → il a dit qu'il doit gérer en interne. On garde le contact.",
    },
  ];

  for (const p of prospects) {
    await prisma.prospect.create({
      data: {
        name: p.name,
        phone: p.phone,
        status: p.status,
        source: "DIRECT",
        tags: JSON.stringify(p.tags),
        notes: p.notes,
        organizationId: orgId,
        createdById: userId,
      },
    });
  }
  console.log("✓ Prospects:", prospects.length);

  console.log("\n=== CREDENTIALS ===");
  console.log("Email:    aboudouzinsou@yahoo.com");
  console.log("Password: Eazysell2026!");
  console.log("Org:      Eazysell");
  console.log("Plan:     Pro (30 jours)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
