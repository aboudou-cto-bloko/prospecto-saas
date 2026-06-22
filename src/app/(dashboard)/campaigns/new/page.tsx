"use client";

import { useState, useTransition } from "react";
import { createCampaign } from "@/actions/campaigns";
import { CustomFieldManager } from "@/components/custom-field-manager";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewCampaignPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [template, setTemplate] = useState(
    "Bonjour {{nom}}, je suis {{prenom}} de [Entreprise]. J'ai consulté votre profil et j'aimerais vous proposer nos services. Êtes-vous disponible pour en discuter ?"
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const campaign = await createCampaign({ name, template });
        toast.success("Campagne créée");
        router.push(`/campaigns/${campaign.id}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-headline text-ink">
        Nouvelle campagne
      </h1>
      <p className="mt-1 text-sm text-ink-subtle">
        Configure ton template de message WhatsApp
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-2xl space-y-6"
      >
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-ink-muted">
            Nom de la campagne
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Campagne restaurants Cotonou"
          />
        </div>

        <div>
          <label htmlFor="template" className="mb-1.5 block text-sm text-ink-muted">
            Template du message
          </label>
          <textarea
            id="template"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            required
            rows={6}
            className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="mt-2 flex items-center gap-3">
            <p className="text-xs text-ink-tertiary">
              Variables : {"{{nom}}"}, {"{{telephone}}"} + personnalisées
            </p>
            <CustomFieldManager />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isPending ? "Création…" : "Créer la campagne"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-hairline bg-surface-1 px-4 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-2"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
