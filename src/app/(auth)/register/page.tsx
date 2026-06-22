"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signUp.email({ name, email, password });
    if (result.error) {
      setError(result.error.message ?? "Erreur lors de l'inscription");
      setLoading(false);
    } else {
      router.push("/create-org");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-card-title text-ink">
          Créer un compte
        </h2>
        <p className="mt-1 text-sm text-ink-subtle">
          Commence à prospecter en quelques minutes
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-ink-muted">
            Nom complet
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="François Zinsou"
          />
        </div>
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
            minLength={8}
            className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Minimum 8 caractères"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
      >
        {loading ? "Création…" : "Créer mon compte"}
      </button>

      <p className="text-center text-sm text-ink-subtle">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-primary hover:text-primary-hover">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
