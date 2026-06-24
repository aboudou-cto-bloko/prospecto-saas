import { NextRequest, NextResponse } from "next/server";
import { withApiKey } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { scrapeGoAfrica } from "@/lib/scraper/goafrica";

export async function POST(req: NextRequest) {
  return withApiKey(req, async ({ organizationId, userId }) => {
    const { keyword, city, maxPages = 3, enrich = false } = (await req.json()) as {
      keyword?: string; city?: string; maxPages?: number; enrich?: boolean;
    };

    if (!keyword || !city) {
      return NextResponse.json({ error: "keyword et city requis" }, { status: 400 });
    }

    const leads = await scrapeGoAfrica({
      keyword,
      city,
      maxPages: Math.min(maxPages, 10),
      enrich,
    });

    let added = 0;
    for (const lead of leads) {
      if (!lead.phone) continue;
      try {
        await prisma.prospect.create({
          data: {
            name: lead.name,
            phone: lead.phone,
            website: lead.website ?? null,
            category: lead.category || keyword,
            source: "GOAFRICA_ONLINE",
            notes: lead.description ?? null,
            metadata: {
              profileUrl: lead.profileUrl,
              phones: lead.phones,
              whatsappNumber: lead.whatsappNumber,
              address: lead.address,
              facebook: lead.facebook,
              instagram: lead.instagram,
              scrapedAt: new Date().toISOString(),
            },
            organizationId,
            createdById: userId,
          },
        });
        added++;
      } catch {
        // duplicate
      }
    }

    return NextResponse.json({
      scraped: leads.length,
      added,
      skipped: leads.length - added,
    });
  }, 5);
}
