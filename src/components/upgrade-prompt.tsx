"use client";

import { motion } from "framer-motion";
import { Lock, Zap, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

type Props = {
  feature: string;
  description: string;
  currentPlan: string;
  requiredPlan: string;
};

export function UpgradePrompt({ feature, description, currentPlan, requiredPlan }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-5"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-primary/20 p-2.5">
          <Lock className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-ink">{feature}</h3>
          <p className="mt-1 text-xs text-ink-subtle">{description}</p>
          <div className="mt-3 flex items-center gap-3">
            <Link
              href="/settings/billing"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover"
            >
              <Zap className="h-3 w-3" />
              Passer au {requiredPlan}
            </Link>
            <span className="text-[10px] text-ink-tertiary">
              Plan actuel : {currentPlan}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function UsageBar({
  label,
  used,
  max,
  showUpgrade = false,
}: {
  label: string;
  used: number;
  max: number;
  showUpgrade?: boolean;
}) {
  const percent = max > 0 ? Math.min((used / max) * 100, 100) : 0;
  const isWarning = percent >= 70;
  const isCritical = percent >= 90;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-subtle">{label}</span>
        <span className={`text-xs font-medium ${isCritical ? "text-destructive" : isWarning ? "text-warning" : "text-ink-muted"}`}>
          {used} / {isFinite(max) ? max : "∞"}
        </span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-surface-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-1.5 rounded-full transition-colors ${
            isCritical ? "bg-destructive" : isWarning ? "bg-warning" : "bg-primary"
          }`}
        />
      </div>
      {isCritical && showUpgrade && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2"
        >
          <Link
            href="/settings/billing"
            className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary-hover"
          >
            <TrendingUp className="h-3 w-3" />
            Limite presque atteinte — Upgrade
            <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}

export function FeatureGate({
  children,
  locked,
  feature,
  requiredPlan,
}: {
  children: React.ReactNode;
  locked: boolean;
  feature: string;
  requiredPlan: string;
}) {
  if (!locked) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-30 blur-[2px]">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-lg border border-hairline bg-surface-1/95 px-5 py-4 text-center shadow-lg backdrop-blur-sm">
          <Lock className="mx-auto mb-2 h-5 w-5 text-primary" />
          <p className="text-sm font-medium text-ink">{feature}</p>
          <Link
            href="/settings/billing"
            className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover"
          >
            <Zap className="h-3 w-3" /> Passer au {requiredPlan}
          </Link>
        </div>
      </div>
    </div>
  );
}
