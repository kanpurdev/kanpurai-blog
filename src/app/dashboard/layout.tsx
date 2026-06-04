import { requireUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = await prisma.notification.count({ where: { userId: user.id, read: false } });
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar role={user.role} />
      <div className="flex flex-1 flex-col">
        <Topbar user={user} unread={unread} />
        <main className="flex-1 bg-muted/20 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
