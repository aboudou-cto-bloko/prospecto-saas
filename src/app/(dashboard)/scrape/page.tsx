"use client";

import { useState, useTransition } from "react";
import { Search, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ScrapePage() {
  const [isPending, startTransition] = useTransition();
  const [sector, setSector] = useState("");
  const [city, setCity] = useState("cotonou");
  const [maxPages, setMaxPages] = useState(3);
  const [result, setResult] = useState<{
    added: number;
    total: number;
    message: string;
  } | null>(null);

  function handleScrape(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/scrape/goafrica", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sector, city, maxPages }),
        });
        const data = (await res.json()) as {
          added?: number;
          total?: number;
          message?: string;
          error?: string;
        };
        if (!res.ok) {
          toast.error(data.error ?? "Erreur");
          return;
        }
        setResult({
          added: data.added ?? 0,
          total: data.total ?? 0,
          message: data.message ?? "",
        });
        toast.success(data.message ?? "Terminé");
      } catch {
        toast.error("Erreur de connexion");
      }
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-headline text-ink">
        Scraper GoAfricaOnline
      </h1>
      <p className="mt-1 text-sm text-ink-subtle">
        Collecte des prospects par secteur et ville
      </p>

      <form
        onSubmit={handleScrape}
        className="mt-8 max-w-xl space-y-5"
      >
        <div>
          <label htmlFor="sector" className="mb-1.5 block text-sm text-ink-muted">
            Secteur d&apos;activité
          </label>
          <input
            id="sector"
            type="text"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            required
            className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="restaurants, hôtels, pharmacies…"
          />
        </div>

        <div>
          <label htmlFor="city" className="mb-1.5 block text-sm text-ink-muted">
            Ville
          </label>
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
          >
            <option value="cotonou">Cotonou</option>
            <option value="porto-novo">Porto-Novo</option>
            <option value="parakou">Parakou</option>
            <option value="abomey-calavi">Abomey-Calavi</option>
          </select>
        </div>

        <div>
          <label htmlFor="pages" className="mb-1.5 block text-sm text-ink-muted">
            Pages à scraper (max 10)
          </label>
          <input
            id="pages"
            type="number"
            min={1}
            max={10}
            value={maxPages}
            onChange={(e) => setMaxPages(parseInt(e.target.value) || 3)}
            className="w-24 rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scraping en cours…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Lancer le scraping
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="mt-6 max-w-xl rounded-lg border border-hairline bg-surface-1 p-5">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-ink">{result.message}</p>
              <p className="text-xs text-ink-subtle">
                {result.total} trouvé{result.total !== 1 ? "s" : ""} ·{" "}
                {result.added} ajouté{result.added !== 1 ? "s" : ""} ·{" "}
                {result.total - result.added} doublon
                {result.total - result.added !== 1 ? "s" : ""} ignoré
                {result.total - result.added !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
