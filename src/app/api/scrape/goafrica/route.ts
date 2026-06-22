import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/org-context";
import { assertProspectLimit, assertScrapingCredits, consumeScrapingCredits } from "@/lib/limits";
import { prisma } from "@/lib/prisma";
import * as cheerio from "cheerio";
import { z } from "zod";

const scrapeSchema = z.object({
  sector: z.string().min(1),
  city: z.string().min(1),
  countryCode: z.string().min(2).max(2).default("bj"),
  maxPages: z.number().int().min(1).max(10).default(3),
});

type ScrapedProspect = {
  name: string;
  phone: string;
  website: string | null;
  category: string;
};

async function scrapeGoAfricaPage(
  sector: string,
  city: string,
  countryCode: string,
  page: number
): Promise<ScrapedProspect[]> {
  const url = `https://www.goafricaonline.com/${countryCode}/${encodeURIComponent(city)}/${encodeURIComponent(sector)}?page=${page}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Prospecto/1.0; +https://prospecto.app)",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) return [];

  const html = await res.text();
  const $ = cheerio.load(html);
  const prospects: ScrapedProspect[] = [];

  $(".company-card, .annuaire-card, [class*='company']").each((_, el) => {
    const name =
      $(el).find("h2, h3, .company-name, [class*='name']").first().text().trim();
    const phone =
      $(el)
        .find("a[href^='tel:'], .phone, [class*='phone']")
        .first()
        .text()
        .trim() ||
      $(el)
        .find("a[href^='tel:']")
        .first()
        .attr("href")
        ?.replace("tel:", "") ||
      "";
    const website =
      $(el)
        .find("a[href^='http']:not([href*='goafrica'])")
        .first()
        .attr("href") || null;

    if (name && phone) {
      prospects.push({ name, phone, website, category: sector });
    }
  });

  return prospects;
}

export async function POST(req: NextRequest) {
  try {
    const { organizationId, user } = await requireRole("owner", "admin");
    const body = scrapeSchema.parse(await req.json());

    const allProspects: ScrapedProspect[] = [];
    for (let page = 1; page <= body.maxPages; page++) {
      const results = await scrapeGoAfricaPage(body.sector, body.city, body.countryCode, page);
      allProspects.push(...results);
      if (results.length === 0) break;
    }

    if (allProspects.length === 0) {
      return NextResponse.json({ added: 0, message: "Aucun prospect trouvé" });
    }

    await assertScrapingCredits(organizationId, allProspects.length);
    await assertProspectLimit(organizationId, allProspects.length);

    let added = 0;
    for (const p of allProspects) {
      try {
        await prisma.prospect.create({
          data: {
            name: p.name,
            phone: p.phone,
            website: p.website,
            category: p.category,
            source: "GOAFRICA_ONLINE",
            organizationId,
            createdById: user.id,
          },
        });
        added++;
      } catch {
        // duplicate phone — skip
      }
    }

    await consumeScrapingCredits(organizationId, allProspects.length);

    return NextResponse.json({
      added,
      total: allProspects.length,
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
