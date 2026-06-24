import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/org-context";
import { assertProspectLimit } from "@/lib/limits";
import { consumeCredits } from "@/lib/credits";
import { prisma } from "@/lib/prisma";
import { scrapeGoAfrica } from "@/lib/scraper/goafrica";
import { z } from "zod";

const scrapeSchema = z.object({
  sector: z.string().min(1),
  city: z.string().min(1),
  countryCode: z.string().min(2).max(2).default("bj"),
  maxPages: z.number().int().min(1).max(10).default(3),
  enrich: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const { organizationId, user } = await requireRole("owner", "admin");
    const body = scrapeSchema.parse(await req.json());

    const leads = await scrapeGoAfrica({
      keyword: body.sector,
      city: body.city,
      maxPages: body.maxPages,
      enrich: body.enrich,
    });

    if (leads.length === 0) {
      return NextResponse.json({ added: 0, total: 0, message: "Aucun prospect trouvé" });
    }

    await consumeCredits(organizationId, "SCRAPE_PER_PROSPECT", leads.length);
    await assertProspectLimit(organizationId, leads.length);

    let added = 0;
    for (const lead of leads) {
      if (!lead.phone) continue;
      try {
        await prisma.prospect.create({
          data: {
            name: lead.name,
            phone: lead.phone,
            website: lead.website ?? null,
            category: lead.category || body.sector,
            source: "GOAFRICA_ONLINE",
            notes: lead.description ?? null,
            metadata: {
              profileUrl: lead.profileUrl,
              phones: lead.phones,
              whatsappNumber: lead.whatsappNumber,
              address: lead.address,
              facebook: lead.facebook,
              instagram: lead.instagram,
              isPremium: lead.isPremium,
              isOpen: lead.isOpen,
              coordinates: lead.coordinates,
              scrapedAt: new Date().toISOString(),
            },
            organizationId,
            createdById: user.id,
          },
        });
        added++;
      } catch {
        // duplicate phone — skip
      }
    }

    return NextResponse.json({
      added,
      total: leads.length,
      message: `${added} prospect${added !== 1 ? "s" : ""} ajouté${added !== 1 ? "s" : ""}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
