"use client";

import { useState, useEffect } from "react";
import { Monitor } from "lucide-react";

export function DesktopGate({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < 1024);
      setChecked(true);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!checked) return null;

  if (isMobile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#010102] px-8 text-center">
        <div className="rounded-2xl border border-white/[0.06] bg-[#111110] p-10">
          <Monitor className="mx-auto mb-6 h-12 w-12 text-[#5e6ad2]" />
          <h1
            className="mb-3 text-2xl font-bold text-white"
            style={{ letterSpacing: "-0.02em" }}
          >
            Ouvre Prospecto sur un ordinateur
          </h1>
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-[#8a8f98]">
            Prospecto est conçu pour les écrans larges. Connecte-toi depuis un
            PC ou un Mac pour accéder à ton CRM.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#8a8f98]/50">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#5e6ad2]" />
            prospecto.aboudouzinsou.site
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
