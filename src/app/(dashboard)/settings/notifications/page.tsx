"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-headline text-ink">
        Paramètres
      </h1>

      <div className="mt-8 max-w-2xl space-y-8">
        <div className="rounded-lg border border-hairline bg-surface-1 p-6">
          <h2 className="text-lg font-semibold tracking-card-title text-ink">
            Compte
          </h2>
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs text-ink-subtle">Nom</p>
              <p className="text-sm text-ink">{session?.user?.name}</p>
            </div>
            <div>
              <p className="text-xs text-ink-subtle">Email</p>
              <p className="text-sm text-ink">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-hairline bg-surface-1 p-6">
          <h2 className="text-lg font-semibold tracking-card-title text-ink">
            Déconnexion
          </h2>
          <p className="mt-1 text-sm text-ink-subtle">
            Ferme ta session sur cet appareil
          </p>
          <button
            onClick={handleSignOut}
            className="mt-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
