#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = process.env.PROSPECTO_URL ?? "https://prospecto.aboudouzinsou.site";
const API_KEY = process.env.PROSPECTO_API_KEY ?? "";

async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      ...options.headers,
    },
  });
  return res.json();
}

const server = new McpServer({
  name: "prospecto",
  version: "1.0.0",
});

// ── TOOLS ────────────────────────────────────────────────────────────────────

server.tool(
  "list_prospects",
  "Lister les prospects du pipeline avec filtres optionnels",
  {
    status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]).optional().describe("Filtrer par statut"),
    search: z.string().optional().describe("Recherche par nom ou téléphone"),
    page: z.number().optional().describe("Numéro de page"),
    limit: z.number().optional().describe("Nombre de résultats par page (max 100)"),
  },
  async ({ status, search, page, limit }) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    const data = await api(`/prospects?${params}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_prospect",
  "Obtenir les détails d'un prospect par son ID",
  { id: z.string().describe("ID du prospect") },
  async ({ id }) => {
    const data = await api(`/prospects/${id}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_prospect",
  "Ajouter un nouveau prospect au pipeline (coûte 1 crédit)",
  {
    name: z.string().describe("Nom du prospect"),
    phone: z.string().describe("Numéro de téléphone"),
    category: z.string().optional().describe("Catégorie/secteur"),
    notes: z.string().optional().describe("Notes sur le prospect"),
    tags: z.array(z.string()).optional().describe("Tags à assigner"),
    metadata: z.string().optional().describe("Données personnalisées en JSON (ex: {\"entreprise\":\"SARL\",\"ville\":\"Cotonou\"})"),
  },
  async (args) => {
    const payload = { ...args, metadata: args.metadata ? JSON.parse(args.metadata) : undefined };
    const data = await api("/prospects", { method: "POST", body: JSON.stringify(payload) });
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "update_prospect",
  "Mettre à jour un prospect existant (coûte 1 crédit)",
  {
    id: z.string().describe("ID du prospect"),
    name: z.string().optional().describe("Nouveau nom"),
    phone: z.string().optional().describe("Nouveau téléphone"),
    status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"]).optional().describe("Nouveau statut"),
    category: z.string().optional().describe("Nouvelle catégorie"),
    notes: z.string().optional().describe("Nouvelles notes"),
    tags: z.array(z.string()).optional().describe("Nouveaux tags"),
    metadata: z.string().optional().describe("Nouvelles données personnalisées en JSON"),
  },
  async ({ id, ...rest }) => {
    const payload = { ...rest, metadata: rest.metadata ? JSON.parse(rest.metadata as string) : undefined };
    const data = await api(`/prospects/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "delete_prospect",
  "Supprimer un prospect du pipeline",
  { id: z.string().describe("ID du prospect") },
  async ({ id }) => {
    const data = await api(`/prospects/${id}`, { method: "DELETE" });
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_stats",
  "Obtenir les statistiques du dashboard (prospects, campagnes, crédits, limites)",
  async () => {
    const data = await api("/stats");
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "list_campaigns",
  "Lister toutes les campagnes WhatsApp",
  async () => {
    const data = await api("/campaigns");
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_campaign",
  "Créer une nouvelle campagne WhatsApp (coûte 1 crédit)",
  {
    name: z.string().describe("Nom de la campagne"),
    template: z.string().describe("Template du message avec variables {{nom}}, {{telephone}}, etc."),
  },
  async (args) => {
    const data = await api("/campaigns", { method: "POST", body: JSON.stringify(args) });
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "list_tags",
  "Lister tous les tags disponibles",
  async () => {
    const data = await api("/tags");
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "scrape_goafrica",
  "Scraper GoAfricaOnline pour trouver des prospects (coûte 5 crédits)",
  {
    keyword: z.string().describe("Secteur d'activité à rechercher (ex: restaurants, hôtels, pharmacies)"),
    city: z.string().describe("Ville (ex: cotonou, dakar, abidjan)"),
    maxPages: z.number().optional().describe("Nombre de pages à scraper (1-10, défaut 3)"),
    enrich: z.boolean().optional().describe("Enrichir avec les détails (WhatsApp, Facebook, GPS) — plus lent"),
  },
  async (args) => {
    const data = await api("/scrape", { method: "POST", body: JSON.stringify(args) });
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

// ── START ────────────────────────────────────────────────────────────────────

async function main() {
  if (!API_KEY) {
    console.error("PROSPECTO_API_KEY is required. Generate one at https://prospecto.aboudouzinsou.site/settings/organization");
    process.exit(1);
  }
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
