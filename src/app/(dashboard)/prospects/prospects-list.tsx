"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createProspect,
  updateProspectStatus,
  deleteProspect,
  bulkDeleteProspects,
  bulkUpdateStatus,
  updateProspectTags,
} from "@/actions/prospects";
import { generateWhatsAppLink } from "@/lib/template";
import {
  Plus,
  Search,
  MessageCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckSquare,
  Square,
  X,
  Upload,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TagBadge } from "@/components/tag-badge";
import { TagManager } from "@/components/tag-manager";
import { EmptyState } from "@/components/empty-state";
import { ProspectDetailSheet } from "@/components/prospect-detail-sheet";
import { ImportCsvDialog } from "@/components/import-csv-dialog";
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

export function ProspectsList({ prospects, tags, total, page, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [detailProspect, setDetailProspect] = useState<Prospect | null>(null);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tagPopoverFor, setTagPopoverFor] = useState<string | null>(null);

  const allSelected = prospects.length > 0 && selected.size === prospects.length;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(prospects.map((p) => p.id)));
  }

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
        setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  async function handleStatusChange(id: string, status: string) {
    const label = STATUS_LABELS[status]?.label ?? status;
    startTransition(async () => {
      try {
        await updateProspectStatus(id, status as "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST");
        toast.success(`Statut changé → ${label}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected);
    startTransition(async () => {
      try {
        await bulkDeleteProspects(ids);
        toast.success(`${ids.length} prospect(s) supprimé(s)`);
        setSelected(new Set());
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  async function handleBulkStatus(status: string) {
    const ids = Array.from(selected);
    startTransition(async () => {
      try {
        await bulkUpdateStatus(ids, status as "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST");
        toast.success(`${ids.length} prospect(s) mis à jour`);
        setSelected(new Set());
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  function getProspectTags(prospect: Prospect): string[] {
    try {
      const raw = prospect.tags;
      if (Array.isArray(raw)) return raw as string[];
      if (typeof raw === "string") {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as string[];
      }
      return [];
    } catch { return []; }
  }

  const currentSort = searchParams.get("sort") ?? "createdAt";
  const currentOrder = (searchParams.get("order") ?? "desc") as "asc" | "desc";

  function handleSort(field: string) {
    const params = new URLSearchParams(searchParams);
    if (currentSort === field) {
      params.set("order", currentOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", field);
      params.set("order", "asc");
    }
    params.set("page", "1");
    router.push(`/prospects?${params.toString()}`);
  }

  function SortableHeader({ field, label }: { field: string; label: string }) {
    const active = currentSort === field;
    return (
      <th className="px-4 py-3 font-medium">
        <button
          onClick={() => handleSort(field)}
          className={cn(
            "inline-flex items-center gap-1 transition-colors hover:text-ink",
            active && "text-ink"
          )}
        >
          {label}
          {active ? (
            currentOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-40" />
          )}
        </button>
      </th>
    );
  }

  async function handleToggleTag(prospectId: string, tagName: string, currentTags: string[]) {
    const removing = currentTags.includes(tagName);
    const newTags = removing
      ? currentTags.filter((t) => t !== tagName)
      : [...currentTags, tagName];
    startTransition(async () => {
      try {
        await updateProspectTags(prospectId, newTags);
        toast.success(removing ? `Tag "${tagName}" retiré` : `Tag "${tagName}" ajouté`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  return (
    <div className="mt-6">
      {/* Search + Filters + Actions */}
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
          {[null, "NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"].map((s) => (
            <button
              key={s ?? "all"}
              onClick={() => handleStatusFilter(s)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs transition-colors",
                searchParams.get("status") === s || (!s && !searchParams.get("status"))
                  ? "bg-surface-2 text-ink"
                  : "text-ink-subtle hover:bg-surface-2"
              )}
            >
              {s ? STATUS_LABELS[s].label : "Tous"}
            </button>
          ))}
        </div>

        <TagManager />

        <button
          onClick={() => setShowImport(true)}
          className="flex items-center gap-2 rounded-md border border-hairline px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-2"
        >
          <Upload className="h-4 w-4" />
          CSV
        </button>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5">
          <span className="text-sm font-medium text-ink">
            {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            {Object.entries(STATUS_LABELS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handleBulkStatus(key)}
                disabled={isPending}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  val.color
                )}
              >
                {val.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleBulkDelete}
            disabled={isPending}
            className="ml-auto flex items-center gap-1.5 rounded-md bg-destructive/20 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/30"
          >
            <Trash2 className="h-3 w-3" /> Supprimer
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-ink-subtle hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <form
          action={handleAdd}
          className="mt-4 flex gap-3 rounded-lg border border-hairline bg-surface-1 p-4"
        >
          <input name="name" required placeholder="Nom" className="flex-1 rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none" />
          <input name="phone" required placeholder="+229 XX XX XX XX" className="flex-1 rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none" />
          <button type="submit" disabled={isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50">
            Ajouter
          </button>
        </form>
      )}

      {/* Table */}
      {prospects.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Users}
            title="Aucun prospect"
            description="Ajoute des prospects manuellement, via CSV ou avec le scraper GoAfricaOnline."
            action={
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4" /> Ajouter un prospect
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-hairline bg-surface-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline text-left text-xs text-ink-subtle">
                <th className="w-10 px-4 py-3">
                  <button onClick={toggleAll} className="text-ink-tertiary hover:text-ink">
                    {allSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  </button>
                </th>
                <SortableHeader field="name" label="Nom" />
                <SortableHeader field="phone" label="Téléphone" />
                <th className="px-4 py-3 font-medium">Tags</th>
                <SortableHeader field="status" label="Statut" />
                <SortableHeader field="createdAt" label="Date" />
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {prospects.map((p) => {
                const pTags = getProspectTags(p);
                return (
                  <tr key={p.id} className={cn("text-sm transition-colors hover:bg-surface-2/50", selected.has(p.id) && "bg-primary/5")}>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSelect(p.id)} className="text-ink-tertiary hover:text-ink">
                        {selected.has(p.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDetailProspect(p)}
                        className="text-ink transition-colors hover:text-primary"
                      >
                        {p.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">{p.phone}</td>
                    <td className="px-4 py-3">
                      <div className="relative flex flex-wrap items-center gap-1">
                        {pTags.map((t) => {
                          const tagObj = tags.find((tag) => tag.name === t);
                          return tagObj ? (
                            <TagBadge
                              key={t}
                              name={tagObj.name}
                              color={tagObj.color}
                              onRemove={() => handleToggleTag(p.id, t, pTags)}
                            />
                          ) : null;
                        })}
                        <button
                          onClick={() => setTagPopoverFor(tagPopoverFor === p.id ? null : p.id)}
                          className="rounded px-1 py-0.5 text-[10px] text-ink-tertiary hover:bg-surface-2 hover:text-ink"
                        >
                          +
                        </button>
                        {tagPopoverFor === p.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setTagPopoverFor(null)} />
                            <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-md border border-hairline bg-surface-1 py-1 shadow-lg">
                              {tags.map((tag) => (
                                <button
                                  key={tag.id}
                                  onClick={() => { handleToggleTag(p.id, tag.name, pTags); setTagPopoverFor(null); }}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-surface-2"
                                >
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                                  <span className={cn("text-ink", pTags.includes(tag.name) && "font-medium text-primary")}>
                                    {tag.name}
                                  </span>
                                  {pTags.includes(tag.name) && <span className="ml-auto text-primary">✓</span>}
                                </button>
                              ))}
                              {tags.length === 0 && (
                                <p className="px-3 py-2 text-xs text-ink-subtle">Crée un tag d&apos;abord</p>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p.id, e.target.value)}
                        className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_LABELS[p.status]?.color)}
                        style={{ background: "transparent" }}
                      >
                        {Object.entries(STATUS_LABELS).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      {new Date(p.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={generateWhatsAppLink(p.phone, `Bonjour ${p.name} !`)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-ink-subtle">Page {page} sur {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} className="rounded-md border border-hairline p-2 text-ink-subtle transition-colors hover:bg-surface-2 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} className="rounded-md border border-hairline p-2 text-ink-subtle transition-colors hover:bg-surface-2 disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {detailProspect && (
          <ProspectDetailSheet
            prospect={detailProspect}
            onClose={() => setDetailProspect(null)}
          />
        )}
      </AnimatePresence>

      {showImport && (
        <ImportCsvDialog onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}
