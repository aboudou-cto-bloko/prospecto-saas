"use client";

import { useState } from "react";
import { signIn, authClient, useListOrganizations } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn.email({ email, password });

      if (result.error) {
        setError(
          result.error.code === "INVALID_EMAIL_OR_PASSWORD"
            ? "Email ou mot de passe incorrect"
            : result.error.message ?? "Erreur de connexion"
        );
        setLoading(false);
        return;
      }

      const orgs = await authClient.organization.list();

      if (!orgs.data || orgs.data.length === 0) {
        router.push("/create-org");
        return;
      }

      const setOrgResult = await authClient.organization.setActive({
        organizationId: orgs.data[0].id,
      });

      if (setOrgResult.error) {
        router.push("/create-org");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erreur de connexion. Vérifiez votre réseau.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-card-title text-ink">
          Connexion
        </h2>
        <p className="mt-1 text-sm text-ink-subtle">
          Connecte-toi à ton compte Prospecto
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-ink-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="ton@email.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-ink-muted">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>

      <div className="flex items-center justify-between text-sm">
        <Link
          href="/forgot-password"
          className="text-ink-subtle hover:text-primary"
        >
          Mot de passe oublié ?
        </Link>
        <Link href="/register" className="text-primary hover:text-primary-hover">
          Créer un compte
        </Link>
      </div>
    </form>
  );
}
