"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tags, Plus, Trash2, X } from "lucide-react";
import { getTags, createTag, deleteTag } from "@/actions/tags";

type Tag = { id: string; name: string; color: string };

const DEFAULT_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#ec4899",
];

export function TagManager({
  onTagsChange,
}: {
  onTagsChange?: (tags: Tag[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_COLORS[0]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open) getTags().then(setTags);
  }, [open]);

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const tag = await createTag({ name: newName.trim(), color: newColor });
      const updated = [...tags, tag];
      setTags(updated);
      onTagsChange?.(updated);
      setNewName("");
      toast.success("Tag créé");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    try {
      await deleteTag(id);
      const updated = tags.filter((t) => t.id !== id);
      setTags(updated);
      onTagsChange?.(updated);
      toast.success(`Tag "${name}" supprimé`);
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
        <Tags className="h-3.5 w-3.5" /> Tags
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-hairline bg-surface-1 p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-ink">Gérer les tags</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-ink-tertiary hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-3 flex gap-2">
              <input
                placeholder="Nom du tag"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="flex-1 rounded-md border border-hairline bg-canvas px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none"
              />
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-7 w-7 cursor-pointer rounded border border-hairline bg-transparent p-0.5"
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="rounded-md bg-primary p-1.5 text-white disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mb-3 flex flex-wrap gap-1">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className="h-4 w-4 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: newColor === c ? "white" : "transparent",
                  }}
                />
              ))}
            </div>

            <div className="max-h-40 space-y-1 overflow-y-auto">
              {tags.length === 0 && (
                <p className="py-2 text-center text-xs text-ink-subtle">
                  Aucun tag
                </p>
              )}
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-2"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1 text-xs text-ink">{tag.name}</span>
                  <button
                    onClick={() => handleDelete(tag.id, tag.name)}
                    className="text-ink-tertiary hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
