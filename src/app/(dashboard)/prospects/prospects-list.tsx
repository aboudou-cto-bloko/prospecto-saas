"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createProspect, updateProspectStatus, deleteProspect } from "@/actions/prospects";
import { generateWhatsAppLink } from "@/lib/template";
import {
  Plus,
  Search,
  MessageCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Prospect, Tag } from "@/generated/prisma/client";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: "Nouveau", color: "bg-blue-500/20 text-blue-400" },
  CONTACTED: { label: "Contacté", color: "bg-yellow-500/20 text-yellow-400" },
  QUALIFIED: { label: "Qualifié", color: "bg-purple-500/20 text-purple-400" },
  CONVERTED: { label: "Converti", color: "bg-emerald-500/20 text-emerald-400" },
  LOST: { label: "Perdu", color: "bg-red-500/20 text-red-400" },
};

type Props = {
  prospects: Prospect[];
  tags: Tag[];
  total: number;
  page: number;
  totalPages: number;
};

export function ProspectsList({ prospects, tags: _tags, total: _total, page, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) params.set("search", search);
    else params.delete("search");
    params.set("page", "1");
    router.push(`/prospects?${params.toString()}`);
  }

  function handleStatusFilter(status: string | null) {
    const params = new URLSearchParams(searchParams);
    if (status) params.set("status", status);
    else params.delete("status");
    params.set("page", "1");
    router.push(`/prospects?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(newPage));
    router.push(`/prospects?${params.toString()}`);
  }

  async function handleAdd(formData: FormData) {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    startTransition(async () => {
      try {
        await createProspect({ name, phone });
        toast.success("Prospect ajouté");
        setShowAddForm(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteProspect(id);
        toast.success("Prospect supprimé");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  async function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      try {
        await updateProspectStatus(
          id,
          status as "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST"
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un prospect…"
              className="w-full rounded-md border border-hairline bg-surface-1 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </form>

        <div className="flex gap-1">
          {[null, "NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"].map(
            (s) => (
              <button
                key={s ?? "all"}
                onClick={() => handleStatusFilter(s)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs transition-colors",
                  searchParams.get("status") === s ||
                    (!s && !searchParams.get("status"))
                    ? "bg-surface-2 text-ink"
                    : "text-ink-subtle hover:bg-surface-2"
                )}
              >
                {s ? STATUS_LABELS[s].label : "Tous"}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {showAddForm && (
        <form
          action={handleAdd}
          className="mt-4 flex gap-3 rounded-lg border border-hairline bg-surface-1 p-4"
        >
          <input
            name="name"
            required
            placeholder="Nom"
            className="flex-1 rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none"
          />
          <input
            name="phone"
            required
            placeholder="+229 XX XX XX XX"
            className="flex-1 rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            Ajouter
          </button>
        </form>
      )}

      <div className="mt-4 rounded-lg border border-hairline bg-surface-1">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline text-left text-xs text-ink-subtle">
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Téléphone</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {prospects.map((p) => (
              <tr
                key={p.id}
                className="text-sm transition-colors hover:bg-surface-2/50"
              >
                <td className="px-4 py-3 text-ink">{p.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                  {p.phone}
                </td>
                <td className="px-4 py-3 text-xs text-ink-subtle">
                  {p.source.replace(/_/g, " ")}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={p.status}
                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      STATUS_LABELS[p.status]?.color
                    )}
                    style={{ background: "transparent" }}
                  >
                    {Object.entries(STATUS_LABELS).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={generateWhatsAppLink(
                        p.phone,
                        `Bonjour ${p.name} !`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md p-1.5 text-ink-subtle transition-colors hover:bg-success/20 hover:text-success"
                      title="Envoyer WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded-md p-1.5 text-ink-subtle transition-colors hover:bg-destructive/20 hover:text-destructive"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {prospects.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-ink-subtle"
                >
                  Aucun prospect trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-ink-subtle">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-md border border-hairline p-2 text-ink-subtle transition-colors hover:bg-surface-2 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-md border border-hairline p-2 text-ink-subtle transition-colors hover:bg-surface-2 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
