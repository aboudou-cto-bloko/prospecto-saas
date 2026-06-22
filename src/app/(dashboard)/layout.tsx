import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/lib/org-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.session || !session?.user) {
    redirect("/login");
  }

  if (!session.session.activeOrganizationId) {
    redirect("/create-org");
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-canvas p-8">{children}</main>
    </div>
  );
}
