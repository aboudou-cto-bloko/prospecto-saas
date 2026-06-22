import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/lib/org-context";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.session || !session?.user) {
    redirect("/login");
  }

  let orgId = session.session.activeOrganizationId;

  if (!orgId) {
    const membership = await prisma.member.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    });

    if (!membership) {
      redirect("/create-org");
    }

    orgId = membership.organizationId;

    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: { organizationId: orgId },
    });
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-canvas p-8">{children}</main>
    </div>
  );
}
