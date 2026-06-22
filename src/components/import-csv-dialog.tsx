"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Upload, X, FileSpreadsheet, ArrowRight, Check } from "lucide-react";
import { importProspects } from "@/actions/prospects";
import { getCustomFields } from "@/actions/custom-fields";
import { toast } from "sonner";
import Papa from "papaparse";

type Field = { id: string; name: string; label: string };
type CsvRow = Record<string, string>;

const BUILTIN_FIELDS = [
  { key: "name", label: "Nom (requis)" },
  { key: "phone", label: "Téléphone (requis)" },
  { key: "__skip__", label: "— Ignorer —" },
];

type Props = {
  onClose: () => void;
};

export function ImportCsvDialog({ onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"upload" | "map" | "result">("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<Field[]>([]);
  const [result, setResult] = useState<{ added: number; total: number; skipped: number } | null>(null);

  useEffect(() => {
    getCustomFields().then(setCustomFields).catch(() => {});
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          toast.error("Le fichier CSV est vide");
          return;
        }
        const cols = results.meta.fields ?? [];
        setHeaders(cols);
        setRows(results.data);

        const autoMap: Record<string, string> = {};
        for (const col of cols) {
          const lower = col.toLowerCase().trim();
          if (lower === "nom" || lower === "name") autoMap[col] = "name";
          else if (lower === "telephone" || lower === "phone" || lower === "tel" || lower === "téléphone") autoMap[col] = "phone";
          else autoMap[col] = "__skip__";
        }
        setMapping(autoMap);
        setStep("map");
      },
      error: () => {
        toast.error("Erreur de lecture du fichier CSV");
      },
    });
  }

  function handleImport() {
    const nameCol = Object.entries(mapping).find(([, v]) => v === "name")?.[0];
    const phoneCol = Object.entries(mapping).find(([, v]) => v === "phone")?.[0];

    if (!nameCol || !phoneCol) {
      toast.error("Les colonnes Nom et Téléphone sont requises");
      return;
    }

    const metaCols = Object.entries(mapping).filter(
      ([, v]) => v !== "name" && v !== "phone" && v !== "__skip__"
    );

    const prospects = rows
      .filter((row) => row[nameCol]?.trim() && row[phoneCol]?.trim())
      .map((row) => {
        const metadata: Record<string, string> = {};
        for (const [col, field] of metaCols) {
          if (row[col]?.trim()) metadata[field] = row[col].trim();
        }
        return {
          name: row[nameCol].trim(),
          phone: row[phoneCol].trim(),
          ...(Object.keys(metadata).length > 0 ? { metadata } : {}),
        };
      });

    if (prospects.length === 0) {
      toast.error("Aucune ligne valide trouvée");
      return;
    }

    startTransition(async () => {
      try {
        const res = await importProspects(prospects);
        setResult(res);
        setStep("result");
        toast.success(`${res.added} prospect(s) importé(s)`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur d'import");
      }
    });
  }

  const allTargets = [
    ...BUILTIN_FIELDS,
    ...customFields.map((f) => ({ key: f.name, label: `{{${f.name}}} — ${f.label}` })),
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-hairline bg-surface-1 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <h2 className="text-lg font-semibold tracking-card-title text-ink">
            Importer un fichier CSV
          </h2>
          <button onClick={onClose} className="text-ink-subtle hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="flex flex-col items-center py-8">
              <FileSpreadsheet className="mb-4 h-12 w-12 text-ink-tertiary" />
              <p className="mb-2 text-sm font-medium text-ink">
                Glisse ton fichier CSV ici
              </p>
              <p className="mb-6 text-xs text-ink-subtle">
                Colonnes attendues : nom, telephone + tes variables personnalisées
              </p>
              <div className="mb-6 flex items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
                >
                  <Upload className="mr-2 inline h-4 w-4" />
                  Choisir un fichier
                </button>
                <a
                  href="/exemple-import.csv"
                  download
                  className="rounded-md border border-hairline px-4 py-2 text-sm text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <FileSpreadsheet className="mr-2 inline h-4 w-4" />
                  Fichier exemple
                </a>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFile}
                className="hidden"
              />
            </div>
          )}

          {/* Step 2: Mapping */}
          {step === "map" && (
            <div>
              <p className="mb-4 text-sm text-ink-subtle">
                {rows.length} ligne{rows.length > 1 ? "s" : ""} détectée
                {rows.length > 1 ? "s" : ""}. Associe chaque colonne CSV à un
                champ Prospecto.
              </p>

              <div className="space-y-2">
                {headers.map((col) => (
                  <div key={col} className="flex items-center gap-3">
                    <span className="w-40 truncate rounded bg-surface-3 px-3 py-1.5 font-mono text-xs text-ink">
                      {col}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-tertiary" />
                    <select
                      value={mapping[col] ?? "__skip__"}
                      onChange={(e) =>
                        setMapping((m) => ({ ...m, [col]: e.target.value }))
                      }
                      className="flex-1 rounded-md border border-hairline bg-canvas px-3 py-1.5 text-sm text-ink focus:border-primary focus:outline-none"
                    >
                      {allTargets.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div className="mt-4 max-h-32 overflow-auto rounded-md border border-hairline bg-canvas">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-hairline text-ink-subtle">
                      {headers.map((h) => (
                        <th key={h} className="px-2 py-1 text-left font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-b border-hairline last:border-0">
                        {headers.map((h) => (
                          <td key={h} className="px-2 py-1 text-ink-muted">
                            {row[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setStep("upload")}
                  className="rounded-md border border-hairline px-4 py-2 text-sm text-ink-muted hover:bg-surface-2"
                >
                  Retour
                </button>
                <button
                  onClick={handleImport}
                  disabled={isPending}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  {isPending
                    ? "Import en cours…"
                    : `Importer ${rows.length} ligne${rows.length > 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Result */}
          {step === "result" && result && (
            <div className="flex flex-col items-center py-8">
              <div className="mb-4 rounded-full bg-success/20 p-3">
                <Check className="h-6 w-6 text-success" />
              </div>
              <p className="mb-1 text-lg font-semibold text-ink">
                Import terminé
              </p>
              <p className="mb-6 text-sm text-ink-subtle">
                {result.added} ajouté{result.added > 1 ? "s" : ""} ·{" "}
                {result.skipped} doublon{result.skipped > 1 ? "s" : ""} ignoré
                {result.skipped > 1 ? "s" : ""}
              </p>
              <button
                onClick={onClose}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
