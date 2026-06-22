"use client";

import { useState, useEffect } from "react";
import { authClient, useListOrganizations } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function CreateOrgPage() {
  const router = useRouter();
  const { data: orgs, isPending: orgsLoading } = useListOrganizations();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orgsLoading || !orgs) return;
    if (orgs.length > 0) {
      authClient.organization
        .setActive({ organizationId: orgs[0].id })
        .then(() => router.push("/dashboard"))
        .catch(() => {});
    }
  }, [orgs, orgsLoading, router]);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authClient.organization.create({ name, slug });

      if (result.error) {
        setError(result.error.message ?? "Erreur lors de la création");
        setLoading(false);
        return;
      }

      await authClient.organization.setActive({
        organizationId: result.data.id,
      });

      router.push("/dashboard");
    } catch {
      setError("Erreur de connexion. Réessayez.");
      setLoading(false);
    }
  }

  if (orgsLoading) {
    return (
      <div className="rounded-lg border border-hairline bg-surface-1 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-surface-2" />
          <div className="h-4 w-64 rounded bg-surface-2" />
          <div className="h-10 rounded bg-surface-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-hairline bg-surface-1 p-8">
      <h2 className="text-xl font-semibold tracking-card-title text-ink">
        Crée ton organisation
      </h2>
      <p className="mt-1 text-sm text-ink-subtle">
        Ton espace de travail pour gérer tes prospects et campagnes.
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-ink-muted">
            Nom de l&apos;organisation
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Mon Entreprise"
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-1.5 block text-sm text-ink-muted">
            Identifiant unique
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            pattern="[a-z0-9-]+"
            className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="mon-entreprise"
          />
          <p className="mt-1 text-xs text-ink-tertiary">
            Lettres minuscules, chiffres et tirets uniquement
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? "Création…" : "Créer l'organisation"}
        </button>
      </form>
    </div>
  );
}
