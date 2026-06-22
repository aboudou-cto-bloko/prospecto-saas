"use client";

import { useState, useMemo, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Loader2, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { AfricaMap } from "@/components/africa-map";
import {
  COUNTRIES,
  ALL_CITIES,
  type AfricaCountry,
  type AfricaCity,
} from "@/lib/africa-cities";

export default function ScrapePage() {
  const [isPending, startTransition] = useTransition();
  const [selectedCountry, setSelectedCountry] = useState<AfricaCountry | null>(null);
  const [selectedCity, setSelectedCity] = useState<AfricaCity | null>(null);
  const [selectedGoafricaCode, setSelectedGoafricaCode] = useState("");
  const [sector, setSector] = useState("");
  const [maxPages, setMaxPages] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [result, setResult] = useState<{
    added: number;
    total: number;
    message: string;
  } | null>(null);

  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return ALL_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  function handleSelectCountry(country: AfricaCountry) {
    setSelectedCountry(country);
    setSelectedCity(null);
    setSelectedGoafricaCode(country.goafricaCode);
    setSearchQuery("");
  }

  function handleSelectCity(city: AfricaCity, country: AfricaCountry) {
    setSelectedCountry(country);
    setSelectedCity(city);
    setSelectedGoafricaCode(country.goafricaCode);
    setSearchQuery("");
  }

  function handleSearchSelect(city: (typeof ALL_CITIES)[number]) {
    const country = COUNTRIES.find((c) => c.code === city.countryCode);
    if (country) {
      setSelectedCountry(country);
      setSelectedCity(city);
      setSelectedGoafricaCode(city.goafricaCode);
    }
    setSearchQuery("");
    setSearchFocused(false);
  }

  function clearSelection() {
    setSelectedCountry(null);
    setSelectedCity(null);
    setSelectedGoafricaCode("");
  }

  function handleScrape(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCity || !sector.trim()) {
      toast.error("Sélectionne une ville et un secteur");
      return;
    }
    setResult(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/scrape/goafrica", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sector,
            city: selectedCity.slug,
            countryCode: selectedGoafricaCode,
            maxPages,
          }),
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
      <motion.h1
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-semibold tracking-headline text-ink"
      >
        Scraper GoAfricaOnline
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-1 text-sm text-ink-subtle"
      >
        Sélectionne un pays et une ville sur la carte, puis lance le scraping
      </motion.p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Left: Map + Search */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Rechercher une ville en Afrique…"
              className="w-full rounded-md border border-hairline bg-surface-1 py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            {/* Autocomplete */}
            <AnimatePresence>
              {searchFocused && filteredCities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-hairline bg-surface-1 py-1 shadow-xl"
                >
                  {filteredCities.map((city) => (
                    <button
                      key={`${city.countryCode}-${city.slug}`}
                      onClick={() => handleSearchSelect(city)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface-2"
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-ink">{city.name}</span>
                      <span className="text-xs text-ink-tertiary">
                        {city.country}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selection indicator */}
          <AnimatePresence>
            {selectedCity && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5"
              >
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-ink">
                  {selectedCity.name}
                </span>
                <span className="text-xs text-ink-subtle">
                  {selectedCountry?.name}
                </span>
                <button
                  onClick={clearSelection}
                  className="ml-auto text-ink-subtle hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Map */}
          <AfricaMap
            selectedCountry={selectedCountry}
            selectedCity={selectedCity}
            onSelectCountry={handleSelectCountry}
            onSelectCity={handleSelectCity}
          />

          {/* Country chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => handleSelectCountry(c)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  selectedCountry?.code === c.code
                    ? "bg-primary text-white"
                    : "bg-surface-2 text-ink-subtle hover:bg-surface-3"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Right: Scrape form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <form onSubmit={handleScrape} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm text-ink-muted">
                Ville sélectionnée
              </label>
              <div className="rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm">
                {selectedCity ? (
                  <span className="text-ink">
                    {selectedCity.name}{" "}
                    <span className="text-ink-subtle">
                      ({selectedCountry?.name})
                    </span>
                  </span>
                ) : (
                  <span className="text-ink-tertiary">
                    Clique sur la carte ou cherche une ville
                  </span>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="sector"
                className="mb-1.5 block text-sm text-ink-muted"
              >
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
              <label className="mb-1.5 block text-sm text-ink-muted">
                Pages à scraper (max 10)
              </label>
              <input
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
              disabled={isPending || !selectedCity}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
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

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 rounded-lg border border-hairline bg-surface-1 p-5"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {result.message}
                    </p>
                    <p className="text-xs text-ink-subtle">
                      {result.total} trouvé
                      {result.total !== 1 ? "s" : ""} · {result.added} ajouté
                      {result.added !== 1 ? "s" : ""} ·{" "}
                      {result.total - result.added} doublon
                      {result.total - result.added !== 1 ? "s" : ""} ignoré
                      {result.total - result.added !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
