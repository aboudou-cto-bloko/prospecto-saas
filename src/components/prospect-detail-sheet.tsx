"use client";

import { useState, useEffect, useTransition } from "react";
import { motion } from "framer-motion";
import {
  X, Save, MessageCircle, Loader2, Calendar, Globe, Phone,
  User, Tag, FileText, Hash, MapPin, ExternalLink,
} from "lucide-react";
import { updateProspect, updateProspectStatus, updateProspectTags } from "@/actions/prospects";
import { getCustomFields } from "@/actions/custom-fields";
import { getTags } from "@/actions/tags";
import { generateWhatsAppLink } from "@/lib/template";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TagBadge } from "@/components/tag-badge";
import type { Prospect, Tag as TagType } from "@/generated/prisma/client";

type Field = { id: string; name: string; label: string };

const STATUS_OPTIONS = [
  { value: "NEW", label: "Nouveau", color: "bg-blue-500/20 text-blue-400" },
  { value: "CONTACTED", label: "Contacté", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "QUALIFIED", label: "Qualifié", color: "bg-purple-500/20 text-purple-400" },
  { value: "CONVERTED", label: "Converti", color: "bg-emerald-500/20 text-emerald-400" },
  { value: "LOST", label: "Perdu", color: "bg-red-500/20 text-red-400" },
];

type Props = {
  prospect: Prospect;
  onClose: () => void;
};

export function ProspectDetailSheet({ prospect, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [fields, setFields] = useState<Field[]>([]);
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [status, setStatus] = useState<string>(prospect.status);
  const [form, setForm] = useState({
    name: prospect.name,
    phone: prospect.phone,
    website: prospect.website ?? "",
    category: prospect.category ?? "",
    notes: prospect.notes ?? "",
  });
  const [meta, setMeta] = useState<Record<string, string>>(() => {
    if (prospect.metadata && typeof prospect.metadata === "object") {
      const raw = prospect.metadata as Record<string, unknown>;
      const result: Record<string, string> = {};
      for (const [k, v] of Object.entries(raw)) {
        if (typeof v === "string") result[k] = v;
      }
      return result;
    }
    return {};
  });
  const [prospectTags, setProspectTags] = useState<string[]>(() => {
    try {
      const raw = prospect.tags;
      if (Array.isArray(raw)) return raw as string[];
      if (typeof raw === "string") {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as string[];
      }
      return [];
    } catch { return []; }
  });

  useEffect(() => {
    getCustomFields().then(setFields).catch(() => {});
    getTags().then(setAllTags).catch(() => {});
  }, []);

  function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    startTransition(async () => {
      try {
        await updateProspectStatus(prospect.id, newStatus as "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "LOST");
        toast.success(`Statut → ${STATUS_OPTIONS.find((s) => s.value === newStatus)?.label}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  function handleToggleTag(tagName: string) {
    const newTags = prospectTags.includes(tagName)
      ? prospectTags.filter((t) => t !== tagName)
      : [...prospectTags, tagName];
    setProspectTags(newTags);
    startTransition(async () => {
      try {
        await updateProspectTags(prospect.id, newTags);
        toast.success(prospectTags.includes(tagName) ? `Tag "${tagName}" retiré` : `Tag "${tagName}" ajouté`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await updateProspect(prospect.id, { ...form, metadata: meta });
        toast.success("Prospect mis à jour");
        onClose();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  }

  const createdDate = new Date(prospect.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-hairline bg-surface-1"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold tracking-card-title text-ink">
              {prospect.name}
            </h2>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-subtle">
              <Calendar className="h-3 w-3" />
              {createdDate}
              <span className="text-ink-tertiary">·</span>
              <span className="capitalize">{prospect.source.replace(/_/g, " ").toLowerCase()}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-subtle hover:bg-surface-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">

          {/* Status */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink-tertiary">
              Statut
            </label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleStatusChange(s.value)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-all",
                    status === s.value
                      ? `${s.color} ring-1 ring-current`
                      : "bg-surface-2 text-ink-subtle hover:bg-surface-3"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink-tertiary">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => {
                const active = prospectTags.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleToggleTag(tag.name)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs transition-all",
                      active
                        ? "ring-1 ring-current"
                        : "opacity-40 hover:opacity-70"
                    )}
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </button>
                );
              })}
              {allTags.length === 0 && (
                <span className="text-xs text-ink-tertiary">Aucun tag créé</span>
              )}
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-3">
            <label className="block text-xs font-medium uppercase tracking-wider text-ink-tertiary">
              Informations
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-tertiary" />
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nom"
                className="w-full rounded-md border border-hairline bg-canvas py-2 pl-9 pr-3 text-sm text-ink focus:border-primary focus:outline-none"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-tertiary" />
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Téléphone"
                className="w-full rounded-md border border-hairline bg-canvas py-2 pl-9 pr-3 text-sm text-ink focus:border-primary focus:outline-none"
              />
            </div>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-tertiary" />
              <input
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="Site web"
                className="w-full rounded-md border border-hairline bg-canvas py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none"
              />
            </div>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-tertiary" />
              <input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Catégorie / secteur"
                className="w-full rounded-md border border-hairline bg-canvas py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-ink-tertiary">
              <FileText className="h-3.5 w-3.5" />
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={5}
              placeholder="Ajoute des notes sur ce prospect…"
              className="w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none"
            />
          </div>

          {/* Metadata from scraping */}
          {Object.keys(meta).length > 0 && !fields.length && (
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink-tertiary">
                Données collectées
              </label>
              <div className="space-y-1.5 rounded-md bg-canvas p-3">
                {Object.entries(meta).map(([key, value]) => {
                  if (!value || key === "scrapedAt") return null;
                  const isUrl = typeof value === "string" && value.startsWith("http");
                  return (
                    <div key={key} className="flex items-start gap-2 text-xs">
                      <span className="shrink-0 font-mono text-ink-tertiary">{key}</span>
                      {isUrl ? (
                        <a href={value} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:text-primary-hover">
                          {value.slice(0, 40)}… <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-ink-muted">{String(value)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom fields */}
          {fields.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink-tertiary">
                Variables personnalisées
              </label>
              <div className="space-y-3">
                {fields.map((field) => (
                  <div key={field.id}>
                    <label className="mb-1 flex items-center gap-2 text-xs text-ink-subtle">
                      {field.label}
                      <code className="rounded bg-surface-3 px-1 py-0.5 font-mono text-[10px] text-ink-tertiary">
                        {`{{${field.name}}}`}
                      </code>
                    </label>
                    <input
                      value={meta[field.name] ?? ""}
                      onChange={(e) => setMeta((prev) => ({ ...prev, [field.name]: e.target.value }))}
                      placeholder={`Valeur de ${field.label}`}
                      className="w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-3 border-t border-hairline px-6 py-4">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isPending ? "Sauvegarde…" : "Sauvegarder"}
          </button>
          <a
            href={generateWhatsAppLink(prospect.phone, `Bonjour ${prospect.name} !`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md bg-success/20 px-4 py-2 text-sm font-medium text-success transition-colors hover:bg-success/30"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </motion.div>
    </>
  );
}
