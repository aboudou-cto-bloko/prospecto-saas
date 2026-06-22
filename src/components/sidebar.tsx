"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Search,
  Settings,
  CreditCard,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Prospects", href: "/prospects", icon: Users },
  { name: "Campagnes", href: "/campaigns", icon: Megaphone },
  { name: "Scraper", href: "/scrape", icon: Search },
];

const settingsNavigation = [
  { name: "Organisation", href: "/settings/organization", icon: Building2 },
  { name: "Abonnement", href: "/settings/billing", icon: CreditCard },
  { name: "Paramètres", href: "/settings/notifications", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-hairline bg-surface-1">
      <div className="flex h-14 items-center px-5">
        <Link
          href="/dashboard"
          className="text-[15px] font-semibold text-ink"
        >
          ◆ Prospecto
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navigation.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-surface-2 text-ink"
                  : "text-ink-subtle hover:bg-surface-2 hover:text-ink"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-hairline px-3 py-3">
        {settingsNavigation.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-surface-2 text-ink"
                  : "text-ink-subtle hover:bg-surface-2 hover:text-ink"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
