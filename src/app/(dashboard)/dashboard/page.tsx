import { getDashboardStats } from "@/actions/dashboard";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return <DashboardContent stats={stats} />;
}
