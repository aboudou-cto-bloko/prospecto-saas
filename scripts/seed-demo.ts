import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import crypto from "crypto";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const userId = crypto.randomUUID();
  const orgId = crypto.randomUUID();
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 30);

  const user = await prisma.user.create({
    data: {
      id: userId,
      name: "Prospecto Demo",
      email: "pro@aboudouzinsou.com",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  });
  console.log("User:", user.email);

  // Better Auth hashes passwords with scrypt
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync("ProspectDemo2026!", salt, 64).toString("hex");

  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: `${salt}:${hash}`,
      createdAt: now,
      updatedAt: now,
    },
  });
  console.log("Account: credential created");

  const org = await prisma.organization.create({
    data: {
      id: orgId,
      name: "Prospecto Demo",
      slug: "prospecto-demo",
      createdAt: now,
    },
  });
  console.log("Org:", org.slug);

  await prisma.member.create({
    data: {
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId,
      role: "owner",
      createdAt: now,
    },
  });
  console.log("Member: owner");

  await prisma.subscription.create({
    data: {
      organizationId: orgId,
      plan: "pro",
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: trialEnd,
    },
  });
  console.log("Subscription: Pro until", trialEnd.toLocaleDateString("fr-FR"));

  // Seed some demo prospects
  const demoProspects = [
    { name: "Restaurant Le Palmier", phone: "+22997001122", category: "restaurants" },
    { name: "Hôtel Atlantic", phone: "+22996112233", category: "hôtels" },
    { name: "Pharmacie Centrale", phone: "+22995223344", category: "pharmacies" },
    { name: "Salon Beauté Plus", phone: "+22994334455", category: "beauté" },
    { name: "Auto École Prestige", phone: "+22993445566", category: "auto-écoles" },
  ];

  for (const p of demoProspects) {
    await prisma.prospect.create({
      data: {
        name: p.name,
        phone: p.phone,
        category: p.category,
        source: "GOAFRICA_ONLINE",
        organizationId: orgId,
        createdById: userId,
      },
    });
  }
  console.log("Prospects:", demoProspects.length, "created");

  // Seed a demo campaign
  await prisma.campaign.create({
    data: {
      name: "Campagne démo restaurants",
      template: "Bonjour {{nom}}, je suis intéressé par une collaboration avec votre établissement. Seriez-vous disponible pour en discuter ?",
      organizationId: orgId,
      createdById: userId,
      status: "DRAFT",
    },
  });
  console.log("Campaign: 1 created");

  // Seed tags
  const tags = [
    { name: "chaud", color: "#ef4444" },
    { name: "relancer", color: "#f59e0b" },
    { name: "intéressé", color: "#22c55e" },
  ];
  for (const t of tags) {
    await prisma.tag.create({
      data: { ...t, organizationId: orgId },
    });
  }
  console.log("Tags:", tags.length, "created");

  console.log("\n=== CREDENTIALS ===");
  console.log("Email:    pro@aboudouzinsou.com");
  console.log("Password: ProspectDemo2026!");
  console.log("Org:      Prospecto Demo");
  console.log("Plan:     Pro (30 jours)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
