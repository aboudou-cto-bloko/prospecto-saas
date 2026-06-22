"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Settings2, Plus, Trash2, X } from "lucide-react";
import { getCustomFields, createCustomField, deleteCustomField } from "@/actions/custom-fields";

type Field = { id: string; name: string; label: string };

export function CustomFieldManager() {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<Field[]>([]);
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) getCustomFields().then(setFields);
  }, [open]);

  function handleLabelChange(value: string) {
    setLabel(value);
    setSlug(
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "")
    );
  }

  async function handleCreate() {
    if (!slug.trim() || !label.trim()) return;
    setCreating(true);
    try {
      const field = await createCustomField({ name: slug, label });
      setFields((f) => [...f, field]);
      setSlug("");
      setLabel("");
      toast.success(`Variable {{${field.name}}} créée`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    try {
      await deleteCustomField(id);
      setFields((f) => f.filter((field) => field.id !== id));
      toast.success(`Variable {{${name}}} supprimée`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md border border-hairline px-3 py-1.5 text-xs text-ink-subtle transition-colors hover:bg-surface-2"
      >
        <Settings2 className="h-3.5 w-3.5" /> Variables
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-hairline bg-surface-1 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-ink">
                Variables personnalisées
              </h3>
              <button onClick={() => setOpen(false)} className="text-ink-tertiary hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-3 text-[11px] text-ink-subtle">
              Utilisables dans les templates : {"{{nom_variable}}"}
            </p>

            <div className="mb-3 space-y-2">
              <input
                placeholder="Libellé (ex: Entreprise)"
                value={label}
                onChange={(e) => handleLabelChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="w-full rounded-md border border-hairline bg-canvas px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-surface-3 px-2 py-1 font-mono text-[11px] text-ink-muted">
                  {"{{"}
                  {slug || "..."}
                  {"}}"}
                </code>
                <button
                  onClick={handleCreate}
                  disabled={creating || !slug.trim() || !label.trim()}
                  className="rounded-md bg-primary p-1.5 text-white disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="mb-2 border-t border-hairline pt-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-ink-tertiary">
                  Variables par défaut
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {["nom", "telephone"].map((v) => (
                    <code
                      key={v}
                      className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-ink-subtle"
                    >
                      {`{{${v}}}`}
                    </code>
                  ))}
                </div>
              </div>

              {fields.length > 0 && (
                <div className="border-t border-hairline pt-2">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-ink-tertiary">
                    Personnalisées
                  </p>
                  {fields.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-2"
                    >
                      <code className="font-mono text-[11px] text-primary">
                        {`{{${f.name}}}`}
                      </code>
                      <span className="flex-1 text-xs text-ink-muted">
                        {f.label}
                      </span>
                      <button
                        onClick={() => handleDelete(f.id, f.name)}
                        className="text-ink-tertiary hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
