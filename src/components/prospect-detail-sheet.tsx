"use client";

import { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, MessageCircle, Loader2 } from "lucide-react";
import { updateProspect } from "@/actions/prospects";
import { getCustomFields } from "@/actions/custom-fields";
import { generateWhatsAppLink } from "@/lib/template";
import { toast } from "sonner";
import type { Prospect } from "@/generated/prisma/client";

type Field = { id: string; name: string; label: string };

type Props = {
  prospect: Prospect;
  onClose: () => void;
};

export function ProspectDetailSheet({ prospect, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [fields, setFields] = useState<Field[]>([]);
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

  useEffect(() => {
    getCustomFields().then(setFields).catch(() => {});
  }, []);

  function handleMetaChange(key: string, value: string) {
    setMeta((prev) => ({ ...prev, [key]: value }));
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
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-hairline bg-surface-1">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <h2 className="text-lg font-semibold tracking-card-title text-ink">
            {prospect.name}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-ink-subtle hover:bg-surface-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* Base fields */}
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-ink-subtle">Nom</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-ink-subtle">Téléphone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-ink-subtle">Site web</label>
              <input
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                placeholder="https://..."
                className="w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-ink-subtle">Catégorie</label>
              <input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-ink-subtle">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Custom fields / metadata */}
          {fields.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-tertiary">
                Variables personnalisées
              </h3>
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
                      onChange={(e) => handleMetaChange(field.name, e.target.value)}
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
