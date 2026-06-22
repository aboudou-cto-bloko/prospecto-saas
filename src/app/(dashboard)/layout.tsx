import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/lib/org-context";
import { prisma } from "@/lib/prisma";
import { OrgResolver } from "./org-resolver";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.session || !session?.user) {
    redirect("/login");
  }

  const hasOrg = !!session.session.activeOrganizationId;

  let fallbackOrgId: string | null = null;
  if (!hasOrg) {
    const membership = await prisma.member.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });
    if (!membership) {
      redirect("/create-org");
    }
    fallbackOrgId = membership.organizationId;
  }

  return (
    <div className="flex h-screen">
      {!hasOrg && fallbackOrgId && <OrgResolver orgId={fallbackOrgId} />}
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-canvas p-8">{children}</main>
    </div>
  );
}
