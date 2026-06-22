"use client";

import { useState, useEffect, useTransition } from "react";
import {
  useActiveOrganization,
  useSession,
  authClient,
} from "@/lib/auth-client";
import { UserPlus, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

type MemberEntry = {
  id: string;
  userId: string;
  role: string;
  user: { name: string; email: string };
};

export default function OrganizationSettingsPage() {
  const { data: org, isPending: orgLoading } = useActiveOrganization();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [members, setMembers] = useState<MemberEntry[]>([]);

  useEffect(() => {
    if (!org?.id) return;
    authClient.organization
      .listMembers({ query: { organizationId: org.id } })
      .then((res) => {
        const data = res.data as unknown as
          | { members?: MemberEntry[] }
          | MemberEntry[]
          | null;
        if (Array.isArray(data)) {
          setMembers(data);
        } else if (data && Array.isArray(data.members)) {
          setMembers(data.members);
        }
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
        Gère les membres de{" "}
        <span className="text-ink">{org?.name ?? "..."}</span>
      </p>

      <div className="mt-8 max-w-2xl space-y-8">
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

        <div className="rounded-lg border border-hairline bg-surface-1 p-6">
          <h2 className="text-lg font-semibold tracking-card-title text-ink">
            Membres ({members.length})
          </h2>
          <div className="mt-4 divide-y divide-hairline">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {m.user.name}
                  </p>
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
            {members.length === 0 && !orgLoading && (
              <p className="py-4 text-center text-sm text-ink-subtle">
                Aucun membre trouvé
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
