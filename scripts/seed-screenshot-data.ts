import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import crypto from "crypto";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Use the Eazysell org
  const org = await prisma.organization.findFirst({
    where: { slug: "eazysell" },
  });
  if (!org) {
    console.error("Org eazysell not found");
    return;
  }

  const member = await prisma.member.findFirst({
    where: { organizationId: org.id },
  });
  if (!member) {
    console.error("No member found");
    return;
  }

  const userId = member.userId;
  const orgId = org.id;

  console.log("Org:", org.name, orgId);

  // Clear existing prospects (keep the 6 originals, add more)
  const existingCount = await prisma.prospect.count({ where: { organizationId: orgId } });
  console.log("Existing prospects:", existingCount);

  const sectors = [
    "restaurants", "hôtels", "pharmacies", "salons de coiffure",
    "boutiques", "auto-écoles", "imprimeries", "boulangeries",
    "cliniques", "garages", "agences immobilières", "cybercafés",
    "supermarchés", "quincailleries", "pressing",
  ];

  const cities = ["Cotonou", "Porto-Novo", "Abomey-Calavi", "Parakou", "Bohicon"];

  const firstNames = [
    "Chez", "Maison", "Le", "La", "Centre", "Groupe", "Ets", "Société",
    "Super", "Grand", "Nouveau", "Royal", "Golden", "Star", "Top",
  ];
  const lastNames = [
    "Palmier", "Soleil", "Étoile", "Prestige", "Excellence", "Plus",
    "Express", "Central", "National", "Africa", "Bénin", "Diamant",
    "Perle", "Victoire", "Succès", "Lumière", "Avenir", "Progrès",
    "Fortune", "Paradis", "Horizon", "Amitié", "Bonheur", "Espoir",
  ];

  const statuses = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"] as const;
  const statusWeights = [25, 30, 20, 15, 10]; // Realistic distribution

  const tagOptions = ["chaud", "à relancer", "carte laissée", "rdv à fixer", "intéressé"];

  function weightedRandom(weights: number[]): number {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) return i;
    }
    return weights.length - 1;
  }

  // Generate 150 prospects for a healthy-looking dashboard
  const targetTotal = 150;
  const toCreate = targetTotal - existingCount;

  if (toCreate <= 0) {
    console.log("Already have enough prospects");
    return;
  }

  console.log(`Creating ${toCreate} prospects...`);

  const usedPhones = new Set<string>();

  for (let i = 0; i < toCreate; i++) {
    const sector = sectors[Math.floor(Math.random() * sectors.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const statusIdx = weightedRandom(statusWeights);
    const status = statuses[statusIdx];

    let phone: string;
    do {
      phone = `+2299${String(Math.floor(Math.random() * 10000000)).padStart(7, "0")}`;
    } while (usedPhones.has(phone));
    usedPhones.add(phone);

    // 40% chance of having tags
    const tags: string[] = [];
    if (Math.random() < 0.4) {
      const numTags = Math.floor(Math.random() * 2) + 1;
      for (let t = 0; t < numTags; t++) {
        const tag = tagOptions[Math.floor(Math.random() * tagOptions.length)];
        if (!tags.includes(tag)) tags.push(tag);
      }
    }

    // Random creation date within last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    try {
      await prisma.prospect.create({
        data: {
          name,
          phone,
          category: sector,
          source: Math.random() < 0.7 ? "GOAFRICA_ONLINE" : "DIRECT",
          status,
          tags,
          notes: status === "CONVERTED"
            ? `Client signé — ${city}`
            : status === "QUALIFIED"
              ? `Intéressé, à recontacter`
              : null,
          metadata: {
            ville: city,
            secteur: sector,
          },
          organizationId: orgId,
          createdById: userId,
          createdAt,
        },
      });
    } catch {
      // skip duplicates
    }
  }

  // Create more campaigns
  const campaignNames = [
    "Campagne restaurants Cotonou",
    "Prospection hôtels Porto-Novo",
    "Relance pharmacies Calavi",
    "Salons de coiffure — Offre digitale",
    "Boutiques Parakou — Pack présence",
  ];

  const campaignStatuses = ["DRAFT", "ACTIVE", "ACTIVE", "COMPLETED", "PAUSED"] as const;

  for (let i = 0; i < campaignNames.length; i++) {
    try {
      await prisma.campaign.create({
        data: {
          name: campaignNames[i],
          template: `Bonjour {{nom}}, je suis François de Eazysell. J'ai vu votre établissement à {{ville}} et j'aimerais vous proposer nos services. Êtes-vous disponible pour en discuter ?`,
          status: campaignStatuses[i],
          organizationId: orgId,
          createdById: userId,
        },
      });
    } catch {
      // skip if exists
    }
  }

  // Update subscription scraping credits used (to show usage)
  await prisma.subscription.updateMany({
    where: { organizationId: orgId },
    data: { scrapingCreditsUsed: 847 },
  });

  // Final counts
  const [totalProspects, totalCampaigns, converted] = await Promise.all([
    prisma.prospect.count({ where: { organizationId: orgId } }),
    prisma.campaign.count({ where: { organizationId: orgId } }),
    prisma.prospect.count({ where: { organizationId: orgId, status: "CONVERTED" } }),
  ]);

  console.log("\n=== DASHBOARD DATA ===");
  console.log("Prospects:", totalProspects);
  console.log("Campagnes:", totalCampaigns);
  console.log("Convertis:", converted);
  console.log("Taux conversion:", Math.round((converted / totalProspects) * 100) + "%");
  console.log("Crédits utilisés: 847 / 3000");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
