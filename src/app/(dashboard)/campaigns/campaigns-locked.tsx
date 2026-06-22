"use client";

import { motion } from "framer-motion";
import { Lock, Megaphone, Zap, MessageCircle, BarChart3, Send } from "lucide-react";
import Link from "next/link";

const PREVIEW_FEATURES = [
  { icon: MessageCircle, label: "Templates personnalisés", desc: "{{nom}}, {{entreprise}}, {{ville}}…" },
  { icon: Send, label: "Liens WhatsApp en 1 clic", desc: "wa.me/ pré-rempli par prospect" },
  { icon: BarChart3, label: "Suivi des envois", desc: "Envoyé, en attente, converti" },
];

export function CampaignsLocked({ planId }: { planId: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-headline text-ink">
        Campagnes
      </h1>
      <p className="mt-1 text-sm text-ink-subtle">
        Envoie des messages WhatsApp personnalisés à tes prospects
      </p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 overflow-hidden rounded-xl border border-primary/20"
      >
        {/* Preview blurred */}
        <div className="relative">
          <div className="pointer-events-none select-none bg-surface-1 p-6 opacity-40 blur-[3px]">
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-hairline bg-canvas p-5">
                  <div className="mb-2 h-4 w-32 rounded bg-surface-3" />
                  <div className="mb-4 h-3 w-20 rounded bg-surface-3" />
                  <div className="h-3 w-full rounded bg-surface-3" />
                </div>
              ))}
            </div>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-canvas/60 to-canvas/90 px-6 py-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="rounded-full bg-primary/20 p-4"
            >
              <Lock className="h-8 w-8 text-primary" />
            </motion.div>
            <h2 className="mt-4 text-xl font-semibold text-ink">
              Campagnes WhatsApp
            </h2>
            <p className="mt-1 text-sm text-ink-subtle">
              Disponible à partir du plan Starter
            </p>
            <Link
              href="/settings/billing"
              className="mt-4 flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-hover hover:scale-[1.02]"
            >
              <Zap className="h-4 w-4" />
              Débloquer — 5 000 F/mois
            </Link>
          </div>
        </div>

        {/* Feature preview */}
        <div className="border-t border-hairline bg-surface-1 px-6 py-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-tertiary">
            Ce que tu débloques
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {PREVIEW_FEATURES.map((f) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 rounded-lg bg-canvas p-3"
              >
                <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-medium text-ink">{f.label}</p>
                  <p className="text-[10px] text-ink-subtle">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
