"use client";

import { useState, useEffect, useTransition } from "react";
import {
  useActiveOrganization,
  useSession,
  authClient,
} from "@/lib/auth-client";
import { UserPlus, Trash2, Shield, Key, Copy, Check, Eye, EyeOff, Terminal } from "lucide-react";
import { toast } from "sonner";

type MemberEntry = {
  id: string;
  userId: string;
  role: string;
  user: { name: string; email: string };
};

type ApiKeyEntry = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
};

export default function OrganizationSettingsPage() {
  const { data: org, isPending: orgLoading } = useActiveOrganization();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [members, setMembers] = useState<MemberEntry[]>([]);

  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    if (!org?.id) return;
    authClient.organization
      .listMembers({ query: { organizationId: org.id } })
      .then((res) => {
        const data = res.data as unknown as
          | { members?: MemberEntry[] }
          | MemberEntry[]
          | null;
        if (Array.isArray(data)) setMembers(data);
        else if (data && Array.isArray(data.members)) setMembers(data.members);
      })
      .catch(() => {});

    fetch("/api/v1/keys")
      .then((r) => r.json())
      .then((d: { keys?: ApiKeyEntry[] }) => {
        if (d.keys) setApiKeys(d.keys);
      })
      .catch(() => {});
  }, [org?.id]);

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!org?.id) return;
    startTransition(async () => {
      try {
        const result = await authClient.organization.inviteMember({
          organizationId: org.id,
          email: inviteEmail,
          role: inviteRole as "admin" | "member",
        });
        if (result.error) {
          toast.error(result.error.message ?? "Erreur");
        } else {
          toast.success(`Invitation envoyée à ${inviteEmail}`);
          setInviteEmail("");
        }
      } catch {
        toast.error("Erreur lors de l'invitation");
      }
    });
  }

  function handleRemoveMember(memberId: string) {
    startTransition(async () => {
      try {
        const result = await authClient.organization.removeMember({
          memberIdOrEmail: memberId,
        });
        if (result.error) {
          toast.error(result.error.message ?? "Erreur");
        } else {
          setMembers((prev) => prev.filter((m) => m.id !== memberId));
          toast.success("Membre retiré");
        }
      } catch {
        toast.error("Erreur lors du retrait");
      }
    });
  }

  function handleCreateKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/v1/keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newKeyName.trim() }),
        });
        const data = (await res.json()) as { key?: string; error?: string };
        if (data.key) {
          setCreatedKey(data.key);
          setNewKeyName("");
          toast.success("Clé API générée");
          fetch("/api/v1/keys")
            .then((r) => r.json())
            .then((d: { keys?: ApiKeyEntry[] }) => { if (d.keys) setApiKeys(d.keys); })
            .catch(() => {});
        } else {
          toast.error(data.error ?? "Erreur");
        }
      } catch {
        toast.error("Erreur de connexion");
      }
    });
  }

  function handleDeleteKey(id: string) {
    startTransition(async () => {
      try {
        await fetch("/api/v1/keys", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
        toast.success("Clé révoquée");
      } catch {
        toast.error("Erreur");
      }
    });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (orgLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-surface-2" />
        <div className="h-64 rounded-lg bg-surface-1" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-headline text-ink">
        Organisation
      </h1>
      <p className="mt-1 text-sm text-ink-subtle">
        Gère les membres et les accès API de{" "}
        <span className="text-ink">{org?.name ?? "..."}</span>
      </p>

      <div className="mt-8 max-w-2xl space-y-8">
        {/* ── Invite member ── */}
        <div className="rounded-lg border border-hairline bg-surface-1 p-6">
          <h2 className="text-lg font-semibold tracking-card-title text-ink">
            Inviter un membre
          </h2>
          <form onSubmit={handleInvite} className="mt-4 flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              placeholder="email@exemple.com"
              className="flex-1 rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
            >
              <option value="member">Membre</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              Inviter
            </button>
          </form>
        </div>

        {/* ── Members ── */}
        <div className="rounded-lg border border-hairline bg-surface-1 p-6">
          <h2 className="text-lg font-semibold tracking-card-title text-ink">
            Membres ({members.length})
          </h2>
          <div className="mt-4 divide-y divide-hairline">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{m.user.name}</p>
                  <p className="text-xs text-ink-subtle">{m.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 rounded-full bg-surface-3 px-2.5 py-0.5 text-xs text-ink-muted">
                    <Shield className="h-3 w-3" />
                    {m.role}
                  </span>
                  {m.userId !== session?.user?.id && m.role !== "owner" && (
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      disabled={isPending}
                      className="rounded-md p-1.5 text-ink-subtle hover:bg-destructive/20 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <p className="py-4 text-center text-sm text-ink-subtle">
                Aucun membre trouvé
              </p>
            )}
          </div>
        </div>

        {/* ── API Keys ── */}
        <div className="rounded-lg border border-hairline bg-surface-1 p-6">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold tracking-card-title text-ink">
              Clés API
            </h2>
          </div>
          <p className="mt-1 text-xs text-ink-subtle">
            Connecte Prospecto à tes agents IA via le MCP. Chaque appel API consomme des crédits.
          </p>

          {/* Create key */}
          <form onSubmit={handleCreateKey} className="mt-4 flex gap-3">
            <input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              required
              placeholder="Nom de la clé (ex: Claude Desktop)"
              className="flex-1 rounded-md border border-hairline bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-tertiary focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              <Key className="h-4 w-4" />
              Générer
            </button>
          </form>

          {/* Newly created key */}
          {createdKey && (
            <div className="mt-4 rounded-lg border border-success/30 bg-success/10 p-4">
              <p className="mb-2 text-xs font-medium text-success">
                Clé générée — copie-la maintenant, elle ne sera plus affichée.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 break-all rounded bg-canvas px-3 py-2 font-mono text-xs text-ink">
                  {createdKey}
                </code>
                <button
                  onClick={() => copyToClipboard(createdKey)}
                  className="shrink-0 rounded-md bg-success/20 p-2 text-success hover:bg-success/30"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Key list */}
          <div className="mt-4 divide-y divide-hairline">
            {apiKeys.map((k) => (
              <div key={k.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{k.name}</p>
                  <p className="font-mono text-xs text-ink-tertiary">
                    {k.keyPrefix}••••••••
                    {k.lastUsedAt && (
                      <span className="ml-2 font-sans text-ink-subtle">
                        Utilisée {new Date(k.lastUsedAt).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteKey(k.id)}
                  disabled={isPending}
                  className="rounded-md p-1.5 text-ink-subtle hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {apiKeys.length === 0 && (
              <p className="py-3 text-center text-xs text-ink-subtle">
                Aucune clé API — génère-en une pour utiliser le MCP
              </p>
            )}
          </div>
        </div>

        {/* ── MCP Install ── */}
        <div className="rounded-lg border border-hairline bg-surface-1 p-6">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold tracking-card-title text-ink">
              Installer le MCP
            </h2>
          </div>
          <p className="mt-1 text-xs text-ink-subtle">
            Connecte Prospecto à Claude, Cursor ou tout client MCP compatible.
          </p>

          <div className="mt-4 space-y-3">
            {/* Claude Code */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-ink-muted">Claude Code</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-canvas px-3 py-2 font-mono text-xs text-ink">
                  claude mcp add prospecto -- npx -y github:aboudou-cto-bloko/prospecto-mcp
                </code>
                <button
                  onClick={() => { copyToClipboard("claude mcp add prospecto -- npx -y github:aboudou-cto-bloko/prospecto-mcp"); toast.success("Commande copiée"); }}
                  className="shrink-0 rounded-md border border-hairline p-2 text-ink-subtle hover:bg-surface-2"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Claude Desktop / Cursor */}
            <div>
              <button
                onClick={() => setShowInstall(!showInstall)}
                className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary-hover"
              >
                {showInstall ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showInstall ? "Masquer" : "Voir"} la config Claude Desktop / Cursor
              </button>
              {showInstall && (
                <div className="mt-2 rounded-md bg-canvas p-3">
                  <p className="mb-1 text-[10px] text-ink-tertiary">
                    Ajoute dans le fichier de config MCP :
                  </p>
                  <pre className="overflow-x-auto whitespace-pre text-xs text-ink-muted">
{`{
  "mcpServers": {
    "prospecto": {
      "command": "npx",
      "args": ["-y", "github:aboudou-cto-bloko/prospecto-mcp"],
      "env": {
        "PROSPECTO_API_KEY": "${createdKey || "psk_ta_cle_ici"}"
      }
    }
  }
}`}
                  </pre>
                  <button
                    onClick={() => {
                      const config = JSON.stringify({
                        mcpServers: {
                          prospecto: {
                            command: "npx",
                            args: ["-y", "github:aboudou-cto-bloko/prospecto-mcp"],
                            env: { PROSPECTO_API_KEY: createdKey || "psk_ta_cle_ici" },
                          },
                        },
                      }, null, 2);
                      copyToClipboard(config);
                      toast.success("Config copiée");
                    }}
                    className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover"
                  >
                    <Copy className="h-3 w-3" /> Copier la config
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tools list */}
          <div className="mt-4 border-t border-hairline pt-4">
            <p className="mb-2 text-xs font-medium text-ink-tertiary uppercase tracking-wider">
              10 tools disponibles
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { name: "list_prospects", cost: "0" },
                { name: "create_prospect", cost: "1" },
                { name: "update_prospect", cost: "1" },
                { name: "delete_prospect", cost: "0" },
                { name: "get_stats", cost: "0" },
                { name: "list_campaigns", cost: "0" },
                { name: "create_campaign", cost: "1" },
                { name: "list_tags", cost: "0" },
                { name: "scrape_goafrica", cost: "5" },
                { name: "get_prospect", cost: "0" },
              ].map((t) => (
                <div key={t.name} className="flex items-center justify-between rounded bg-canvas px-2.5 py-1.5">
                  <code className="font-mono text-[11px] text-ink-muted">{t.name}</code>
                  <span className={`text-[10px] font-medium ${t.cost === "0" ? "text-ink-tertiary" : "text-primary"}`}>
                    {t.cost === "0" ? "gratuit" : `${t.cost} crédit${parseInt(t.cost) > 1 ? "s" : ""}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
