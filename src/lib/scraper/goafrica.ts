import * as cheerio from "cheerio";

const BASE_URL = "https://www.goafricaonline.com";
const DELAY_MS = 700;

export type ScrapedLead = {
  companyId: string;
  name: string;
  phone: string;
  phones: string[];
  whatsappNumber: string | null;
  category: string;
  address: string;
  description: string | null;
  profileUrl: string;
  isPremium: boolean;
  isOpen: boolean | null;
  facebook: string | null;
  instagram: string | null;
  website: string | null;
  coordinates: { lat: number; lng: number } | null;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "fr-FR,fr;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.text();
}

function cleanPhone(tel: string): string {
  return tel.replace("tel:", "").replace(/\s/g, "").replace(/^00/, "+");
}

function extractWaPhone(href: string): string | null {
  const m = href.match(/[?&]phone=(\d+)/);
  return m ? `+${m[1]}` : null;
}

// ── Listing page parser ───────────────────────────────────────────────────────

export type ListingResult = {
  companyId: string;
  name: string;
  profileUrl: string;
  phone: string | null;
  category: string;
  address: string;
  description: string | null;
  isPremium: boolean;
  isOpen: boolean | null;
};

export function parseListingPage(html: string): {
  results: ListingResult[];
  totalPages: number;
} {
  const $ = cheerio.load(html);
  const results: ListingResult[] = [];

  $("article[data-company-id]").each((_, el) => {
    const $el = $(el);

    const companyId = $el.attr("data-company-id") ?? "";
    const nameLink = $el.find("h2 a, h3 a").first();
    const name = nameLink.text().trim();
    const href = nameLink.attr("href") ?? "";
    const profileUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;

    // Phone — first tel: link
    const telHref = $el.find('a[href^="tel:"]').first().attr("href") ?? "";
    const phone = telHref ? cleanPhone(telHref) : null;

    // Category — div with text-brand-blue class (skip <i> icon elements)
    const category = $el.find('div[class*="text-brand-blue"]').first().text().trim();

    // Address — <address> tag
    const address = $el.find("address").first().text().replace(/\s+/g, " ").trim();

    // Short description — the hidden div (desktop)
    const description =
      $el.find('[class*="text-gray-700"][class*="text-14"]').first().text().trim() ||
      $el.find('[class*="text-gray-700"][class*="text-13"]').first().text().trim() ||
      null;

    // Premium badge
    const isPremium = $el.find('[class*="border-green"]').text().toLowerCase().includes("premium");

    // Open/closed status
    const statusText = $el.text();
    const isOpen = statusText.includes("Ouvert")
      ? true
      : statusText.includes("Fermé")
      ? false
      : null;

    if (name) {
      results.push({
        companyId,
        name,
        profileUrl,
        phone,
        category,
        address,
        description: description?.slice(0, 300) || null,
        isPremium,
        isOpen,
      });
    }
  });

  // Total pages from pagination links
  let totalPages = 1;
  $('a[href*="&p="]').each((_, el) => {
    const m = $(el).attr("href")?.match(/[?&]p=(\d+)/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > totalPages) totalPages = n;
    }
  });

  return { results, totalPages };
}

// ── Detail page scraper ───────────────────────────────────────────────────────

export async function scrapeDetailPage(profileUrl: string): Promise<Partial<ScrapedLead>> {
  await sleep(DELAY_MS);
  const html = await fetchPage(profileUrl);
  const $ = cheerio.load(html);

  // All unique phones
  const seen = new Set<string>();
  const phones: string[] = [];
  $('a[href^="tel:"]').each((_, el) => {
    const phone = cleanPhone($(el).attr("href") ?? "");
    if (phone && !seen.has(phone)) {
      seen.add(phone);
      phones.push(phone);
    }
  });

  // WhatsApp number from api.whatsapp.com link
  let whatsappNumber: string | null = null;
  $('a[href*="api.whatsapp.com"], a[href*="wa.me/"]').each((_, el) => {
    if (!whatsappNumber) {
      const href = $(el).attr("href") ?? "";
      whatsappNumber = extractWaPhone(href) ?? href.replace(/.*wa\.me\//, "+").split("?")[0];
    }
  });

  // Social links
  let facebook: string | null = null;
  let instagram: string | null = null;
  let website: string | null = null;

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!href.startsWith("http")) return;
    if (href.includes("goafricaonline.com")) return;
    if (href.includes("facebook.com") && !facebook) {
      facebook = href.split("?")[0];
    } else if (href.includes("instagram.com") && !instagram) {
      instagram = href.split("?")[0];
    } else if (
      !href.includes("whatsapp") &&
      !href.includes("twitter") &&
      !href.includes("youtube") &&
      !href.includes("linkedin") &&
      !href.includes("tiktok") &&
      !href.includes("maps.google") &&
      !website
    ) {
      website = href;
    }
  });

  // Description from meta
  const description = $('meta[name="description"]').attr("content") ?? null;

  // GPS coordinates from Google Maps link
  let coordinates: { lat: number; lng: number } | null = null;
  $('a[href*="maps.google"], iframe[src*="maps.google"]').each((_, el) => {
    const src = $(el).attr("href") ?? $(el).attr("src") ?? "";
    const m = src.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (m) coordinates = { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  });

  // Primary phone: prefer WhatsApp number
  const phone = whatsappNumber ?? phones[0] ?? "";

  return { phones, whatsappNumber, phone, facebook, instagram, website, description, coordinates };
}

// ── Main scraper ──────────────────────────────────────────────────────────────

export type ScrapeOptions = {
  keyword: string;
  city: string;
  maxPages?: number;
  enrich?: boolean;
  onProgress?: (msg: string) => void;
};

export async function scrapeGoAfrica(options: ScrapeOptions): Promise<ScrapedLead[]> {
  const { keyword, city, maxPages = 5, enrich = false, onProgress } = options;
  const leads: ScrapedLead[] = [];

  let page = 1;
  let totalPages = 1;

  while (page <= Math.min(totalPages, maxPages)) {
    const url =
      `${BASE_URL}/annuaire-resultat?type=company` +
      `&whatWho=${encodeURIComponent(keyword)}` +
      `&where=${encodeURIComponent(city)}` +
      (page > 1 ? `&p=${page}` : "");

    onProgress?.(`Page ${page}/${Math.min(totalPages, maxPages)} — ${leads.length} leads collectés`);

    const html = await fetchPage(url);
    const { results, totalPages: tp } = parseListingPage(html);
    if (page === 1) totalPages = tp;

    for (const r of results) {
      const lead: ScrapedLead = {
        companyId: r.companyId,
        name: r.name,
        phone: r.phone ?? "",
        phones: r.phone ? [r.phone] : [],
        whatsappNumber: null,
        category: r.category,
        address: r.address,
        description: r.description,
        profileUrl: r.profileUrl,
        isPremium: r.isPremium,
        isOpen: r.isOpen,
        facebook: null,
        instagram: null,
        website: null,
        coordinates: null,
      };

      if (enrich && r.profileUrl) {
        try {
          onProgress?.(`  ↳ ${r.name}`);
          const detail = await scrapeDetailPage(r.profileUrl);
          Object.assign(lead, detail);
        } catch {
          // keep basic data on failure
        }
      }

      if (lead.name) leads.push(lead);
    }

    if (results.length === 0) break;
    page++;
    if (page <= Math.min(totalPages, maxPages)) await sleep(DELAY_MS);
  }

  onProgress?.(`Collecte terminée — ${leads.length} leads`);
  return leads;
}
