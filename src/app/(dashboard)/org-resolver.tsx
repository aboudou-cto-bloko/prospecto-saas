"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function OrgResolver({ orgId }: { orgId: string }) {
  const router = useRouter();

  useEffect(() => {
    authClient.organization
      .setActive({ organizationId: orgId })
      .then(() => router.refresh());
  }, [orgId, router]);

  return null;
}
